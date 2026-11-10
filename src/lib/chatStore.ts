import { LIMITS, type GuidanceResult } from '../shared/types'
import { cleanString } from '../shared/validate'
import {
  CHAT_LIMITS,
  type AssistantMessage,
  type ChatMessage,
  type Conversation,
  type ConversationMeta,
  type UserMessage,
} from './chatTypes'
import {
  browserStorage,
  conversationKey,
  INDEX_KEY,
  parseConversation,
  parseIndex,
  PREFIX,
  readJson,
  removeKey,
  UI_KEY,
  writeJson,
  type StorageLike,
  type StoredIndex,
} from './storage'

export interface ChatState {
  metas: ConversationMeta[]
  activeId: string | null
  active: Conversation | null
  /** False when the browser gives us no storage, so chats last only until the tab closes */
  persistent: boolean
  /** True when the last attempt to save failed */
  saveFailed: boolean
}

export interface ChatStore {
  getState(): ChatState
  subscribe(listener: () => void): () => void
  getConversation(id: string): Conversation | null
  newChat(): void
  select(id: string): void
  addUserMessage(convId: string | null, content: string): { convId: string; message: UserMessage } | null
  addAssistantMessage(convId: string, question: string, result: GuidanceResult): void
  rename(id: string, title: string): void
  remove(id: string): void
  clearAll(): void
  dispose(): void
}

interface StoreEnv {
  now?: () => number
  uid?: () => string
  /** Where cross tab `storage` events come from. Pass null to ignore them. */
  events?: Pick<EventTarget, 'addEventListener' | 'removeEventListener'> | null
}

type ScanableStorage = StorageLike & { length?: number; key?(index: number): string | null }

