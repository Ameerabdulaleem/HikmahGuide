import { describe, expect, it } from 'vitest'
import { buildHistory, usedSourceKeys } from '../src/lib/api'
import { createChatStore, titleFrom } from '../src/lib/chatStore'
import { conversationKey, INDEX_KEY, parseConversation, type StorageLike } from '../src/lib/storage'
import type { GuidanceResult } from '../src/shared/types'
import { parseGuidanceResult } from '../src/shared/validate'

class FakeStorage implements StorageLike {
  data = new Map<string, string>()
  quota = Infinity
  get length() {
    return this.data.size
  }
  key(i: number) {
    return [...this.data.keys()][i] ?? null
  }
  getItem(k: string) {
    return this.data.get(k) ?? null
  }
  setItem(k: string, v: string) {
    const size = [...this.data.entries()].filter(([key]) => key !== k).reduce((n, [, val]) => n + val.length, 0) + v.length
    if (size > this.quota) throw new DOMException('full', 'QuotaExceededError')
    this.data.set(k, v)
  }
  removeItem(k: string) {
    this.data.delete(k)
  }
}

function result(overrides: Partial<GuidanceResult> = {}): GuidanceResult {
  return {
    version: 2,
    mode: 'grounded',
    title: 'Easing anxiety',
    themes: ['anxiety'],
    opening: 'Peace.',
    main_guidance: 'Hearts find rest [Q1]. Ease follows hardship [H1].',
    key_reflections: ['One'],
    practical_steps: ['Two'],
    follow_ups: ['Three?'],
    quran: [{ id: 'Q1', key: 'quran:13:28', surah: 13, ayah: 28, surah_name: 'Ar-Raʿd', arabic: 'نص', translation: 'Text', reference: 'Surah Ar-Raʿd, 13:28', edition: 'x', verified: true }],
    hadith: [{ id: 'H1', key: 'hadith:bukhari:5641', collection: 'bukhari', number: 5641, text: 'Text', reference: 'Sahih al-Bukhari 5641' }],
    dua: { id: 'D1', key: 'dua:0a1b2c3d', arabic: 'دعاء', transliteration: 'du', translation: 'Dua', reference: 'Hisnul Muslim' },
    notes: [],
    hadith_themes: ['anxiety'],
    dua_theme: 'anxiety',
    ...overrides,
  }
}

let counter = 0
const make = (storage: FakeStorage | null, events: EventTarget | null = null) => {
  let clock = 1_700_000_000_000
  return createChatStore(storage, { now: () => (clock += 1000), uid: () => `id-${String(++counter).padStart(8, '0')}`, events })
}

