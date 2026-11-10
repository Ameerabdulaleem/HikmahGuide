import { cleanString, isRecord } from '../src/shared/validate.js'
import { LIMITS, SOURCE_KEY_PATTERN, type ChatTurn } from '../src/shared/types.js'

export interface ValidRequest {
  question: string
  history: ChatTurn[]
  exclude: string[]
}

export type ParsedRequest = { ok: true; value: ValidRequest } | { ok: false; error: string }

const MAX_RAW_BODY = 60_000

/** Validates the request body. Anything unexpected is ignored or rejected, never trusted. */
export function parseRequest(body: unknown): ParsedRequest {
  let input = body
  if (typeof input === 'string') {
    if (input.length > MAX_RAW_BODY) return { ok: false, error: 'Request is too large' }
    try {
      input = JSON.parse(input)
    } catch {
      return { ok: false, error: 'Request body must be valid JSON' }
    }
  }
  if (!isRecord(input)) return { ok: false, error: 'Question is required' }

  const question = cleanString(input.question, LIMITS.question + 1)
  if (!question) return { ok: false, error: 'Question is required' }
  if (question.length > LIMITS.question) {
    return { ok: false, error: `Question must be ${LIMITS.question} characters or fewer` }
  }

  const history: ChatTurn[] = []
  if (input.history !== undefined) {
    if (!Array.isArray(input.history)) return { ok: false, error: 'History must be a list' }
    for (const turn of input.history.slice(-LIMITS.historyTurns)) {
      if (!isRecord(turn) || (turn.role !== 'user' && turn.role !== 'assistant')) continue
      const content = cleanString(turn.content, LIMITS.historyChars)
      if (content) history.push({ role: turn.role, content })
    }
  }

  const exclude: string[] = []
  if (Array.isArray(input.exclude)) {
    for (const key of input.exclude.slice(0, LIMITS.excludeKeys)) {
      if (typeof key === 'string' && SOURCE_KEY_PATTERN.test(key)) exclude.push(key)
    }
  }

  return { ok: true, value: { question, history, exclude } }
}
