import { COLLECTION_NAMES, HADITH_COLLECTIONS, type HadithCollection } from './types.js'

// Relative imports in shared and server code carry a .js extension because the
// serverless function runs as native ESM. Vite and tsc map them back to .ts.
//
// Links are always rebuilt from validated numbers, never read from stored or
// server supplied strings, so a tampered record can not smuggle in another URL.

/** Collections whose numbered pages on sunnah.com were checked. Musnad Aḥmad is not linked. */
const LINKED: readonly HadithCollection[] = ['bukhari', 'muslim', 'tirmidhi', 'abudawud', 'nasai', 'ibnmajah']

export function sunnahUrl(collection: HadithCollection, number: number): string | null {
  return LINKED.includes(collection) ? `https://sunnah.com/${collection}:${Math.trunc(number)}` : null
}

export function quranUrl(surah: number, ayah: number): string {
  return `https://quran.com/${Math.trunc(surah)}/${Math.trunc(ayah)}`
}

export function isHadithCollection(value: unknown): value is HadithCollection {
  return typeof value === 'string' && (HADITH_COLLECTIONS as readonly string[]).includes(value)
}

export type SourceRef =
  | { type: 'hadith'; collection: HadithCollection; number: number }
  | { type: 'quran'; surah: number; ayah: number }

const NAME_PATTERNS: Array<[HadithCollection, string]> = [
  ['bukhari', 'sahih al-bukhari'],
  ['muslim', 'sahih muslim'],
  ['tirmidhi', 'sunan al-tirmidhi'],
  ['abudawud', 'sunan abi dawud'],
  ['nasai', "sunan an-nasa'i"],
  ['ibnmajah', 'sunan ibn majah'],
  ['ahmad', 'musnad ahmad'],
]

function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘ʿʾ`]/g, "'")
}

/**
 * Reads every reference in a citation string such as
 * "Hisnul Muslim; Sahih al-Bukhari 6346, Sahih Muslim 2730" or
 * "Hisnul Muslim; Qurʾān, Al-Baqarah 2:250".
 */
export function parseSourceRefs(source: string): SourceRef[] {
  const text = normalise(source)
  const refs: SourceRef[] = []

  for (const [collection, name] of NAME_PATTERNS) {
    const pattern = new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+(\\d{1,5})`, 'g')
    for (const match of text.matchAll(pattern)) {
      refs.push({ type: 'hadith', collection, number: Number(match[1]) })
    }
  }

  if (/qur'?an/.test(text)) {
    for (const match of text.matchAll(/\b(\d{1,3}):(\d{1,3})\b/g)) {
      const surah = Number(match[1])
      const ayah = Number(match[2])
      if (surah >= 1 && surah <= 114 && ayah >= 1) refs.push({ type: 'quran', surah, ayah })
    }
  }

  return refs
}

/** Parses a single hadith citation such as "Sahih Muslim 2999". */
export function parseHadithRef(source: string): { collection: HadithCollection; number: number } | null {
  const ref = parseSourceRefs(source).find((r) => r.type === 'hadith')
  return ref && ref.type === 'hadith' ? { collection: ref.collection, number: ref.number } : null
}

export function hadithReference(collection: HadithCollection, number: number): string {
  return `${COLLECTION_NAMES[collection]} ${number}`
}

export function refUrl(ref: SourceRef): string | null {
  return ref.type === 'hadith' ? sunnahUrl(ref.collection, ref.number) : quranUrl(ref.surah, ref.ayah)
}
