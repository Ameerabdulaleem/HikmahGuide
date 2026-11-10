import { describe, expect, it } from 'vitest'
import type { LlmClient, LlmRequest } from '../server/llm'
import type { QuranClient } from '../server/quranClient'
import type { ValidRequest } from '../server/request'
import { generateGuidance } from '../server/service'
import { extractCitations } from '../src/shared/citations'
import { parseGuidanceResult } from '../src/shared/validate'

const fakeQuran: QuranClient = {
  async getVerse(surah, ayah) {
    return {
      surah,
      ayah,
      surahName: 'Test Surah',
      arabic: `آية ${surah}:${ayah}`,
      translation: `Translation of verse ${surah} ${ayah} about trust and ease.`,
    }
  },
}

const brokenQuran: QuranClient = { async getVerse() { return null } }

const ask = (question: string, extra: Partial<ValidRequest> = {}): ValidRequest => ({ question, history: [], exclude: [], ...extra })

/** A fake model: answers the classifier and the writer from the two functions given. */
function fakeLlm(
  classification: Record<string, unknown> | Error,
  draft: (request: LlmRequest) => unknown,
  calls: LlmRequest[] = [],
): LlmClient {
  return {
    async json(request) {
      calls.push(request)
      if (request.maxTokens <= 200) {
        if (classification instanceof Error) throw classification
        return classification
      }
      return draft(request)
    },
  }
}

const inScope = { in_scope: true, themes: ['anxiety', 'trust'], title: 'Easing anxiety', ruling_request: false, crisis: false }

describe('without a model (sources only)', () => {
  it('compiles a complete, fully cited answer from the sources', async () => {
    const result = await generateGuidance(ask('I feel anxious about my future'), { llm: null, quran: fakeQuran })

    expect(result.mode).toBe('sources_only')
    expect(result.quran).toHaveLength(2)
    expect(result.hadith).toHaveLength(2)
    expect(result.dua).not.toBeNull()
    expect(result.quran.every((q) => q.verified)).toBe(true)
    expect(extractCitations(result.main_guidance).sort()).toEqual(['H1', 'H2', 'Q1', 'Q2'])
    expect(result.key_reflections.length).toBeGreaterThanOrEqual(3)
    expect(result.practical_steps.length).toBeGreaterThanOrEqual(4)
    expect(result.follow_ups.length).toBeGreaterThanOrEqual(2)
    expect(result.themes[0]).toBe('anxiety')
    expect(parseGuidanceResult(JSON.parse(JSON.stringify(result)))).not.toBeNull()
  })

  it('picks sources that match the topic, not a generic set', async () => {
    const anger = await generateGuidance(ask('I get so angry at my brother'), { llm: null, quran: fakeQuran })
    expect(anger.themes).toContain('anger')
    expect(anger.hadith.some((h) => /angry|anger/i.test(h.text))).toBe(true)
  })
})

