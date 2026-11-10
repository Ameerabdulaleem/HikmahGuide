// Types and limits shared by the serverless API and the browser app.
// The API payload keeps the snake_case names of the original /api/guidance contract
// (see A2MCP.md) and adds new fields on top, so existing consumers keep working.

export const HADITH_COLLECTIONS = [
  'bukhari',
  'muslim',
  'tirmidhi',
  'abudawud',
  'nasai',
  'ibnmajah',
  'ahmad',
] as const

export type HadithCollection = (typeof HADITH_COLLECTIONS)[number]

export const COLLECTION_NAMES: Record<HadithCollection, string> = {
  bukhari: 'Sahih al-Bukhari',
  muslim: 'Sahih Muslim',
  tirmidhi: 'Sunan al-Tirmidhi',
  abudawud: 'Sunan Abi Dawud',
  nasai: 'Sunan an-Nasa’i',
  ibnmajah: 'Sunan Ibn Majah',
  ahmad: 'Musnad Ahmad',
}

export interface QuranSource {
  /** Citation tag used inside the prose, for example Q1 */
  id: string
  /** Stable key, used to avoid repeating a source inside one conversation */
  key: string
  surah: number
  ayah: number
  surah_name: string
  arabic: string
  translation: string
  reference: string
  edition: string
  /** True when the text was fetched from the Qur'an API for this answer */
  verified: boolean
}

export interface HadithSource {
  id: string
  key: string
  collection: HadithCollection
  number: number
  text: string
  reference: string
  /** For example "Ḥasan, graded by al-Albānī". Absent when no grade is verified. */
  grade?: string
}

export interface DuaSource {
  id: string
  key: string
  arabic: string
  transliteration: string
  translation: string
  reference: string
}

export type NoteKind = 'care' | 'scholar' | 'degraded'

export interface GuidanceNote {
  kind: NoteKind
  text: string
}

export type GuidanceMode = 'grounded' | 'sources_only' | 'redirect'

export interface GuidanceResult {
  version: 2
  /**
   * grounded: written by the model, strictly from the retrieved sources.
   * sources_only: compiled directly from the sources (model unavailable or rejected).
   * redirect: the question is outside what this app helps with.
   */
  mode: GuidanceMode
  title: string
  themes: string[]
  opening: string
  main_guidance: string
  key_reflections: string[]
  practical_steps: string[]
  follow_ups: string[]
  quran: QuranSource[]
  hadith: HadithSource[]
  dua: DuaSource | null
  notes: GuidanceNote[]
  /** Kept for the original API contract */
  hadith_themes: string[]
  dua_theme: string
}

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

export interface GuidanceRequest {
  question: string
  history?: ChatTurn[]
  /** Source keys already shown in this conversation */
  exclude?: string[]
}

export const LIMITS = {
  question: 1200,
  historyTurns: 12,
  historyChars: 2000,
  excludeKeys: 40,
  field: 4000,
  listItem: 600,
  listLength: 8,
} as const

export const SOURCE_KEY_PATTERN = /^(?:quran:\d{1,3}:\d{1,3}|hadith:[a-z]{3,12}:\d{1,5}|dua:[0-9a-f]{8})$/
