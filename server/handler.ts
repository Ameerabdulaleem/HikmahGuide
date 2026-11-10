import { llmFromEnv, type LlmClient } from './llm.js'
import { createQuranClient, type QuranClient } from './quranClient.js'
import { SlidingWindowLimiter } from './rateLimit.js'
import { parseRequest, type ValidRequest } from './request.js'
import { generateGuidance } from './service.js'
import type { GuidanceResult } from '../src/shared/types.js'

// Framework neutral request handling, shared by the Vercel function and the Vite dev server.

export interface HandlerInput {
  method?: string
  headers: Record<string, string | string[] | undefined>
  body: unknown
}

export interface HandlerOutput {
  status: number
  headers: Record<string, string>
  body: unknown
}

export interface HandlerDeps {
  generate: (request: ValidRequest) => Promise<GuidanceResult>
  limiter: Pick<SlidingWindowLimiter, 'check'>
  timeoutMs: number
}

const BASE_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
}

function reply(status: number, body: unknown, extra: Record<string, string> = {}): HandlerOutput {
  return { status, headers: { ...BASE_HEADERS, ...extra }, body }
}

function header(headers: HandlerInput['headers'], name: string): string {
  const value = headers[name]
  return (Array.isArray(value) ? value[0] : value) ?? ''
}

/** The platform sets these headers itself, so a client can not choose its own address. */
export function clientKey(headers: HandlerInput['headers']): string {
  const forwarded = header(headers, 'x-vercel-forwarded-for') || header(headers, 'x-real-ip') || header(headers, 'x-forwarded-for')
  return forwarded.split(',')[0].trim().slice(0, 64) || 'unknown'
}

export function createHandler(deps: HandlerDeps) {
  return async function handle(input: HandlerInput): Promise<HandlerOutput> {
    if (input.method !== 'POST') return reply(405, { error: 'Method not allowed' }, { Allow: 'POST' })

    if (!header(input.headers, 'content-type').toLowerCase().includes('application/json')) {
      return reply(415, { error: 'Content-Type must be application/json' })
    }

    const decision = deps.limiter.check(clientKey(input.headers))
    if (!decision.allowed) {
      return reply(
        429,
        { error: 'Too many requests. Please wait a moment and try again.', retry_after: decision.retryAfterSeconds },
        { 'Retry-After': String(decision.retryAfterSeconds) },
      )
    }

    const parsed = parseRequest(input.body)
    if (!parsed.ok) return reply(400, { error: parsed.error })

    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      const result = await Promise.race([
        deps.generate(parsed.value),
        new Promise<never>((_resolve, reject) => {
          timer = setTimeout(() => reject(new Error('timeout')), deps.timeoutMs)
        }),
      ])
      return reply(200, result)
    } catch (error) {
      const timedOut = error instanceof Error && error.message === 'timeout'
      console.error('Guidance request failed:', timedOut ? 'timeout' : error instanceof Error ? error.name : 'unknown')
      return timedOut
        ? reply(504, { error: 'The guidance took too long. Please try again.' })
        : reply(500, { error: 'Something went wrong while preparing guidance. Please try again.' })
    } finally {
      clearTimeout(timer)
    }
  }
}

let defaultHandler: ReturnType<typeof createHandler> | undefined

/** The handler wired to the environment: Groq if a key exists, live Qur'an API, a per client limit. */
export function handleGuidance(input: HandlerInput): Promise<HandlerOutput> {
  if (!defaultHandler) {
    const llm: LlmClient | null = llmFromEnv()
    const quran: QuranClient = createQuranClient()
    defaultHandler = createHandler({
      generate: (request) => generateGuidance(request, { llm, quran }),
      limiter: new SlidingWindowLimiter(20, 5 * 60 * 1000),
      timeoutMs: 27000,
    })
  }
  return defaultHandler(input)
}
