import { describe, expect, it } from 'vitest'
import { DUA_LIBRARY } from '../server/data/duaLibrary'
import { HADITH_LIBRARY } from '../server/data/hadithLibrary'
import { QURAN_LIBRARY } from '../server/data/quranLibrary'
import { gradeLabel, HADITH_GRADES } from '../server/data/hadithGrades'
import { THEME_GUIDE } from '../server/data/themeGuide'
import { detectCrisis, detectThemes, isThemeKey, THEME_KEYS, THEMES } from '../server/data/themes'
import { pickDua, pickHadith, pickVerseRefs } from '../server/sources'
import { parseHadithRef, parseSourceRefs, quranUrl, refUrl, sunnahUrl } from '../src/shared/links'

// Verse counts of the 114 surahs. The total of 6236 is the well known size of the Qur'an,
// which doubles as a check that this table itself is right.
const AYAH_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83,
  182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40,
  31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
]

describe('Qur’an index', () => {
  it('uses a correct table of verse counts', () => {
    expect(AYAH_COUNTS).toHaveLength(114)
    expect(AYAH_COUNTS.reduce((a, b) => a + b, 0)).toBe(6236)
  })

  it('covers every theme with real surah and ayah numbers and no duplicates', () => {
    for (const theme of THEME_KEYS) {
      const refs = QURAN_LIBRARY[theme]
      expect(refs.length, theme).toBeGreaterThanOrEqual(2)
      const seen = new Set<string>()
      for (const { surah, ayah } of refs) {
        expect(surah, `${theme} ${surah}:${ayah}`).toBeGreaterThanOrEqual(1)
        expect(surah, `${theme} ${surah}:${ayah}`).toBeLessThanOrEqual(114)
        expect(ayah, `${theme} ${surah}:${ayah}`).toBeGreaterThanOrEqual(1)
        expect(ayah, `${theme} ${surah}:${ayah}`).toBeLessThanOrEqual(AYAH_COUNTS[surah - 1])
        expect(seen.has(`${surah}:${ayah}`), `${theme} repeats ${surah}:${ayah}`).toBe(false)
        seen.add(`${surah}:${ayah}`)
      }
    }
  })
})

describe('ḥadīth library', () => {
  it('gives every entry text and a citation that resolves to a collection and number', () => {
    let count = 0
    for (const [theme, list] of Object.entries(HADITH_LIBRARY)) {
      expect(isThemeKey(theme) || theme === 'general', `unknown theme ${theme}`).toBe(true)
      for (const item of list) {
        count += 1
        expect(item.text.trim().length, item.source).toBeGreaterThan(15)
        const ref = parseHadithRef(item.source)
        expect(ref, `unparseable source: ${item.source}`).not.toBeNull()
      }
    }
    expect(count).toBeGreaterThan(80)
  })

  it('has a grade on record for every narration outside the two Ṣaḥīḥ collections and Musnad Aḥmad', () => {
    for (const list of Object.values(HADITH_LIBRARY)) {
      for (const item of list) {
        const ref = parseHadithRef(item.source)!
        if (ref.collection === 'bukhari' || ref.collection === 'muslim' || ref.collection === 'ahmad') continue
        expect(HADITH_GRADES[`${ref.collection}:${ref.number}`], `no grade for ${item.source}`).toBeDefined()
      }
    }
    for (const key of Object.keys(HADITH_GRADES)) {
      const [collection, number] = key.split(':')
      const present = Object.values(HADITH_LIBRARY).flat().some((h) => {
        const ref = parseHadithRef(h.source)
        return ref?.collection === collection && ref.number === Number(number)
      })
      expect(present, `${key} has a grade but is not in the library`).toBe(true)
    }
  })

  it('labels grades without claiming more than is known', () => {
    expect(gradeLabel('bukhari', 5641)).toBe('Ṣaḥīḥ collection')
    expect(gradeLabel('tirmidhi', 2346)).toBe('Ḥasan, graded by al-Albānī')
    expect(gradeLabel('ahmad', 2803)).toBeNull()
    expect(gradeLabel('ibnmajah', 224)).toBeNull()
  })

  it('has at least two ḥadīth for every theme once aliases are applied', () => {
    for (const theme of THEME_KEYS) {
      expect(pickHadith([theme], 'anything', new Set(), 2), theme).toHaveLength(2)
    }
  })
})

describe('duʿāʾ library', () => {
  it('cites a parseable source for every entry', () => {
    for (const list of Object.values(DUA_LIBRARY)) {
      for (const dua of list) {
        expect(dua.arabic.length).toBeGreaterThan(5)
        expect(dua.translation.length).toBeGreaterThan(10)
        expect(parseSourceRefs(dua.source).length, dua.source).toBeGreaterThan(0)
      }
    }
  })

  it('finds a duʿāʾ for every theme', () => {
    for (const theme of THEME_KEYS) expect(pickDua([theme], 'x', new Set()), theme).not.toBeNull()
  })
})

