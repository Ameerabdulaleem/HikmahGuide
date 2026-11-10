import { describe, expect, it } from 'vitest'
import { cleanModelText, cleanTitle, guardFollowUps, guardList, guardProse, splitSentences, type GuardContext } from '../server/guard'
import { normaliseTags, splitCitations } from '../src/shared/citations'

const H1 = 'Know that victory comes with patience, relief with affliction, and ease with hardship.'
const Q1 = 'Unquestionably, by the remembrance of Allah hearts are assured.'

const context: GuardContext = {
  allowedIds: new Set(['Q1', 'H1', 'D1']),
  sourceTexts: [Q1, H1, 'O Allah, I seek refuge in You from worry and grief.'],
}

describe('guardProse', () => {
  it('keeps a sentence that is tied to a real source', () => {
    const out = guardProse('Allah reminds us that hearts find rest in remembrance [Q1]. Take that to heart.', context)
    expect(out.text).toContain('[Q1]')
    expect(out.dropped).toBe(0)
  })

  it('removes tags for sources that do not exist, and the claim that relied on them', () => {
    const out = guardProse('Allah promises relief to every believer [Q9]. Be gentle with yourself today.', context)
    expect(out.text).not.toContain('[Q9]')
    expect(out.text).not.toContain('promises relief')
    expect(out.text).toContain('Be gentle with yourself today.')
  })

  it('drops sentences that cite a collection or hadith number of their own', () => {
    const out = guardProse('The Prophet taught patience in Sahih al-Bukhari 1469 [H1]. Rest well tonight.', context)
    expect(out.text).toBe('Rest well tonight.')
    expect(out.dropped).toBe(1)
  })

  it('drops invented chapter references such as Bukhari or Tirmidhi', () => {
    for (const lie of ['This is recorded by Bukhari.', 'Tirmidhi reports it as well.', 'See Musnad Ahmad for more.', 'It appears in Sunan Abu Dawud.']) {
      expect(guardProse(lie, context).text, lie).toBe('')
    }
  })

  it('does not mistake the word Muslim for a hadith collection', () => {
    const out = guardProse('As a Muslim, you can bring this to Allah in prayer tonight.', context)
    expect(out.text).toContain('As a Muslim')
  })

  it('removes a bracketed reference and keeps the rest of the sentence', () => {
    const out = guardProse('Patience brings ease (Sahih al-Bukhari 1469) in the end.', context)
    expect(out.text).toBe('Patience brings ease in the end.')
  })

  it('drops invented verse numbers but leaves clock times alone', () => {
    expect(guardProse('In the Qur’an 2:255 we read about the Throne.', context).text).toBe('')
    expect(guardProse('Surah Al-Baqarah, verse 255 is powerful.', context).text).toBe('')
    expect(guardProse('Wake up at 5:30 for Fajr.', context).text).toBe('Wake up at 5:30 for Fajr.')
  })

  it('drops "the Prophet said" and "Allah says" when no numbered source backs them', () => {
    const lies = [
      'The Prophet ﷺ said that patience is half of faith.',
      'The Messenger of Allah told his companions to avoid worry.',
      'Allah says that He will remove every hardship.',
      'It is narrated that he would pray all night.',
      'In a hadith, we learn to be calm.',
      'The Qur’an says that anxiety is a test.',
    ]
    for (const lie of lies) expect(guardProse(lie, context).text, lie).toBe('')
  })

  it('allows the same kind of sentence when it carries a valid tag', () => {
    const out = guardProse('The Prophet ﷺ taught that relief follows hardship [H1].', context)
    expect(out.text).toContain('[H1]')
  })

  it('leaves general statements about character alone', () => {
    const out = guardProse('The Prophet ﷺ was known for his gentleness with children.', context)
    expect(out.text).toContain('gentleness')
  })

  it('accepts quotations copied from a source and rejects invented ones', () => {
    const real = guardProse(`The Prophet ﷺ taught: “${H1}” [H1].`, context)
    expect(real.text).toContain('victory comes with patience')

    const partial = guardProse('He taught: “victory comes with patience … and ease with hardship” [H1].', context)
    expect(partial.text).toContain('[H1]')

    const fake = guardProse('The Prophet ﷺ taught: “Patience is the key to every locked door in life” [H1].', context)
    expect(fake.text).toBe('')
  })

  it('ignores short quoted phrases', () => {
    const out = guardProse('You described feeling “completely lost” this week.', context)
    expect(out.text).toContain('completely lost')
  })

  it('understands tags written in different shapes', () => {
    expect(normaliseTags('See [Q1, H1] and (D1).')).toBe('See [Q1][H1] and [D1].')
    const out = guardProse('Hearts find rest in remembrance (Q1).', context)
    expect(out.citations).toEqual(['Q1'])
  })

  it('keeps a tag that follows the full stop with the sentence before it', () => {
    const out = guardProse('Allah says hearts find rest in remembrance. [Q1] You are not alone.', context)
    expect(out.text).toContain('[Q1]')
    expect(out.dropped).toBe(0)
  })

  it('strips markdown, html and links from model text', () => {
    const out = cleanModelText('**Bold** <b>text</b> with [a link](https://evil.example/x) and https://evil.example/y\n- item')
    expect(out).toBe('Bold text with a link and item')
  })
})

describe('guardList and guardFollowUps', () => {
  it('keeps good items, drops bad ones and caps the length', () => {
    const items = [
      'Pray two units and tell Allah what is on your heart.',
      'Narrated by Bukhari that you should rest.',
      42,
      'Call a friend you trust and talk it through.',
      'Make the duʿāʾ [D1] before you sleep.',
    ]
    const out = guardList(items, context, 3)
    expect(out).toEqual([
      'Pray two units and tell Allah what is on your heart.',
      'Call a friend you trust and talk it through.',
      'Make the duʿāʾ [D1] before you sleep.',
    ])
  })

  it('returns nothing for anything that is not a list', () => {
    expect(guardList('nope', context, 3)).toEqual([])
    expect(guardFollowUps({})).toEqual([])
  })

  it('accepts short plain questions only', () => {
    const out = guardFollowUps([
      'How can I sleep better at night?',
      'what',
      'Tell me more about [Q1]?',
      'Is it in Sahih Muslim 2999?',
      'Not a question.',
      'How do I stay consistent with prayer?',
      'What should I do when I feel low?',
      'This one would be a fourth question?',
    ])
    expect(out).toEqual(['How can I sleep better at night?', 'How do I stay consistent with prayer?', 'What should I do when I feel low?'])
  })
})

describe('helpers', () => {
  it('splits sentences without breaking quotations or tags', () => {
    expect(splitSentences('One thing. [Q1] Then another. He said “be kind.” [H1] Done.')).toEqual([
      'One thing. [Q1]',
      'Then another.',
      'He said “be kind.” [H1]',
      'Done.',
    ])
  })

  it('splits text into plain parts and citation chips', () => {
    expect(splitCitations('Hearts rest [Q1] and ease follows [H2].')).toEqual([
      { type: 'text', value: 'Hearts rest ' },
      { type: 'cite', id: 'Q1' },
      { type: 'text', value: ' and ease follows ' },
      { type: 'cite', id: 'H2' },
      { type: 'text', value: '.' },
    ])
  })

  it('cleans titles', () => {
    expect(cleanTitle('"Overcoming anxiety."')).toBe('Overcoming anxiety')
    expect(cleanTitle(42)).toBe('')
    expect(cleanTitle('x'.repeat(200)).length).toBe(60)
  })
})
