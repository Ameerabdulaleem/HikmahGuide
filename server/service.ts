import { hadithReference } from '../src/shared/links.js'
import type { DuaSource, GuidanceNote, GuidanceResult, HadithSource, QuranSource } from '../src/shared/types.js'
import {
  CARE_NOTE,
  compileMain,
  compileOpening,
  DEGRADED_NOTE,
  fallbackTitle,
  padList,
  REDIRECT,
  SCHOLAR_NOTE,
  themedFollowUps,
  themedReflections,
  themedSteps,
} from './compose.js'
import { detectCrisis, detectThemes, type ThemeKey } from './data/themes.js'
import { cleanTitle, guardFollowUps, guardList, guardProse, type GuardContext } from './guard.js'
import type { LlmClient } from './llm.js'
import {
  CLASSIFIER_PROMPT,
  historyMessages,
  parseClassification,
  parseDraft,
  WRITER_PROMPT,
  writerUserMessage,
  type Classification,
  type PreparedSources,
} from './prompts.js'
import type { QuranClient } from './quranClient.js'
import { ARABIC_EDITION, TRANSLATION_EDITION } from './quranClient.js'
import type { ValidRequest } from './request.js'
import { pickDua, pickHadith, pickVerseRefs, type VerseCandidate } from './sources.js'

export interface ServiceDeps {
  llm: LlmClient | null
  quran: QuranClient
}

const VERSES_WANTED = 2

async function classify(request: ValidRequest, llm: LlmClient): Promise<Classification | null> {
  try {
    const raw = await llm.json({
      messages: [
        { role: 'system', content: CLASSIFIER_PROMPT },
        ...historyMessages(request.history, 4, 400),
        { role: 'user', content: request.question },
      ],
      maxTokens: 200,
      temperature: 0,
      timeoutMs: 7000,
    })
    return parseClassification(raw)
  } catch (error) {
    console.error('Classification failed:', error instanceof Error ? error.name : 'unknown')
    return null
  }
}

/** Fetches verses in ranked order and keeps the first ones that verify against the Qur'an API. */
async function resolveVerses(candidates: VerseCandidate[], quran: QuranClient): Promise<QuranSource[]> {
  const verified: QuranSource[] = []
  const batches = [candidates.slice(0, VERSES_WANTED + 1), candidates.slice(VERSES_WANTED + 1)]

  for (const batch of batches) {
    if (verified.length >= VERSES_WANTED || batch.length === 0) break
    const results = await Promise.all(batch.map((c) => quran.getVerse(c.surah, c.ayah)))
    results.forEach((verse, index) => {
      if (!verse || verified.length >= VERSES_WANTED) return
      const { surah, ayah, key } = batch[index]
      verified.push({
        id: `Q${verified.length + 1}`,
        key,
        surah,
        ayah,
        surah_name: verse.surahName,
        arabic: verse.arabic,
        translation: verse.translation,
        reference: verse.surahName ? `Surah ${verse.surahName}, ${surah}:${ayah}` : `${surah}:${ayah}`,
        edition: `${ARABIC_EDITION} + ${TRANSLATION_EDITION}`,
        verified: true,
      })
    })
  }
  return verified
}

function mergeThemes(...groups: ThemeKey[][]): ThemeKey[] {
  const merged = [...new Set(groups.flat())].filter((t) => t !== 'general').slice(0, 3)
  return merged.length > 0 ? merged : ['general']
}

function redirectResult(title: string): GuidanceResult {
  return {
    version: 2,
    mode: 'redirect',
    title,
    themes: [],
    opening: REDIRECT.opening,
    main_guidance: REDIRECT.main_guidance,
    key_reflections: [],
    practical_steps: [],
    follow_ups: REDIRECT.follow_ups,
    quran: [],
    hadith: [],
    dua: null,
    notes: [],
    hadith_themes: [],
    dua_theme: '',
  }
}

async function write(
  request: ValidRequest,
  themes: ThemeKey[],
  sources: PreparedSources,
  flags: { ruling: boolean; crisis: boolean },
  llm: LlmClient,
) {
  try {
    const raw = await llm.json({
      messages: [
        { role: 'system', content: WRITER_PROMPT },
        ...historyMessages(request.history),
        { role: 'user', content: writerUserMessage({ question: request.question, themes, sources, ...flags }) },
      ],
      maxTokens: 1500,
      temperature: 0.5,
      timeoutMs: 16000,
    })
    return parseDraft(raw)
  } catch (error) {
    console.error('Writing failed:', error instanceof Error ? error.name : 'unknown')
    return null
  }
}

