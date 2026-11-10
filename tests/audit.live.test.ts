import { describe, expect, it } from 'vitest'
import { DUA_LIBRARY } from '../server/data/duaLibrary'
import { HADITH_GRADES } from '../server/data/hadithGrades'
import { HADITH_LIBRARY } from '../server/data/hadithLibrary'
import { QURAN_LIBRARY } from '../server/data/quranLibrary'
import { createQuranClient } from '../server/quranClient'
import { COLLECTION_NAMES, type HadithCollection } from '../src/shared/types'
import { parseHadithRef, parseSourceRefs } from '../src/shared/links'

// A live audit of the curated libraries against independent, public sources. It needs
// internet access, so it only runs when you ask for it:
//
//   npm run audit:sources
//
// It checks three things:
//   1. every verse in the Qur'an index can be fetched through the same client the app uses,
//      and it prints the English text so a person can confirm each verse fits its theme,
//   2. every ḥadīth citation points at a ḥadīth that really carries that text,
//   3. no ḥadīth in the library breaks the inclusion rule (see server/data/hadithGrades.ts),
//      and the grade table matches the dataset,
//   4. every duʿāʾ matches the narration or verse it cites.
//
// Data: AlQuran Cloud for the Qur'an and the open fawazahmed0/hadith-api dataset for ḥadīth.

const LIVE = process.env.AUDIT_LIVE === '1'
const run = LIVE ? describe : describe.skip

const HADITH_EDITIONS: Partial<Record<HadithCollection, string>> = {
  bukhari: 'eng-bukhari',
  muslim: 'eng-muslim',
  tirmidhi: 'eng-tirmidhi',
  abudawud: 'eng-abudawud',
  nasai: 'eng-nasai',
  ibnmajah: 'eng-ibnmajah',
}
const HADITH_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions'

const STOP = new Set('that this with from have been were they them their will would your what when which there about into than then also only some more most very just like make being does doing'.split(' '))

function words(text: string): Set<string> {
  return new Set((text.toLowerCase().match(/[a-z]{4,}/g) ?? []).filter((w) => !STOP.has(w)))
}

/** How much of the smaller text is found in the other. Forgiving of excerpts and of different translations. */
function overlap(a: string, b: string): number {
  const wa = words(a)
  const wb = words(b)
  if (wa.size === 0 || wb.size === 0) return 0
  let hits = 0
  for (const w of wa) if (wb.has(w)) hits += 1
  return hits / Math.min(wa.size, wb.size)
}

/**
 * How much of a transliteration appears in another text, compared by runs of six letters with
 * accents, spaces and punctuation removed. That way "Allāhumma innī" matches "Allahumma inni",
 * and "Subḥānallāh" matches "Subhan Allah".
 */
function translitOverlap(a: string, b: string): number {
  const plain = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]+/g, '')
  const grams = (t: string) => new Set(Array.from({ length: Math.max(0, t.length - 5) }, (_, i) => t.slice(i, i + 6)))
  const mine = grams(plain(a))
  const theirs = grams(plain(b))
  if (mine.size === 0) return 0
  let hits = 0
  for (const g of mine) if (theirs.has(g)) hits += 1
  return hits / mine.size
}

interface RemoteHadith {
  hadithnumber: number
  /** The sunnah.com style number. Sahih Muslim, for example, counts by this, not by hadithnumber. */
  arabicnumber?: number | string
  text: string
  grades?: Array<{ name?: string; grade?: string }>
}

interface Edition {
  all: RemoteHadith[]
  /** Every ḥadīth filed under a number, by either numbering scheme (a number can hold several narrations). */
  byNumber: Map<number, RemoteHadith[]>
}

async function loadEdition(edition: string): Promise<Edition> {
  const response = await fetch(`${HADITH_BASE}/${edition}.json`)
  expect(response.ok, `${edition} download failed with ${response.status}`).toBe(true)
  const body = (await response.json()) as { hadiths?: RemoteHadith[] }
  const all = body.hadiths ?? []
  const byNumber = new Map<number, RemoteHadith[]>()
  const file = (n: unknown, h: RemoteHadith) => {
    const num = Number.parseInt(String(n), 10)
    if (Number.isFinite(num)) byNumber.set(num, [...(byNumber.get(num) ?? []), h])
  }
  for (const h of all) {
    file(h.hadithnumber, h)
    if (String(h.arabicnumber) !== String(h.hadithnumber)) file(h.arabicnumber, h)
  }
  return { all, byNumber }
}

