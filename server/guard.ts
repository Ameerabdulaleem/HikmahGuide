import { extractCitations, normaliseTags } from '../src/shared/citations.js'
import { LIMITS } from '../src/shared/types.js'

// The model is only allowed to write about scripture that was retrieved for it. This
// module checks what it wrote. A sentence is dropped when it
//   * cites a hadith collection, a hadith number or a verse number of its own,
//   * says what Allah or the Prophet ﷺ said or did without pointing at a numbered source,
//   * or puts words in quotation marks that are not found in the retrieved sources.
// The aim is that nothing religious reaches the user unless the sources back it.

export interface GuardContext {
  /** Citation tags that exist for this answer, for example Q1, H1, D1 */
  allowedIds: ReadonlySet<string>
  /** Full text of every retrieved source, used to check quotations */
  sourceTexts: readonly string[]
}

export interface GuardResult {
  text: string
  dropped: number
  citations: string[]
}

const TAG_ANYWHERE = /\[([QHD]\d{1,2})\]/g
const HAS_TAG = /\[[QHD]\d{1,2}\]/

/** Removes markup, links and control characters, and flattens whitespace. */
export function cleanModelText(input: string): string {
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\[([^\]]+)\]\((?:https?:)?[^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/(\*\*|__|~~|`+)/g, '')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const SPLIT = /(?<=[.!?…]["”’)\]]*(?:\s*\[[QHD]\d{1,2}\])*)\s+(?!\[[QHD]\d{1,2}\])(?=["“‘(\[]?[A-Z0-9])/

export function splitSentences(text: string): string[] {
  return text
    .split(SPLIT)
    .map((s) => s.trim())
    .filter(Boolean)
}

const COLLECTION_WORDS =
  /\b(?:sahih\s+(?:al[-\s])?(?:bukhari|muslim)|(?:al[-\s])?bukhari|tirmidhi|tirmizi|abu\s+dawu?d|nasa['’]?i|ibn\s+maj(?:ah|a)|musnad|sunan|riyad(?:h)?\s+(?:us|al)[-\s]salihin|mishkat|hadith\s*(?:no\.?|number|#)\s*\d+)\b/i

const VERSE_CONTEXT = /\b(?:surah|sura|ayah|ayat|verse|verses|qur['’]?an)\b/i
const VERSE_NUMBERS = /\b(?:[1-9]|[1-9]\d|1[01]\d|11[0-4])\s*:\s*\d{1,3}\b/
const VERSE_IN_BRACKETS = /\(\s*\d{1,3}\s*:\s*\d{1,3}\s*\)/
const VERSE_WORDS = /\b(?:surah|sura)\s+[a-z'’-]+\W{1,3}(?:verse|ayah|ayat)\s*\d+/i

const SAID_PROPHET =
  /\b(?:the\s+)?(?:prophet|messenger|rasul(?:ullah)?|muhammad)\b[^.!?]{0,80}?\b(?:said|says|stated|told|narrated|reported|taught|advised|declared|instructed|promised|warned|used\s+to|would)\b/i
const SAID_ALLAH =
  /\b(?:allah|god|the\s+lord)\b[^.!?]{0,40}?\b(?:says|said|states|stated|tells|told|reveals|revealed|promises|promised|declares|declared|commands|commanded)\b/i
const SAID_OTHER =
  /\b(?:it\s+is\s+(?:narrated|reported|related)|narrated\s+by|reported\s+by|according\s+to\s+(?:a\s+|the\s+)?hadith|in\s+a\s+hadith|the\s+qur['’]?an\s+(?:says|states|tells|teaches|mentions|reminds|declares)|(?:companions?|sahaba|abu\s+bakr|umar|ali|aisha)\b[^.!?]{0,40}\b(?:said|narrated|reported))\b/i

function hasOwnReference(sentence: string): boolean {
  if (COLLECTION_WORDS.test(sentence)) return true
  if (VERSE_IN_BRACKETS.test(sentence) || VERSE_WORDS.test(sentence)) return true
  return VERSE_CONTEXT.test(sentence) && VERSE_NUMBERS.test(sentence)
}

function attributesSpeech(sentence: string): boolean {
  return SAID_PROPHET.test(sentence) || SAID_ALLAH.test(sentence) || SAID_OTHER.test(sentence)
}

/** Lower case words only, editorial brackets and tags removed, for comparing quotations. */
function squash(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/\[[^\]]*\]|\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function wordCount(text: string): number {
  return text.split(' ').filter(Boolean).length
}

function quotesAreGrounded(sentence: string, squashedSources: readonly string[]): boolean {
  for (const match of sentence.matchAll(/[“"]([^”"]{8,}?)[”"]/g)) {
    if (wordCount(squash(match[1])) < 5) continue
    const fragments = match[1].split(/…|\.{3}/).map(squash)
    for (const fragment of fragments) {
      if (wordCount(fragment) < 3) continue
      if (!squashedSources.some((source) => source.includes(fragment))) return false
    }
  }
  return true
}

function tidy(text: string): string {
  return text
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function guardProse(input: string, context: GuardContext): GuardResult {
  const squashedSources = context.sourceTexts.map(squash)
  const prepared = normaliseTags(cleanModelText(input)).replace(TAG_ANYWHERE, (tag, id: string) =>
    context.allowedIds.has(id) ? tag : '',
  )

  const kept: string[] = []
  let dropped = 0

  for (const raw of splitSentences(prepared)) {
    // A reference in brackets is removed first. The sentence survives if nothing else is wrong.
    const sentence = raw.replace(new RegExp(`\\s*\\([^()]*${COLLECTION_WORDS.source}[^()]*\\)`, 'gi'), '').trim()
    const tags = extractCitations(sentence)

    const ok =
      sentence.length > 0 &&
      !hasOwnReference(sentence) &&
      !(attributesSpeech(sentence) && tags.length === 0) &&
      quotesAreGrounded(sentence, squashedSources)

    if (ok) kept.push(sentence)
    else dropped += 1
  }

  const text = tidy(kept.join(' '))
  return { text, dropped, citations: extractCitations(text) }
}

/** Guards each item of a list and keeps only the ones that survive and are long enough. */
export function guardList(items: unknown, context: GuardContext, max: number, minChars = 12): string[] {
  if (!Array.isArray(items)) return []
  const out: string[] = []
  for (const item of items) {
    if (typeof item !== 'string') continue
    const { text } = guardProse(item.slice(0, LIMITS.listItem * 2), context)
    if (text.length >= minChars) out.push(text.slice(0, LIMITS.listItem))
    if (out.length >= max) break
  }
  return out
}

/** Follow up suggestions must be short plain questions with no references or tags. */
export function guardFollowUps(items: unknown, max = 3): string[] {
  if (!Array.isArray(items)) return []
  const out: string[] = []
  for (const item of items) {
    if (typeof item !== 'string') continue
    const text = cleanModelText(item)
    if (text.length < 10 || text.length > 140 || !text.endsWith('?')) continue
    if (HAS_TAG.test(text) || hasOwnReference(text)) continue
    out.push(text)
    if (out.length >= max) break
  }
  return out
}

export function cleanTitle(input: unknown): string {
  if (typeof input !== 'string') return ''
  return cleanModelText(input)
    .replace(/^["'“‘]+|["'”’.!?:;,\s]+$/g, '')
    .slice(0, 60)
    .trim()
}
