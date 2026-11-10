import { cleanString, isRecord } from '../src/shared/validate.js'

// Fetches a verse from AlQuran Cloud (https://alquran.cloud), the authority behind every
// Qur'an verse HikmahGuide shows. The response is checked against the reference that was
// asked for, so a wrong or malformed reply can never be shown as scripture.
//
// The service allows 12 requests per second, so each verse is one request (both editions
// together), results are cached, and rate limit replies are retried after a short pause.

export interface VerseData {
  surah: number
  ayah: number
  surahName: string
  arabic: string
  translation: string
}

export interface QuranClient {
  getVerse(surah: number, ayah: number): Promise<VerseData | null>
}

export const ARABIC_EDITION = 'quran-uthmani'
export const TRANSLATION_EDITION = 'en.sahih'

interface Options {
  baseUrl?: string
  fetchImpl?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  timeoutMs?: number
  ttlMs?: number
  maxEntries?: number
}

interface Edition {
  text: string
  surahName: string
}

/**
 * A few translations open a quotation that closes in the next verse, so the text can end
 * (or begin) with a single stray quotation mark. It is removed so it does not clash with
 * the quotation marks the page adds. No wording is changed.
 */
export function tidyQuotes(text: string): string {
  const count = (text.match(/"/g) ?? []).length
  if (count % 2 === 0) return text
  if (text.endsWith('"')) return text.slice(0, -1).trimEnd()
  if (text.startsWith('"')) return text.slice(1).trimStart()
  return text
}

function readEdition(entry: unknown, surah: number, ayah: number, edition: string): Edition | null {
  if (!isRecord(entry) || entry.numberInSurah !== ayah) return null
  if (!isRecord(entry.surah) || entry.surah.number !== surah) return null
  if (!isRecord(entry.edition) || entry.edition.identifier !== edition) return null

  const text = cleanString(entry.text, 3000)
  if (!text) return null
  return { text, surahName: cleanString(entry.surah.englishName, 80) ?? '' }
}

function readBody(body: unknown, surah: number, ayah: number): VerseData | null {
  if (!isRecord(body) || body.code !== 200 || !Array.isArray(body.data)) return null
  const arabic = readEdition(body.data.find((e) => isRecord(e) && isRecord(e.edition) && e.edition.identifier === ARABIC_EDITION), surah, ayah, ARABIC_EDITION)
  const english = readEdition(body.data.find((e) => isRecord(e) && isRecord(e.edition) && e.edition.identifier === TRANSLATION_EDITION), surah, ayah, TRANSLATION_EDITION)
  if (!arabic || !english) return null
  return { surah, ayah, surahName: english.surahName || arabic.surahName, arabic: arabic.text, translation: tidyQuotes(english.text) }
}

const BACKOFF_MS = [250, 700]
const MAX_ATTEMPTS = 3

export function createQuranClient(options: Options = {}): QuranClient {
  const baseUrl = (options.baseUrl ?? process.env.QURAN_API_BASE ?? 'https://api.alquran.cloud/v1').replace(/\/+$/, '')
  const doFetch = options.fetchImpl ?? fetch
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)))
  const timeoutMs = options.timeoutMs ?? 6000
  const ttlMs = options.ttlMs ?? 24 * 60 * 60 * 1000
  const maxEntries = options.maxEntries ?? 500
  const cache = new Map<string, { value: VerseData; expires: number }>()

  async function fetchVerse(surah: number, ayah: number): Promise<VerseData | null> {
    const url = `${baseUrl}/ayah/${surah}:${ayah}/editions/${ARABIC_EDITION},${TRANSLATION_EDITION}`

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      let wait = BACKOFF_MS[attempt] ?? 700
      try {
        const response = await doFetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(timeoutMs) })
        if (response.ok) return readBody(await response.json(), surah, ayah)
        if (response.status !== 429 && response.status < 500) return null

        // Rate limited or a server hiccup. Honour a short Retry-After, never a long one.
        const retryAfter = Number(response.headers.get('retry-after'))
        if (Number.isFinite(retryAfter) && retryAfter > 0) wait = Math.min(retryAfter * 1000, 1500)
      } catch {
        // Network error or timeout. Pause, then try again.
      }
      if (attempt < MAX_ATTEMPTS - 1) await sleep(wait)
    }
    return null
  }

  return {
    async getVerse(surah, ayah) {
      if (!Number.isInteger(surah) || !Number.isInteger(ayah) || surah < 1 || surah > 114 || ayah < 1 || ayah > 286) {
        return null
      }

      const key = `${surah}:${ayah}`
      const hit = cache.get(key)
      if (hit && hit.expires > Date.now()) return hit.value

      const value = await fetchVerse(surah, ayah)
      if (!value) return null

      if (cache.size >= maxEntries) cache.delete(cache.keys().next().value as string)
      cache.set(key, { value, expires: Date.now() + ttlMs })
      return value
    },
  }
}