async function inBatches<T, R>(items: T[], size: number, work: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = []
  for (let i = 0; i < items.length; i += size) out.push(...(await Promise.all(items.slice(i, i + size).map(work))))
  return out
}

const editions = new Map<string, Edition>()

async function ensureEditions() {
  if (editions.size > 0) return
  for (const [collection, edition] of Object.entries(HADITH_EDITIONS)) editions.set(collection, await loadEdition(edition))
}

run('live source audit', () => {
  it('fetches every indexed Qur’an verse through the app’s own client', async () => {
    const client = createQuranClient({ timeoutMs: 15000 })
    const refs = new Map<string, string[]>()
    for (const [theme, list] of Object.entries(QURAN_LIBRARY)) {
      for (const { surah, ayah } of list) refs.set(`${surah}:${ayah}`, [...(refs.get(`${surah}:${ayah}`) ?? []), theme])
    }

    const entries = [...refs.entries()]
    const results = await inBatches(entries, 4, async ([key, themes]) => {
      await new Promise((resolve) => setTimeout(resolve, 150))
      const [surah, ayah] = key.split(':').map(Number)
      return { key, themes, verse: await client.getVerse(surah, ayah) }
    })

    const missing = results.filter((r) => !r.verse).map((r) => r.key)
    for (const { key, themes, verse } of results) {
      if (verse) console.log(`QURAN ${key.padEnd(7)} [${themes.join(',')}] ${verse.surahName}: ${verse.translation}`)
    }
    expect(missing, `verses that could not be fetched and verified: ${missing.join(', ')}`).toEqual([])
  }, 300_000)

  it('matches every ḥadīth citation to a ḥadīth with the same content, and none is graded weak', async () => {
    await ensureEditions()

    const seen = new Set<string>()
    const wrong: string[] = []
    const weak: string[] = []
    const disputed: string[] = []
    const gradeMismatch: string[] = []
    const review: string[] = []
    const unchecked: string[] = []

    for (const [theme, list] of Object.entries(HADITH_LIBRARY)) {
      for (const item of list) {
        const ref = parseHadithRef(item.source)!
        const id = `${ref.collection}:${ref.number}:${item.text.slice(0, 24)}`
        if (seen.has(id)) continue
        seen.add(id)

        const data = editions.get(ref.collection)
        if (!data) {
          unchecked.push(`${COLLECTION_NAMES[ref.collection]} ${ref.number} (${theme}) has no open dataset, check it by hand`)
          continue
        }

        const candidates = data.byNumber.get(ref.number) ?? []
        const claimed = candidates.reduce<RemoteHadith | undefined>((top, h) => (!top || overlap(item.text, h.text) > overlap(item.text, top.text) ? h : top), undefined)
        const claimedScore = claimed ? overlap(item.text, claimed.text) : 0
        let best = { number: 0, score: 0 }
        if (claimedScore < 0.6) {
          for (const h of data.all) {
            const score = overlap(item.text, h.text)
            if (score > best.score) best = { number: Number.parseInt(String(h.arabicnumber ?? h.hadithnumber), 10), score }
          }
        }

        const label = `${COLLECTION_NAMES[ref.collection]} ${ref.number} (${theme}): "${item.text.slice(0, 60)}…"`
        if (!claimed) wrong.push(`${label} → number does not exist in the dataset`)
        else if (claimedScore < 0.25 && best.score >= 0.6) wrong.push(`${label} → text matches ${best.number} (${best.score.toFixed(2)}) not ${ref.number} (${claimedScore.toFixed(2)})`)
        else if (claimedScore < 0.6) review.push(`${label} → overlap ${claimedScore.toFixed(2)}${best.score >= 0.6 ? `, closer match at ${best.number}` : ''} | dataset: "${claimed.text.slice(0, 110)}…"`)

        const grades = candidates.flatMap((h) => h.grades ?? [])
        const isWeak = (g: { grade?: string }) => /da['’]?if|weak|munkar|mawdu|fabricated/i.test(g.grade ?? '')
        const weakGraders = grades.filter(isWeak)
        const albaniWeak = weakGraders.some((g) => /albani/i.test(g.name ?? ''))
        if (albaniWeak || weakGraders.length >= 2) weak.push(`${label} → ${weakGraders.map((g) => `${g.name}: ${g.grade}`).join('; ')}`)
        else if (weakGraders.length === 1) disputed.push(`${label} → only ${weakGraders[0].name} says ${weakGraders[0].grade}`)

        // The grade shown in the app must be what the dataset says al-Albānī graded it.
        const row = HADITH_GRADES[`${ref.collection}:${ref.number}`]
        if (row) {
          const theirs = grades.find((g) => /albani/i.test(g.name ?? ''))?.grade ?? ''
          const norm = (x: string) => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z ]/g, '').trim()
          if (norm(theirs) !== norm(row.grade)) gradeMismatch.push(`${ref.collection}:${ref.number} table says ${row.grade}, dataset says "${theirs}"`)
        }
      }
    }

    if (review.length) console.log(`\nREVIEW BY HAND (${review.length}):\n${review.join('\n')}`)
    if (disputed.length) console.log(`\nKEPT, BUT ONE GRADER DISSENTS (${disputed.length}):\n${disputed.join('\n')}`)
    if (unchecked.length) console.log(`\nNOT COVERED BY THE DATASET (${unchecked.length}):\n${unchecked.join('\n')}`)
    console.log(`\nAudited ${seen.size} ḥadīth entries.`)

    expect(wrong, `citations that point at the wrong ḥadīth:\n${wrong.join('\n')}`).toEqual([])
    expect(weak, `ḥadīth graded weak:\n${weak.join('\n')}`).toEqual([])
    expect(gradeMismatch, `grade table out of date:\n${gradeMismatch.join('\n')}`).toEqual([])
  }, 300_000)

  it('matches every duʿāʾ to the narration or verse it cites', async () => {
    await ensureEditions()
    const client = createQuranClient({ timeoutMs: 15000 })
    const problems: string[] = []
    const seen = new Set<string>()
    let checked = 0

    for (const [theme, list] of Object.entries(DUA_LIBRARY)) {
      for (const dua of list) {
        if (seen.has(dua.arabic)) continue
        seen.add(dua.arabic)

        const scores: number[] = []
        for (const ref of parseSourceRefs(dua.source)) {
          if (ref.type === 'hadith') {
            const data = editions.get(ref.collection)
            const found = data?.byNumber.get(ref.number) ?? []
            // The dataset often prints a supplication in transliteration, so compare both ways.
            const score = (h: RemoteHadith) => Math.max(overlap(dua.translation, h.text), translitOverlap(dua.transliteration, h.text))
            if (data) scores.push(found.length ? Math.max(...found.map(score)) : 0)
          } else {
            await new Promise((resolve) => setTimeout(resolve, 150))
            const verse = await client.getVerse(ref.surah, ref.ayah)
            scores.push(verse ? overlap(dua.translation, verse.translation) : 0)
          }
        }

        if (scores.length === 0) {
          console.log(`DUA not checkable (${theme}): ${dua.source}`)
          continue
        }
        checked += 1
        const best = Math.max(...scores)
        console.log(`DUA ${best.toFixed(2)} (${theme}) ${dua.source} | ${dua.translation.slice(0, 70)}`)
        if (best < 0.3) problems.push(`${dua.source} (${theme}): "${dua.translation.slice(0, 80)}" has overlap ${best.toFixed(2)} with what it cites`)
      }
    }

    console.log(`\nChecked ${checked} duʿāʾ.`)
    expect(problems, `duʿāʾ that do not match their citation:\n${problems.join('\n')}`).toEqual([])
  }, 300_000)
})
