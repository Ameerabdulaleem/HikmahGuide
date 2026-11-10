import { LIMITS, type GuidanceRequest, type GuidanceResult } from '../shared/types'
import { isRecord, parseGuidanceResult } from '../shared/validate'
import type { Conversation } from './chatTypes'

export type ApiErrorKind = 'offline' | 'rate_limit' | 'invalid' | 'server' | 'timeout' | 'aborted'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly retryAfter?: number

  constructor(kind: ApiErrorKind, message: string, retryAfter?: number) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.retryAfter = retryAfter
  }
}

const TIMEOUT_MS = 45_000

/** Asks the server for guidance. The reply is validated before anything else sees it. */
export async function requestGuidance(payload: GuidanceRequest, signal: AbortSignal): Promise<GuidanceResult> {
  const timeout = new AbortController()
  const timer = setTimeout(() => timeout.abort(), TIMEOUT_MS)
  const onAbort = () => timeout.abort()
  signal.addEventListener('abort', onAbort)

  try {
    const response = await fetch('/api/guidance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
      credentials: 'same-origin',
      signal: timeout.signal,
    })

    const body: unknown = await response.json().catch(() => null)

    if (!response.ok) {
      const message = isRecord(body) && typeof body.error === 'string' ? body.error.slice(0, 200) : ''
      if (response.status === 429) {
        const retry = isRecord(body) && typeof body.retry_after === 'number' ? body.retry_after : undefined
        throw new ApiError('rate_limit', message || 'You are asking quickly. Please wait a moment.', retry)
      }
      if (response.status === 400 || response.status === 413) throw new ApiError('invalid', message || 'That message could not be sent.')
      throw new ApiError('server', 'The guidance service had a problem. Please try again.')
    }

    const result = parseGuidanceResult(body)
    if (!result) throw new ApiError('server', 'The guidance service sent something unexpected. Please try again.')
    return result
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (signal.aborted) throw new ApiError('aborted', 'Stopped.')
    if (timeout.signal.aborted) throw new ApiError('timeout', 'This is taking longer than expected. Please try again.')
    throw new ApiError('offline', 'Could not reach the guidance service. Check your connection and try again.')
  } finally {
    clearTimeout(timer)
    signal.removeEventListener('abort', onAbort)
  }
}

/** Recent turns sent along with a question so follow ups keep their context. */
export function buildHistory(conversation: Conversation | null, upTo?: number): GuidanceRequest['history'] {
  if (!conversation) return []
  const messages = typeof upTo === 'number' ? conversation.messages.slice(0, upTo) : conversation.messages
  return messages.slice(-LIMITS.historyTurns).map((m) => ({
    role: m.role,
    content: (m.role === 'assistant' ? m.result.main_guidance : m.content).slice(0, LIMITS.historyChars),
  }))
}

/** Keys of every source already shown in the conversation, so new answers bring fresh ones. */
export function usedSourceKeys(conversation: Conversation | null): string[] {
  if (!conversation) return []
  const keys: string[] = []
  for (const message of conversation.messages) {
    if (message.role !== 'assistant') continue
    for (const source of [...message.result.quran, ...message.result.hadith]) keys.push(source.key)
    if (message.result.dua) keys.push(message.result.dua.key)
  }
  return [...new Set(keys)].slice(-LIMITS.excludeKeys)
}
