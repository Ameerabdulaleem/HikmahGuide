import { isHadithCollection } from './links.js'
import { LIMITS, type DuaSource, type GuidanceNote, type GuidanceResult, type HadithSource, type QuranSource } from './types.js'

// Runtime validation for data that crosses a trust boundary: the API response in the
// browser, and anything read back from local storage. Strings are clipped and
// control characters removed. Nothing here is ever rendered as HTML.

type Json = Record<string, unknown>

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

export function isRecord(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function cleanString(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  return value.replace(CONTROL, '').trim().slice(0, max)
}

function int(value: unknown, min: number, max: number): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max ? value : null
}

function cleanList(value: unknown, maxItems: number = LIMITS.listLength, maxLength: number = LIMITS.listItem): string[] {
  if (!Array.isArray(value)) return []
  const out: string[] = []
  for (const item of value) {
    const text = cleanString(item, maxLength)
    if (text) out.push(text)
    if (out.length >= maxItems) break
  }
  return out
}

const ID = /^[QHD]\d{1,2}$/
const KEY = /^[a-z0-9:]{3,40}$/

/** Returns the value only if it is a string that matches the pattern exactly. */
function exact(value: unknown, pattern: RegExp): string | null {
  return typeof value === 'string' && pattern.test(value) ? value : null
}

function parseQuran(value: unknown): QuranSource | null {
  if (!isRecord(value)) return null
  const id = exact(value.id, ID)
  const key = exact(value.key, KEY)
  const surah = int(value.surah, 1, 114)
  const ayah = int(value.ayah, 1, 286)
  const arabic = cleanString(value.arabic, LIMITS.field)
  const translation = cleanString(value.translation, LIMITS.field)
  const reference = cleanString(value.reference, 120)
  if (!id || !key || !surah || !ayah || !arabic || !translation || !reference) return null
  return {
    id,
    key,
    surah,
    ayah,
    surah_name: cleanString(value.surah_name, 80) ?? '',
    arabic,
    translation,
    reference,
    edition: cleanString(value.edition, 80) ?? '',
    verified: value.verified === true,
  }
}

function parseHadith(value: unknown): HadithSource | null {
  if (!isRecord(value)) return null
  const id = exact(value.id, ID)
  const key = exact(value.key, KEY)
  const number = int(value.number, 1, 99999)
  const text = cleanString(value.text, LIMITS.field)
  const reference = cleanString(value.reference, 120)
  if (!id || !key || !isHadithCollection(value.collection) || !number || !text || !reference) {
    return null
  }
  const grade = cleanString(value.grade, 80)
  return { id, key, collection: value.collection, number, text, reference, ...(grade ? { grade } : {}) }
}

function parseDua(value: unknown): DuaSource | null {
  if (!isRecord(value)) return null
  const id = exact(value.id, ID)
  const key = exact(value.key, KEY)
  const arabic = cleanString(value.arabic, LIMITS.field)
  const translation = cleanString(value.translation, LIMITS.field)
  if (!id || !key || !arabic || !translation) return null
  return {
    id,
    key,
    arabic,
    transliteration: cleanString(value.transliteration, LIMITS.field) ?? '',
    translation,
    reference: cleanString(value.reference, 200) ?? '',
  }
}

function parseNotes(value: unknown): GuidanceNote[] {
  if (!Array.isArray(value)) return []
  const notes: GuidanceNote[] = []
  for (const item of value.slice(0, 4)) {
    if (!isRecord(item)) continue
    const text = cleanString(item.text, 800)
    if (text && (item.kind === 'care' || item.kind === 'scholar' || item.kind === 'degraded')) {
      notes.push({ kind: item.kind, text })
    }
  }
  return notes
}

/** Returns a clean GuidanceResult, or null when the input is not a usable answer. */
export function parseGuidanceResult(input: unknown): GuidanceResult | null {
  if (!isRecord(input) || input.version !== 2) return null
  const mode = input.mode
  if (mode !== 'grounded' && mode !== 'sources_only' && mode !== 'redirect') return null

  const opening = cleanString(input.opening, LIMITS.field)
  const mainGuidance = cleanString(input.main_guidance, LIMITS.field)
  if (opening === null || !mainGuidance) return null

  const quran = (Array.isArray(input.quran) ? input.quran : []).slice(0, 6).map(parseQuran).filter((v): v is QuranSource => v !== null)
  const hadith = (Array.isArray(input.hadith) ? input.hadith : []).slice(0, 6).map(parseHadith).filter((v): v is HadithSource => v !== null)

  return {
    version: 2,
    mode,
    title: cleanString(input.title, 80) ?? '',
    themes: cleanList(input.themes, 4, 40),
    opening,
    main_guidance: mainGuidance,
    key_reflections: cleanList(input.key_reflections),
    practical_steps: cleanList(input.practical_steps),
    follow_ups: cleanList(input.follow_ups, 3, 160),
    quran,
    hadith,
    dua: parseDua(input.dua),
    notes: parseNotes(input.notes),
    hadith_themes: cleanList(input.hadith_themes, 4, 40),
    dua_theme: cleanString(input.dua_theme, 40) ?? '',
  }
}