describe('with a model', () => {
  const sourceAwareDraft = (request: LlmRequest) => {
    const last = request.messages[request.messages.length - 1].content
    expect(last).toContain('SOURCES')
    const hadith = /\[H1\] [^:]+: "([^"]+)"/.exec(last)![1]
    return {
      opening: 'I am sorry you are carrying this, and I am glad you asked.',
      main_guidance: `Allah reminds us that hearts find rest in His remembrance [Q1], and He also teaches us that trust brings ease [Q2]. The Prophet ﷺ taught: “${hadith}” [H1]. Bring this worry to Allah in the duʿāʾ [D1] tonight. You do not have to do it alone, so please speak with someone you trust. Take one small step today and leave the rest with Allah.`,
      key_reflections: ['Your worry is a signal to turn back to Allah [Q1].', 'Rest is part of trust [H2].', 'Small steps count.'],
      practical_steps: ['Pray and speak to Allah plainly.', 'Say the duʿāʾ [D1] after prayer.', 'Call a friend you trust.', 'Write down what you can act on.'],
      follow_ups: ['How can I sleep better?', 'What if the worry comes back?'],
    }
  }

  it('uses the model’s writing when it stays inside the sources', async () => {
    const calls: LlmRequest[] = []
    const result = await generateGuidance(ask('How to overcome anxiety?'), { llm: fakeLlm(inScope, sourceAwareDraft, calls), quran: fakeQuran })

    expect(result.mode).toBe('grounded')
    expect(result.title).toBe('Easing anxiety')
    expect(result.opening).toContain('glad you asked')
    expect(extractCitations(result.main_guidance)).toEqual(expect.arrayContaining(['Q1', 'Q2', 'H1', 'D1']))
    expect(result.follow_ups).toEqual(['How can I sleep better?', 'What if the worry comes back?'])
    // The writer is shown the retrieved text and is told to use nothing else.
    const writer = calls[calls.length - 1]
    expect(writer.messages[0].content).toContain('ONLY from the numbered SOURCES')
    expect(writer.messages[writer.messages.length - 1].content).toContain('Translation of verse')
  })

  it('throws away invented ḥadīth, references and quotations, and falls back to the sources', async () => {
    const hostile = () => ({
      opening: 'Peace be with you.',
      main_guidance:
        'The Prophet ﷺ said that anxiety is the sign of weak faith. It is recorded in Sahih al-Bukhari 9999. Allah says in 2:255 that He will remove every worry. The Prophet taught: “Whoever worries shall be forgiven on the spot and rewarded with a palace” [H1].',
      key_reflections: ['Narrated by Bukhari: worry is a sin.', 'Take a walk and breathe.'],
      practical_steps: ['See Musnad Ahmad 111 for the details.', 'Pray two units.'],
      follow_ups: ['Is it in Sahih Muslim 5?'],
    })
    const result = await generateGuidance(ask('anxious'), { llm: fakeLlm(inScope, hostile), quran: fakeQuran })

    const text = JSON.stringify(result)
    expect(text).not.toMatch(/9999|2:255|Musnad Ahmad 111|palace|weak faith|Narrated by Bukhari/)
    expect(result.mode).toBe('sources_only')
    expect(result.main_guidance).toContain('[Q1]')
    expect(result.key_reflections.join(' ')).toContain('Take a walk and breathe.')
    expect(result.practical_steps.join(' ')).toContain('Pray two units.')
  })

  it('falls back to the sources if the model fails or returns junk', async () => {
    const down = await generateGuidance(ask('anxiety please'), {
      llm: fakeLlm(new Error('boom'), () => {
        throw new Error('boom')
      }),
      quran: fakeQuran,
    })
    expect(down.mode).toBe('sources_only')
    expect(down.themes[0]).toBe('anxiety')

    const junk = await generateGuidance(ask('anxiety please'), { llm: fakeLlm(inScope, () => ({ main_guidance: 42 })), quran: fakeQuran })
    expect(junk.mode).toBe('sources_only')
    expect(junk.hadith).toHaveLength(2)
  })

  it('redirects questions outside its purpose without retrieving or writing anything', async () => {
    const calls: LlmRequest[] = []
    const result = await generateGuidance(
      ask('Write me a python script that sorts a list'),
      { llm: fakeLlm({ in_scope: false, themes: [], title: 'Coding help', ruling_request: false, crisis: false }, sourceAwareDraft, calls), quran: fakeQuran },
    )
    expect(result.mode).toBe('redirect')
    expect(result.quran).toEqual([])
    expect(result.hadith).toEqual([])
    expect(result.dua).toBeNull()
    expect(calls).toHaveLength(1)
  })

  it('trusts clear signs of a spiritual question over the model’s out of scope guess', async () => {
    const result = await generateGuidance(
      ask('I am so anxious and worried and afraid about my exam'),
      { llm: fakeLlm({ in_scope: false, themes: [], title: '', ruling_request: false, crisis: false }, sourceAwareDraft), quran: fakeQuran },
    )
    expect(result.mode).not.toBe('redirect')
  })

  it('shows a care note and leads with hope when someone may be in danger', async () => {
    const result = await generateGuidance(ask('I want to die'), { llm: null, quran: fakeQuran })
    expect(result.notes.map((n) => n.kind)).toContain('care')
    expect(result.themes[0]).toBe('hope')
    expect(result.notes[0].text).toMatch(/emergency/i)
  })

  it('adds the scholar note when a ruling is requested', async () => {
    const result = await generateGuidance(
      ask('Is music haram?'),
      { llm: fakeLlm({ ...inScope, ruling_request: true }, sourceAwareDraft), quran: fakeQuran },
    )
    expect(result.notes.map((n) => n.kind)).toContain('scholar')
  })

  it('passes recent conversation to the writer so follow ups make sense', async () => {
    const calls: LlmRequest[] = []
    await generateGuidance(
      ask('And what about my wife?', {
        history: [
          { role: 'user', content: 'I feel anxious about money' },
          { role: 'assistant', content: 'May Allah ease your worry [Q1]. Try this https://example.com' },
        ],
      }),
      { llm: fakeLlm(inScope, sourceAwareDraft, calls), quran: fakeQuran },
    )
    const writer = calls[calls.length - 1].messages
    expect(writer.map((m) => m.role)).toEqual(['system', 'user', 'assistant', 'user'])
    expect(writer[2].content).not.toContain('[Q1]')
    expect(writer[2].content).not.toContain('https://')
  })
})

describe('sources and verification', () => {
  it('shows what could be verified and warns when the Qur’an service is down', async () => {
    const result = await generateGuidance(ask('I need patience'), { llm: null, quran: brokenQuran })
    expect(result.quran).toEqual([])
    expect(result.hadith).toHaveLength(2)
    expect(result.notes.map((n) => n.kind)).toContain('degraded')
    expect(extractCitations(result.main_guidance)).not.toContain('Q1')
  })

  it('moves on to a spare verse when one fails to verify', async () => {
    let calls = 0
    const flaky: QuranClient = {
      async getVerse(surah, ayah) {
        calls += 1
        return calls <= 1 ? null : fakeQuran.getVerse(surah, ayah)
      },
    }
    const result = await generateGuidance(ask('patience'), { llm: null, quran: flaky })
    expect(result.quran).toHaveLength(2)
    expect(result.quran.map((q) => q.id)).toEqual(['Q1', 'Q2'])
  })

  it('avoids repeating sources already shown in the conversation', async () => {
    const first = await generateGuidance(ask('I feel anxious'), { llm: null, quran: fakeQuran })
    const shown = [...first.quran, ...first.hadith].map((s) => s.key)
    const second = await generateGuidance(ask('I still feel anxious', { exclude: shown }), { llm: null, quran: fakeQuran })
    for (const source of [...second.quran, ...second.hadith]) expect(shown).not.toContain(source.key)
  })
})
