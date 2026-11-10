import { LIMITS } from '../shared/types'
import { cleanString, isRecord, parseGuidanceResult } from '../shared/validate'
import { CHAT_LIMITS, type ChatMessage, type Conversation, type ConversationMeta } from './chatTypes'

// Everything saved on the device is validated again when it is read back. Local storage
// can be edited by the person, by other tabs, or by browser extensions, so none of it is
// trusted. Records that fail validation are skipped rather than rendered.

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export const PREFIX = 'hikmahguide:v2:'
export const INDEX_KEY = `${PREFIX}index`
export const UI_KEY = `${PREFIX}ui`
export const conversationKey = (id: string) => `${PREFIX}c:${id}`

export const ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/

export interface StoredIndex {
  activeId: string | null
  items: ConversationMeta[]
}

/** Ids are accepted exactly as they are or not at all. They are never trimmed into shape. */
function idOf(value: unknown): string | null {
  return typeof value === 'string' && ID_PATTERN.test(value) ? value : null
}

function timestamp(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 && value < 8.64e15 ? Math.trunc(value) : null
}

function parseMessage(input: unknown): ChatMessage | null {
  if (!isRecord(input)) return null
  const id = idOf(input.id)
  const createdAt = timestamp(input.createdAt)
  if (!id || !createdAt) return null

  if (input.role === 'user') {
    const content = cleanString(input.content, LIMITS.question)
    return content ? { id, role: 'user', content, createdAt } : null
  }

  if (input.role === 'assistant') {
    const question = cleanString(input.question, LIMITS.question)
    const result = parseGuidanceResult(input.result)
    return question && result ? { id, role: 'assistant', createdAt, question, result } : null
  }
  return null
}

export function parseConversation(input: unknown): Conversation | null {
  if (!isRecord(input)) return null
  const id = idOf(input.id)
  const createdAt = timestamp(input.createdAt)
  const updatedAt = timestamp(input.updatedAt)
  if (!id || !createdAt || !updatedAt || !Array.isArray(input.messages)) return null

  const messages = input.messages
    .slice(-CHAT_LIMITS.messages)
    .map(parseMessage)
    .filter((m): m is ChatMessage => m !== null)

  return {
    id,
    title: cleanString(input.title, CHAT_LIMITS.title) || 'Untitled chat',
    titleLocked: input.titleLocked === true,
    createdAt,
    updatedAt,
    messages,
  }
}

function parseMeta(input: unknown): ConversationMeta | null {
  if (!isRecord(input)) return null
  const id = idOf(input.id)
  const createdAt = timestamp(input.createdAt)
  const updatedAt = timestamp(input.updatedAt)
  if (!id || !createdAt || !updatedAt) return null
  return {
    id,
    title: cleanString(input.title, CHAT_LIMITS.title) || 'Untitled chat',
    createdAt,
    updatedAt,
    preview: cleanString(input.preview, 140) ?? '',
    questions: cleanString(input.questions, 300) ?? '',
    count: typeof input.count === 'number' && input.count >= 0 ? Math.min(Math.trunc(input.count), 9999) : 0,
  }
}

export function parseIndex(input: unknown): StoredIndex | null {
  if (!isRecord(input) || !Array.isArray(input.items)) return null
  const seen = new Set<string>()
  const items: ConversationMeta[] = []
  for (const raw of input.items.slice(0, CHAT_LIMITS.conversations)) {
    const meta = parseMeta(raw)
    if (meta && !seen.has(meta.id)) {
      seen.add(meta.id)
      items.push(meta)
    }
  }
  const activeId = typeof input.activeId === 'string' && seen.has(input.activeId) ? input.activeId : null
  return { activeId, items }
}

export function readJson(storage: StorageLike | null, key: string): unknown {
  if (!storage) return null
  try {
    const raw = storage.getItem(key)
    return raw ? (JSON.parse(raw) as unknown) : null
  } catch {
    return null
  }
}

/** Writes a value. Returns false when the browser refuses, for example because storage is full. */
export function writeJson(storage: StorageLike | null, key: string, value: unknown): boolean {
  if (!storage) return false
  try {
    storage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeKey(storage: StorageLike | null, key: string): void {
  try {
    storage?.removeItem(key)
  } catch {
    // Nothing useful to do if the browser refuses to delete.
  }
}

/** localStorage can throw just by being touched (blocked cookies, some private modes). */
export function browserStorage(): StorageLike | null {
  try {
    const storage = window.localStorage
    const probe = `${PREFIX}probe`
    storage.setItem(probe, '1')
    storage.removeItem(probe)
    return storage
  } catch {
    return null
  }
}