describe('saving and coming back', () => {
  it('keeps a chat and reopens it, answers included, in a fresh session', () => {
    const storage = new FakeStorage()
    const first = make(storage)
    const { convId } = first.addUserMessage(null, 'How to overcome anxiety?')!
    first.addAssistantMessage(convId, 'How to overcome anxiety?', result())
    first.addUserMessage(convId, 'And at night?')

    const second = make(storage)
    const state = second.getState()
    expect(state.activeId).toBe(convId)
    expect(state.metas).toHaveLength(1)
    expect(state.active?.messages.map((m) => m.role)).toEqual(['user', 'assistant', 'user'])
    expect(state.active?.title).toBe('Easing anxiety')
    const answer = state.active?.messages[1]
    expect(answer?.role === 'assistant' && answer.result.hadith[0].reference).toBe('Sahih al-Bukhari 5641')
  })

  it('starts empty on a first visit and creates nothing until a message is sent', () => {
    const storage = new FakeStorage()
    const store = make(storage)
    expect(store.getState().metas).toEqual([])
    store.newChat()
    expect(storage.data.has(INDEX_KEY)).toBe(true)
    expect(store.getState().metas).toEqual([])
  })

  it('lists newest first and switches between chats', () => {
    const store = make(new FakeStorage())
    const a = store.addUserMessage(null, 'first chat')!.convId
    const b = store.addUserMessage(null, 'second chat')!.convId
    expect(store.getState().metas.map((m) => m.id)).toEqual([b, a])
    store.select(a)
    expect(store.getState().activeId).toBe(a)
    store.addUserMessage(a, 'more')
    expect(store.getState().metas[0].id).toBe(a)
    store.newChat()
    expect(store.getState().active).toBeNull()
  })

  it('names the chat from the first answer unless the person renamed it', () => {
    const store = make(new FakeStorage())
    const a = store.addUserMessage(null, 'worried about money')!.convId
    expect(store.getState().active?.title).toBe('worried about money')
    store.addAssistantMessage(a, 'q', result({ title: 'Money worries' }))
    expect(store.getState().active?.title).toBe('Money worries')
    store.addAssistantMessage(a, 'q2', result({ title: 'Something else' }))
    expect(store.getState().active?.title).toBe('Money worries')

    const b = store.addUserMessage(null, 'other')!.convId
    store.rename(b, '  My own name  ')
    store.addAssistantMessage(b, 'q', result({ title: 'Ignored' }))
    expect(store.getState().active?.title).toBe('My own name')
    store.rename(b, '   ')
    expect(store.getState().active?.title).toBe('My own name')
  })

  it('deletes one chat or everything', () => {
    const storage = new FakeStorage()
    const store = make(storage)
    const a = store.addUserMessage(null, 'one')!.convId
    const b = store.addUserMessage(null, 'two')!.convId
    store.remove(b)
    expect(store.getState().activeId).toBeNull()
    expect(storage.data.has(conversationKey(b))).toBe(false)
    expect(store.getState().metas.map((m) => m.id)).toEqual([a])

    storage.setItem('hikmahguide:v2:ui', '{"variant":"warm"}')
    storage.setItem('other:site', 'keep')
    store.clearAll()
    expect(store.getState().metas).toEqual([])
    expect([...storage.data.keys()].sort()).toEqual(['hikmahguide:v2:ui', 'other:site'])
  })

  it('ignores an answer that arrives after its chat was deleted', () => {
    const store = make(new FakeStorage())
    const a = store.addUserMessage(null, 'one')!.convId
    store.remove(a)
    store.addAssistantMessage(a, 'one', result())
    expect(store.getState().metas).toEqual([])
  })

  it('lets search find a chat by what the person asked, not just its title', () => {
    const store = make(new FakeStorage())
    const id = store.addUserMessage(null, 'Is this haram?')!.convId
    store.addAssistantMessage(id, 'Is this haram?', result({ title: 'About rulings' }))
    store.addUserMessage(id, 'and what about music')
    const meta = store.getState().metas[0]
    expect(meta.questions).toBe('Is this haram? and what about music')
    expect(meta.title).toBe('About rulings')
  })

  it('refuses empty messages', () => {
    const store = make(new FakeStorage())
    expect(store.addUserMessage(null, '   ')).toBeNull()
    expect(store.getState().metas).toEqual([])
  })
})

describe('damaged and tampered storage', () => {
  it('survives garbage', () => {
    const storage = new FakeStorage()
    storage.setItem(INDEX_KEY, '{not json')
    expect(make(storage).getState().metas).toEqual([])
    storage.setItem(INDEX_KEY, JSON.stringify({ items: 'nope' }))
    expect(make(storage).getState().metas).toEqual([])
  })

  it('drops a chat whose record is missing or invalid, and keeps the others', () => {
    const storage = new FakeStorage()
    const store = make(storage)
    const good = store.addUserMessage(null, 'good chat')!.convId
    const bad = store.addUserMessage(null, 'bad chat')!.convId
    storage.setItem(conversationKey(bad), JSON.stringify({ id: bad, nonsense: true }))

    const reopened = make(storage)
    reopened.select(bad)
    expect(reopened.getState().metas.map((m) => m.id)).toEqual([good])
    expect(reopened.getState().activeId).toBeNull()
  })

  it('rejects ids that could be used to reach other keys', () => {
    const base = { title: 't', createdAt: 1, updatedAt: 1, messages: [] }
    expect(parseConversation({ ...base, id: '../../etc/passwd' })).toBeNull()
    expect(parseConversation({ ...base, id: 'short' })).toBeNull()
    expect(parseConversation({ ...base, id: 'a'.repeat(200) })).toBeNull()
    expect(parseConversation({ ...base, id: 'valid-id-1234' })).not.toBeNull()
  })

  it('drops tampered messages but keeps good ones, and strips what is not text', () => {
    const conv = parseConversation({
      id: 'valid-id-1234',
      title: 'T\u0000itle',
      createdAt: 1,
      updatedAt: 2,
      messages: [
        { id: 'msg-00000001', role: 'user', content: 'hello', createdAt: 1 },
        { id: 'msg-00000002', role: 'admin', content: 'x', createdAt: 1 },
        { id: 'msg-00000003', role: 'assistant', question: 'q', createdAt: 1, result: { version: 2, mode: 'grounded' } },
        { id: 'msg-00000004', role: 'user', content: { toString: 'x' }, createdAt: 1 },
        'junk',
      ],
    })
    expect(conv?.title).toBe('Title')
    expect(conv?.messages).toHaveLength(1)
  })

  it('never keeps a source with an unknown collection or malformed id', () => {
    const bad = parseGuidanceResult({
      ...result(),
      hadith: [{ ...result().hadith[0], collection: 'javascript:alert(1)' }, { ...result().hadith[0], id: '<img>' }],
      quran: [{ ...result().quran[0], surah: 500 }],
    })
    expect(bad?.hadith).toEqual([])
    expect(bad?.quran).toEqual([])
  })
})