function randomId(): string {
  const c = globalThis.crypto
  if (c?.randomUUID) return c.randomUUID()
  if (c?.getRandomValues) return Array.from(c.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('')
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`
}

export function titleFrom(content: string): string {
  const flat = content.replace(/\s+/g, ' ').trim()
  const first = flat.split(/[.?!]/)[0] || flat
  return first.length > 48 ? `${first.slice(0, 45).trimEnd()}…` : first || 'New chat'
}

function previewOf(conversation: Conversation): string {
  const last = conversation.messages[conversation.messages.length - 1]
  if (!last) return ''
  const text = last.role === 'assistant' ? last.result.main_guidance.replace(/\[[QHD]\d{1,2}\]/g, '') : last.content
  return text.replace(/\s+/g, ' ').trim().slice(0, 140)
}

function toMeta(conversation: Conversation): ConversationMeta {
  return {
    id: conversation.id,
    title: conversation.title,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    preview: previewOf(conversation),
    questions: conversation.messages
      .filter((m): m is UserMessage => m.role === 'user')
      .map((m) => m.content)
      .join(' ')
      .replace(/\s+/g, ' ')
      .slice(0, 300),
    count: conversation.messages.length,
  }
}

export function createChatStore(storage: ScanableStorage | null, env: StoreEnv = {}): ChatStore {
  const now = env.now ?? Date.now
  const uid = env.uid ?? randomId
  const cache = new Map<string, Conversation>()
  const listeners = new Set<() => void>()
  let index: StoredIndex = { activeId: null, items: [] }
  let saveFailed = false
  let state: ChatState

  function snapshot(): ChatState {
    return {
      metas: index.items,
      activeId: index.activeId,
      active: index.activeId ? (cache.get(index.activeId) ?? null) : null,
      persistent: storage !== null,
      saveFailed,
    }
  }

  function commit() {
    state = snapshot()
    listeners.forEach((listener) => listener())
  }

  function load(id: string): Conversation | null {
    const cached = cache.get(id)
    if (cached) return cached
    if (!index.items.some((m) => m.id === id)) return null
    const parsed = parseConversation(readJson(storage, conversationKey(id)))
    if (!parsed || parsed.id !== id) {
      // Missing or damaged: forget it instead of showing a broken chat.
      index = { ...index, items: index.items.filter((m) => m.id !== id), activeId: index.activeId === id ? null : index.activeId }
      removeKey(storage, conversationKey(id))
      return null
    }
    cache.set(id, parsed)
    return parsed
  }

  function reloadFromStorage() {
    cache.clear()
    index = parseIndex(readJson(storage, INDEX_KEY)) ?? { activeId: null, items: [] }
    if (index.activeId) load(index.activeId)
    state = snapshot()
  }

  function evictOldest(keep: string): boolean {
    const victim = [...index.items].reverse().find((m) => m.id !== keep && m.id !== index.activeId)
    if (!victim) return false
    index = { ...index, items: index.items.filter((m) => m.id !== victim.id) }
    cache.delete(victim.id)
    removeKey(storage, conversationKey(victim.id))
    return true
  }

  function persist(conversation: Conversation) {
    const meta = toMeta(conversation)
    const others = index.items.filter((m) => m.id !== meta.id)
    index = { ...index, items: [meta, ...others].sort((a, b) => b.updatedAt - a.updatedAt) }

    while (index.items.length > CHAT_LIMITS.conversations) {
      if (!evictOldest(conversation.id)) break
    }
    if (!storage) return

    let ok = writeJson(storage, conversationKey(conversation.id), conversation)
    for (let attempt = 0; !ok && attempt < 8; attempt += 1) {
      if (!evictOldest(conversation.id)) break
      ok = writeJson(storage, conversationKey(conversation.id), conversation)
    }
    saveFailed = !(ok && writeJson(storage, INDEX_KEY, index))
  }

  function persistIndex() {
    if (storage) saveFailed = !writeJson(storage, INDEX_KEY, index)
  }

  function touch(conversation: Conversation, messages: ChatMessage[], extra: Partial<Conversation> = {}): Conversation {
    const next: Conversation = {
      ...conversation,
      ...extra,
      messages: messages.slice(-CHAT_LIMITS.messages),
      updatedAt: Math.max(now(), conversation.updatedAt + 1),
    }
    cache.set(next.id, next)
    persist(next)
    return next
  }

  reloadFromStorage()

  const onStorage = (event: Event) => {
    const key = (event as StorageEvent).key
    if (key === null || key.startsWith(PREFIX)) {
      if (key === UI_KEY) return
      reloadFromStorage()
      commit()
    }
  }
  env.events?.addEventListener('storage', onStorage)

  return {
    getState: () => state,

    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    getConversation: (id) => load(id),

    newChat() {
      index = { ...index, activeId: null }
      persistIndex()
      commit()
    },

    select(id) {
      if (!load(id)) {
        commit()
        return
      }
      index = { ...index, activeId: id }
      persistIndex()
      commit()
    },

    addUserMessage(convId, rawContent) {
      const content = cleanString(rawContent, LIMITS.question)
      if (!content) return null

      const existing = convId ? load(convId) : null
      const base: Conversation = existing ?? {
        id: uid(),
        title: titleFrom(content),
        titleLocked: false,
        createdAt: now(),
        updatedAt: now(),
        messages: [],
      }
      const message: UserMessage = { id: uid(), role: 'user', content, createdAt: now() }
      index = { ...index, activeId: base.id }
      touch(base, [...base.messages, message])
      commit()
      return { convId: base.id, message }
    },

    addAssistantMessage(convId, question, result) {
      const conversation = load(convId)
      if (!conversation) return // The chat was deleted while the answer was on its way.

      const message: AssistantMessage = { id: uid(), role: 'assistant', createdAt: now(), question, result }
      const firstAnswer = !conversation.messages.some((m) => m.role === 'assistant')
      const suggested = cleanString(result.title, CHAT_LIMITS.title)
      touch(conversation, [...conversation.messages, message], firstAnswer && !conversation.titleLocked && suggested ? { title: suggested } : {})
      commit()
    },

    rename(id, rawTitle) {
      const conversation = load(id)
      const title = cleanString(rawTitle, CHAT_LIMITS.title)
      if (!conversation || !title) return
      touch(conversation, conversation.messages, { title, titleLocked: true })
      commit()
    },

    remove(id) {
      cache.delete(id)
      removeKey(storage, conversationKey(id))
      index = { activeId: index.activeId === id ? null : index.activeId, items: index.items.filter((m) => m.id !== id) }
      persistIndex()
      commit()
    },

    clearAll() {
      cache.clear()
      if (storage) {
        const keys: string[] = []
        for (let i = 0; i < (storage.length ?? 0); i += 1) {
          const key = storage.key?.(i)
          if (key && key.startsWith(PREFIX) && key !== UI_KEY) keys.push(key)
        }
        for (const item of index.items) keys.push(conversationKey(item.id))
        keys.forEach((key) => removeKey(storage, key))
      }
      index = { activeId: null, items: [] }
      saveFailed = false
      commit()
    },

    dispose() {
      env.events?.removeEventListener('storage', onStorage)
      listeners.clear()
    },
  }
}

let shared: ChatStore | undefined

/** The store used by the app, backed by the browser's local storage when it is available. */
export function getChatStore(): ChatStore {
  if (!shared) shared = createChatStore(browserStorage(), { events: typeof window === 'undefined' ? null : window })
  return shared
}