export async function generateGuidance(request: ValidRequest, deps: ServiceDeps): Promise<GuidanceResult> {
  const { question } = request
  const exclude = new Set(request.exclude)

  // 1. Understand the question. The model only picks theme keys and flags.
  const classification = deps.llm ? await classify(request, deps.llm) : null
  const ownThemes = detectThemes(question)
  const contextThemes = ownThemes.themes.length > 0 ? ownThemes : detectThemes(`${request.history.map((t) => t.content).join(' ')} ${question}`)

  const crisis = Boolean(classification?.crisis) || detectCrisis(question)
  const ruling = Boolean(classification?.ruling)
  const inScope = classification ? classification.inScope || ownThemes.strength >= 2 : true
  const title = cleanTitle(classification?.title) || fallbackTitle(question)

  if (!inScope && !crisis) return redirectResult(title)

  const themes = mergeThemes(crisis ? ['hope'] : [], classification?.themes ?? [], contextThemes.themes)

  // 2. Retrieve scripture from the curated libraries and the live Qur'an API.
  const candidates = pickVerseRefs(themes, question, exclude)
  const hadithPicks = pickHadith(themes, question, exclude, 2)
  const duaPick = pickDua(themes, question, exclude)
  const quran = await resolveVerses(candidates, deps.quran)

  const hadith: HadithSource[] = hadithPicks.map((entry, index) => ({
    id: `H${index + 1}`,
    key: entry.key,
    collection: entry.collection,
    number: entry.number,
    text: entry.text,
    reference: hadithReference(entry.collection, entry.number),
    ...(entry.grade ? { grade: entry.grade } : {}),
  }))

  const dua: DuaSource | null = duaPick
    ? {
        id: 'D1',
        key: duaPick.key,
        arabic: duaPick.arabic,
        transliteration: duaPick.transliteration,
        translation: duaPick.translation,
        reference: duaPick.reference,
      }
    : null

  const sources: PreparedSources = { quran, hadith, dua }
  const context: GuardContext = {
    allowedIds: new Set([...quran.map((s) => s.id), ...hadith.map((s) => s.id), ...(dua ? [dua.id] : [])]),
    sourceTexts: [...quran.map((s) => s.translation), ...hadith.map((s) => s.text), ...(dua ? [dua.translation] : [])],
  }

  // 3. Let the model write from those sources, then check every sentence it wrote.
  const draft = deps.llm ? await write(request, themes, sources, { ruling, crisis }, deps.llm) : null

  const primary = themes[0]
  let mode: GuidanceResult['mode'] = 'sources_only'
  let opening = compileOpening(question)
  let mainGuidance = compileMain(sources, primary)
  let reflections: string[] = []
  let steps: string[] = []
  let followUps: string[] = []

  if (draft) {
    const guardedOpening = guardProse(draft.opening, context).text
    if (guardedOpening.length >= 12) opening = guardedOpening

    const guardedMain = guardProse(draft.main_guidance, context)
    const cited = new Set(guardedMain.citations).size
    const wanted = Math.min(2, context.allowedIds.size)
    if (guardedMain.text.length >= 120 && cited >= wanted) {
      mainGuidance = guardedMain.text
      mode = 'grounded'
    }

    reflections = guardList(draft.key_reflections, context, 4)
    steps = guardList(draft.practical_steps, context, 5)
    followUps = guardFollowUps(draft.follow_ups)
  }

  reflections = padList(reflections, themedReflections(themes), 3, 4)
  steps = padList(steps, themedSteps(themes), 4, 5)
  followUps = padList(followUps, themedFollowUps(themes), 2, 3)

  const notes: GuidanceNote[] = []
  if (crisis) notes.push(CARE_NOTE)
  if (ruling) notes.push(SCHOLAR_NOTE)
  if (quran.length < VERSES_WANTED) notes.push(DEGRADED_NOTE)

  return {
    version: 2,
    mode,
    title,
    themes,
    opening,
    main_guidance: mainGuidance,
    key_reflections: reflections,
    practical_steps: steps,
    follow_ups: followUps,
    quran,
    hadith,
    dua,
    notes,
    hadith_themes: themes,
    dua_theme: primary,
  }
}