describe('themes', () => {
  it('has guidance text for every theme', () => {
    for (const theme of THEME_KEYS) {
      expect(THEME_GUIDE[theme].reflections).toHaveLength(2)
      expect(THEME_GUIDE[theme].steps).toHaveLength(3)
      expect(THEME_GUIDE[theme].followUps).toHaveLength(2)
      expect(THEMES[theme].description.length).toBeGreaterThan(5)
    }
  })

  it('detects themes from everyday wording', () => {
    expect(detectThemes('I feel anxious and I cannot stop worrying').themes[0]).toBe('anxiety')
    expect(detectThemes('I lost my job and I have rent and debt to pay').themes[0]).toBe('provision')
    expect(detectThemes('Guidance on a career decision').themes).toContain('guidance')
    expect(detectThemes('My husband and I keep arguing').themes).toContain('marriage')
    expect(detectThemes('blue sky').themes).toEqual([])
  })

  it('does not fire on parts of unrelated words', () => {
    expect(detectThemes('He is a student of design').themes).not.toContain('death')
    expect(detectThemes('a signature on the page').themes).not.toContain('forgiveness')
  })

  it('flags wording that suggests a person may be in danger', () => {
    expect(detectCrisis('I want to die')).toBe(true)
    expect(detectCrisis('I keep thinking about suicide')).toBe(true)
    expect(detectCrisis("I don't want to live anymore")).toBe(true)
    expect(detectCrisis('My exam is killing me with stress')).toBe(false)
    expect(detectCrisis('How do I overcome anxiety?')).toBe(false)
  })
})

describe('retrieval', () => {
  it('gives each theme a turn and avoids repeats', () => {
    const refs = pickVerseRefs(['anxiety', 'forgiveness'], 'help', new Set(), 4)
    expect(new Set(refs.map((r) => r.key)).size).toBe(4)
    const keys = refs.slice(0, 2).map((r) => r.key)
    const anxiety = new Set(QURAN_LIBRARY.anxiety.map((r) => `quran:${r.surah}:${r.ayah}`))
    const forgiveness = new Set(QURAN_LIBRARY.forgiveness.map((r) => `quran:${r.surah}:${r.ayah}`))
    expect(keys.some((k) => anxiety.has(k))).toBe(true)
    expect(keys.some((k) => forgiveness.has(k))).toBe(true)
  })

  it('moves sources already shown in the conversation to the back', () => {
    const first = pickHadith(['patience'], 'how to be patient', new Set(), 2)
    const next = pickHadith(['patience'], 'how to be patient', new Set(first.map((h) => h.key)), 2)
    for (const h of next) expect(first.map((f) => f.key)).not.toContain(h.key)
  })

  it('still answers when everything in a theme has been used', () => {
    const all = new Set(Object.values(HADITH_LIBRARY).flat().map((h) => `hadith:${parseHadithRef(h.source)!.collection}:${parseHadithRef(h.source)!.number}`))
    expect(pickHadith(['intention'], 'x', all, 2)).toHaveLength(2)
  })

  it('is stable for the same question', () => {
    const a = pickHadith(['anxiety', 'trust'], 'same question', new Set(), 2).map((h) => h.key)
    const b = pickHadith(['anxiety', 'trust'], 'same question', new Set(), 2).map((h) => h.key)
    expect(a).toEqual(b)
  })
})

describe('source links', () => {
  it('builds links for the two sites only', () => {
    expect(sunnahUrl('bukhari', 5641)).toBe('https://sunnah.com/bukhari:5641')
    expect(quranUrl(13, 28)).toBe('https://quran.com/13/28')
    expect(new URL(refUrl({ type: 'hadith', collection: 'muslim', number: 2999 })!).host).toBe('sunnah.com')
  })

  it('does not link collections whose pages were not confirmed', () => {
    expect(sunnahUrl('ahmad', 2803)).toBeNull()
    expect(refUrl({ type: 'hadith', collection: 'ahmad', number: 8952 })).toBeNull()
  })

  it('reads references from citation strings', () => {
    expect(parseHadithRef('Sunan an-Nasa’i 3104')).toEqual({ collection: 'nasai', number: 3104 })
    expect(parseSourceRefs('Hisnul Muslim; Sahih al-Bukhari 6346, Sahih Muslim 2730')).toEqual([
      { type: 'hadith', collection: 'bukhari', number: 6346 },
      { type: 'hadith', collection: 'muslim', number: 2730 },
    ])
    expect(parseSourceRefs('Hisnul Muslim; Qurʾān, Al-Baqarah 2:250')).toEqual([{ type: 'quran', surah: 2, ayah: 250 }])
    expect(parseHadithRef('Something else 12')).toBeNull()
  })
})