describe('limits and failures', () => {
  it('makes room by removing the oldest chats when storage fills up', () => {
    const storage = new FakeStorage()
    const store = make(storage)
    const ids = Array.from({ length: 4 }, (_, i) => store.addUserMessage(null, `chat ${i} ${'x'.repeat(400)}`)!.convId)
    storage.quota = [...storage.data.values()].reduce((n, v) => n + v.length, 0) + 300
    const newest = store.addUserMessage(null, `latest ${'y'.repeat(900)}`)!.convId

    const kept = store.getState().metas.map((m) => m.id)
    expect(kept).toContain(newest)
    expect(kept).not.toContain(ids[0])
    expect(store.getState().saveFailed).toBe(false)
    expect(storage.data.has(conversationKey(ids[0]))).toBe(false)
  })

  it('reports a failed save instead of pretending, but keeps working in memory', () => {
    const storage = new FakeStorage()
    storage.quota = 10
    const store = make(storage)
    store.addUserMessage(null, 'this will not fit')
    expect(store.getState().saveFailed).toBe(true)
    expect(store.getState().active?.messages).toHaveLength(1)
  })

  it('works without any storage', () => {
    const store = make(null)
    const a = store.addUserMessage(null, 'private window')!.convId
    store.addAssistantMessage(a, 'private window', result())
    expect(store.getState().persistent).toBe(false)
    expect(store.getState().active?.messages).toHaveLength(2)
  })

  it('caps how many chats are kept', () => {
    const store = make(new FakeStorage())
    for (let i = 0; i < 70; i += 1) store.addUserMessage(null, `chat ${i}`)
    expect(store.getState().metas.length).toBe(60)
  })

  it('picks up changes made in another tab', () => {
    const storage = new FakeStorage()
    const events = new EventTarget()
    const tabA = make(storage, events)
    const tabB = make(storage)
    const id = tabB.addUserMessage(null, 'written in tab B')!.convId
    expect(tabA.getState().metas).toEqual([])

    events.dispatchEvent(Object.assign(new Event('storage'), { key: INDEX_KEY }))
    expect(tabA.getState().metas.map((m) => m.id)).toEqual([id])
  })

  it('tells subscribers about every change, and only until they unsubscribe', () => {
    const store = make(new FakeStorage())
    let calls = 0
    const off = store.subscribe(() => (calls += 1))
    store.addUserMessage(null, 'one')
    store.newChat()
    off()
    store.addUserMessage(null, 'two')
    expect(calls).toBe(2)
  })
})

describe('what is sent with a follow up', () => {
  it('sends recent turns and remembers which sources were already shown', () => {
    const store = make(new FakeStorage())
    const id = store.addUserMessage(null, 'first question')!.convId
    store.addAssistantMessage(id, 'first question', result())
    store.addUserMessage(id, 'second question')

    const conversation = store.getConversation(id)
    expect(buildHistory(conversation, conversation!.messages.length - 1)).toEqual([
      { role: 'user', content: 'first question' },
      { role: 'assistant', content: 'Hearts find rest [Q1]. Ease follows hardship [H1].' },
    ])
    expect(usedSourceKeys(conversation).sort()).toEqual(['dua:0a1b2c3d', 'hadith:bukhari:5641', 'quran:13:28'])
    expect(buildHistory(null)).toEqual([])
  })

  it('makes short titles', () => {
    expect(titleFrom('  Dealing with family conflict. It is hard  ')).toBe('Dealing with family conflict')
    expect(titleFrom('x'.repeat(100)).length).toBe(46)
    expect(titleFrom('')).toBe('New chat')
  })
})
