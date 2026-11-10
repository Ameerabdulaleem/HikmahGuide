import { hash32 } from './sources.js'
import { FALLBACK_STEPS, OPENERS, THEME_GUIDE } from './data/themeGuide.js'
import type { ThemeKey } from './data/themes.js'
import type { PreparedSources } from './prompts.js'
import type { GuidanceNote } from '../src/shared/types.js'

// Builds an answer directly from the retrieved sources, with no model involved. It is used
// when the model is unavailable or its output was rejected, so the user still receives
// a relevant, fully sourced reply rather than a generic one.

export function compileOpening(seed: string): string {
  return OPENERS[hash32(seed) % OPENERS.length]
}

function sentenceEnd(text: string): string {
  return /[.!?]$/.test(text) ? '' : '.'
}

export function compileMain(sources: PreparedSources, theme: ThemeKey): string {
  const parts: string[] = []

  sources.quran.forEach((verse, index) => {
    const lead = index === 0 ? 'Allah says' : 'In another verse Allah says'
    parts.push(`${lead}: “${verse.translation}” [${verse.id}]${sentenceEnd(verse.translation)}`)
  })

  sources.hadith.forEach((hadith, index) => {
    const lead = index === 0 ? 'From the authentic Sunnah' : 'Another authentic narration says'
    parts.push(`${lead}: “${hadith.text}” [${hadith.id}]${sentenceEnd(hadith.text)}`)
  })

  parts.push(THEME_GUIDE[theme].reflections[0])
  return parts.join(' ')
}

/** Tops a list up with themed defaults so a rejected model answer never leaves it too thin. */
export function padList(existing: string[], defaults: string[], minimum: number, maximum: number): string[] {
  const out = [...existing]
  for (const item of defaults) {
    if (out.length >= minimum) break
    if (!out.includes(item)) out.push(item)
  }
  return out.slice(0, maximum)
}

export function themedReflections(themes: ThemeKey[]): string[] {
  return themes.flatMap((theme) => THEME_GUIDE[theme].reflections).concat(THEME_GUIDE.general.reflections)
}

export function themedSteps(themes: ThemeKey[]): string[] {
  return themes.flatMap((theme) => THEME_GUIDE[theme].steps).concat(FALLBACK_STEPS)
}

export function themedFollowUps(themes: ThemeKey[]): string[] {
  return themes.flatMap((theme) => THEME_GUIDE[theme].followUps).concat(THEME_GUIDE.general.followUps)
}

export const CARE_NOTE: GuidanceNote = {
  kind: 'care',
  text: 'What you are carrying sounds very heavy, and you matter. If you might act on thoughts of harming yourself, or you are in immediate danger, please contact your local emergency number or a crisis line right now, and ask someone you trust to be with you. A doctor or counsellor can help as well. You do not have to carry this alone.',
}

export const SCHOLAR_NOTE: GuidanceNote = {
  kind: 'scholar',
  text: 'This touches on a religious ruling. What follows shares relevant texts for reflection only. For a ruling that applies to your situation, please ask a qualified scholar.',
}

export const DEGRADED_NOTE: GuidanceNote = {
  kind: 'degraded',
  text: 'The Qurʾān service could not be reached just now, so some verses are not shown. Please try again in a moment.',
}

export const REDIRECT = {
  opening: 'I am here for reflection and Islamic guidance, so I may not be the right help with that one.',
  main_guidance:
    'If something personal is on your heart, such as worry, family, work, worship or a decision, I would be glad to listen and answer from the Qurʾān and authentic ḥadīth.',
  follow_ups: ['How can I find peace when I feel anxious?', 'How do I stay consistent with my prayers?', 'How can I make a decision I feel unsure about?'],
}

export function fallbackTitle(question: string): string {
  const flat = question.replace(/\s+/g, ' ').trim()
  const first = flat.split(/[.?!]/)[0] || flat
  return first.length > 48 ? `${first.slice(0, 45).trimEnd()}…` : first
}
