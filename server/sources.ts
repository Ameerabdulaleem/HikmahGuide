import { DUA_LIBRARY, type Dua } from './data/duaLibrary.js'
import { gradeLabel } from './data/hadithGrades.js'
import { HADITH_LIBRARY } from './data/hadithLibrary.js'
import { QURAN_LIBRARY, type QuranRef } from './data/quranLibrary.js'
import type { ThemeKey } from './data/themes.js'
import { parseHadithRef, hadithReference } from '../src/shared/links.js'
import type { HadithCollection } from '../src/shared/types.js'

// Retrieval over the curated libraries. Everything shown to the user as scripture is
// chosen here, by theme, never by the model.

export interface HadithEntry {
  key: string
  collection: HadithCollection
  number: number
  text: string
  reference: string
  grade: string | null
}

export interface DuaEntry {
  key: string
  arabic: string
  transliteration: string
  translation: string
  reference: string
}

export interface VerseCandidate extends QuranRef {
  key: string
}

/** Themes that borrow another theme's entries when a library has none of its own. */
const HADITH_ALIASES: Partial<Record<ThemeKey, ThemeKey[]>> = {
  guidance: ['trust', 'intention', 'general'],
}

const DUA_ALIASES: Partial<Record<ThemeKey, ThemeKey[]>> = {
  kindness: ['character'],
  humility: ['character'],
  honesty: ['character'],
  intention: ['guidance'],
  charity: ['general'],
  brotherhood: ['general'],
  death: ['forgiveness'],
}

const ALIAS_WEIGHT = 0.6

const STOPWORDS = new Set(
  'about after again also because been before being does doing from have having into just like make more most much need only other really should some than that their them then there these they this very what when where which while will with would your'.split(
    ' ',
  ),
)

export function hash32(input: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

function words(text: string): Set<string> {
  const found = text.toLowerCase().match(/[a-z]{4,}/g) ?? []
  return new Set(found.filter((w) => !STOPWORDS.has(w)))
}

function overlap(question: Set<string>, text: string): number {
  let hits = 0
  for (const w of words(text)) if (question.has(w)) hits += 1
  return Math.min(hits, 3)
}

function hadithEntries(theme: string): HadithEntry[] {
  const list = HADITH_LIBRARY[theme] ?? []
  const entries: HadithEntry[] = []
  for (const item of list) {
    const parsed = parseHadithRef(item.source)
    if (!parsed) continue
    entries.push({
      key: `hadith:${parsed.collection}:${parsed.number}`,
      collection: parsed.collection,
      number: parsed.number,
      text: item.text,
      reference: hadithReference(parsed.collection, parsed.number),
      grade: gradeLabel(parsed.collection, parsed.number),
    })
  }
  return entries
}

export function duaKey(dua: Dua): string {
  return `dua:${hash32(dua.arabic).toString(16).padStart(8, '0')}`
}

function duaEntries(theme: string): DuaEntry[] {
  return (DUA_LIBRARY[theme] ?? []).map((dua) => ({
    key: duaKey(dua),
    arabic: dua.arabic,
    transliteration: dua.transliteration,
    translation: dua.translation,
    reference: dua.source,
  }))
}

function jitter(key: string, seed: string): number {
  return ((hash32(`${key}|${seed}`) % 1000) / 1000) * 0.06
}

function themeList(themes: ThemeKey[]): ThemeKey[] {
  return themes.length > 0 ? themes : ['general']
}

interface Scored<T> {
  item: T
  score: number
}

/**
 * Round robin over the themes, best entry of each theme first, so a question about
 * anxiety and trust gets something from both. Sources already shown in this
 * conversation go to the back, and are only reached when nothing fresh is left.
 */
function interleave<T extends { key: string }>(lists: Array<Array<Scored<T>>>, exclude: ReadonlySet<string>): T[] {
  const sorted = lists.map((list) => [...list].sort((a, b) => b.score - a.score))
  const fresh: T[] = []
  const repeated: T[] = []
  const seen = new Set<string>()
  const longest = Math.max(0, ...sorted.map((list) => list.length))

  for (let i = 0; i < longest; i += 1) {
    for (const list of sorted) {
      const entry = list[i]
      if (!entry || seen.has(entry.item.key)) continue
      seen.add(entry.item.key)
      ;(exclude.has(entry.item.key) ? repeated : fresh).push(entry.item)
    }
  }
  return [...fresh, ...repeated]
}

/** Chooses distinct hadith for the themes, preferring ones that match the question's words. */
export function pickHadith(themes: ThemeKey[], question: string, exclude: ReadonlySet<string>, count = 2): HadithEntry[] {
  const questionWords = words(question)

  const scoreList = (theme: string, base: number): Array<Scored<HadithEntry>> =>
    hadithEntries(theme).map((item, position) => ({
      item,
      score: base + overlap(questionWords, item.text) * 0.12 + jitter(item.key, question) - position * 0.01,
    }))

  const lists = themeList(themes).map((theme) => [
    ...scoreList(theme, 1),
    ...(HADITH_ALIASES[theme] ?? []).flatMap((alias) => scoreList(alias, ALIAS_WEIGHT)),
  ])
  lists.push(scoreList('general', 0.2))

  return interleave(lists, exclude).slice(0, count)
}

export function pickDua(themes: ThemeKey[], question: string, exclude: ReadonlySet<string>): DuaEntry | null {
  const scoreList = (theme: string, base: number): Array<Scored<DuaEntry>> =>
    duaEntries(theme).map((item, position) => ({ item, score: base - position * 0.02 + jitter(item.key, question) }))

  const lists = themeList(themes).map((theme) => [
    ...scoreList(theme, 1),
    ...(DUA_ALIASES[theme] ?? []).flatMap((alias) => scoreList(alias, ALIAS_WEIGHT)),
  ])
  lists.push(scoreList('general', 0.2))

  return interleave(lists, exclude)[0] ?? null
}

/**
 * Ranks verse references for the themes. The caller fetches the text and keeps the first
 * verses that verify, so a few extra candidates are returned as spares.
 */
export function pickVerseRefs(themes: ThemeKey[], question: string, exclude: ReadonlySet<string>, count = 5): VerseCandidate[] {
  const lists = themeList(themes).map((theme) =>
    (QURAN_LIBRARY[theme] ?? []).map((ref, position) => {
      const key = `quran:${ref.surah}:${ref.ayah}`
      return { item: { ...ref, key }, score: 1 - position * 0.02 + jitter(key, question) }
    }),
  )
  return interleave(lists, exclude).slice(0, count)
}
