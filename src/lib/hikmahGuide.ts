import { getAyah } from './islamicApi'
import { selectTwoHadith, type Hadith } from './hadithLibrary'

type Verse = { arabic: string; translation: string; reference: string }

export interface GuidanceResponse {
  mode: 'groq' | 'fallback'
  opening: string
  mainGuidance: string
  keyReflections: string[]
  quranVerses: Verse[]
  hadiths: Hadith[]
  practicalSteps: string[]
  dua: { arabic: string; transliteration: string; translation: string }
}

interface LiveVerse { surah?: number; ayah?: number; arabic?: string; translation?: string; reference?: string }

interface LivePayload {
  opening?: string
  main_guidance?: string
  key_reflections?: string[]
  quran?: LiveVerse[]
  hadith_themes?: string[]
  practical_steps?: string[]
  dua?: { arabic?: string; transliteration?: string; translation?: string }
}

const FALLBACK: GuidanceResponse = {
  mode: 'fallback',
  opening: 'May Allah ease your affairs. The live guidance assistant is currently unavailable.',
  mainGuidance:
    'Live guidance could not be reached right now. Please try again in a moment. In the meantime, remember that turning to Allah in every state brings peace to the heart.',
  keyReflections: [
    'Tawakkul — trust in Allah — settles the heart when circumstances feel uncertain',
    'Consistent dhikr returns us to presence and surrender',
    'Patience (ṣabr) is itself an act of worship that Allah rewards',
  ],
  quranVerses: [
    {
      arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
      translation: 'Verily, in the remembrance of Allah do hearts find rest.',
      reference: "Surah Ar-Ra'd, 13:28",
    },
    {
      arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
      translation: 'For indeed, with hardship will be ease.',
      reference: 'Surah Ash-Sharh, 94:5',
    },
  ],
  hadiths: [
    {
      text: 'How wonderful is the affair of the believer, for all his affairs are good. If something good happens to him, he is thankful, and that is good for him; and if something bad happens to him, he bears it with patience, and that is good for him.',
      source: 'Sahih Muslim 2999',
    },
    {
      text: 'Know that victory comes with patience, relief with affliction, and ease with hardship.',
      source: 'Musnad Ahmad 2803',
    },
  ],
  practicalSteps: [
    'Establish the five daily prayers with presence',
    'Keep the tongue moist with dhikr throughout the day',
    'Make sincere duʿāʾ and surrender your worries to Allah',
    'Seek support from trusted, knowledgeable people',
  ],
  dua: {
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ',
    transliteration: 'Allāhumma innī aʿūdhu bika minal-hammi wal-ḥazan',
    translation: 'O Allah, I seek refuge in You from worry and grief.',
  },
}

// Verify/repair a cited verse against an authentic source so displayed text is accurate.
async function resolveVerse(verse: LiveVerse, index: number): Promise<Verse> {
  const defaultVerse = FALLBACK.quranVerses[index] || FALLBACK.quranVerses[0]
  const fallbackVerse = {
    arabic: verse?.arabic?.trim() || defaultVerse.arabic,
    translation: verse?.translation?.trim() || defaultVerse.translation,
    reference: verse?.reference?.trim() || defaultVerse.reference,
  }

  const surah = Number(verse?.surah)
  const ayah = Number(verse?.ayah)
  if (!Number.isInteger(surah) || !Number.isInteger(ayah) || surah < 1 || surah > 114 || ayah < 1) {
    return fallbackVerse
  }

  try {
    const [arabicData, englishData] = await Promise.all([
      getAyah(surah, ayah, 'quran-uthmani'),
      getAyah(surah, ayah, 'en.sahih'),
    ])

    if (!arabicData || !englishData) return fallbackVerse

    const surahName: string = englishData.surah?.englishName || arabicData.surah?.englishName || ''
    return {
      arabic: arabicData.text || fallbackVerse.arabic,
      translation: englishData.text || fallbackVerse.translation,
      reference: surahName ? `Surah ${surahName}, ${surah}:${ayah}` : `${surah}:${ayah}`,
    }
  } catch (error) {
    console.error('Verse resolution failed:', error)
    return fallbackVerse
  }
}

// Resolve up to two distinct verses; falls back to defaults when the model returns too few.
async function resolveVerses(quran: LiveVerse[] | undefined): Promise<Verse[]> {
  const incoming = Array.isArray(quran) ? quran.slice(0, 2) : []
  if (incoming.length === 0) return FALLBACK.quranVerses

  const resolved = await Promise.all(incoming.map((v, i) => resolveVerse(v, i)))

  // Guarantee two verses; top up with a distinct fallback if the model gave only one.
  if (resolved.length < 2) {
    const filler = FALLBACK.quranVerses.find((f) => f.reference !== resolved[0]?.reference) || FALLBACK.quranVerses[1]
    resolved.push(filler)
  }
  return resolved
}

async function getLiveGuidance(question: string): Promise<LivePayload | null> {
  try {
    const response = await fetch('/api/guidance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    })

    const payload = await response.json().catch(() => null)
    if (!response.ok || !payload) return null
    return payload as LivePayload
  } catch (error) {
    console.error('Live guidance request failed:', error)
    return null
  }
}

export async function generateGuidance(question: string): Promise<GuidanceResponse> {
  if (!import.meta.env.PROD) {
    return FALLBACK
  }

  const live = await getLiveGuidance(question)
  if (!live) return FALLBACK

  const quranVerses = await resolveVerses(live.quran)

  const keyReflections =
    Array.isArray(live.key_reflections) && live.key_reflections.length > 0
      ? live.key_reflections
      : FALLBACK.keyReflections

  const practicalSteps =
    Array.isArray(live.practical_steps) && live.practical_steps.length > 0
      ? live.practical_steps
      : FALLBACK.practicalSteps

  const hadiths = selectTwoHadith(Array.isArray(live.hadith_themes) ? live.hadith_themes : [])

  return {
    mode: 'groq',
    opening: live.opening?.trim() || FALLBACK.opening,
    mainGuidance: live.main_guidance?.trim() || FALLBACK.mainGuidance,
    keyReflections,
    quranVerses,
    hadiths: hadiths.length >= 2 ? hadiths : FALLBACK.hadiths,
    practicalSteps,
    dua: {
      arabic: live.dua?.arabic?.trim() || FALLBACK.dua.arabic,
      transliteration: live.dua?.transliteration?.trim() || FALLBACK.dua.transliteration,
      translation: live.dua?.translation?.trim() || FALLBACK.dua.translation,
    },
  }
}
