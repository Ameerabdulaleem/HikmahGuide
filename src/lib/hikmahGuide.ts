import { getAyah } from './islamicApi'

export interface GuidanceResponse {
  mode: 'groq' | 'fallback'
  opening: string
  mainGuidance: string
  keyReflections: string[]
  quranVerse: { arabic: string; translation: string; reference: string }
  hadith: { text: string; source: string }
  practicalSteps: string[]
  dua: { arabic: string; transliteration: string; translation: string }
}

interface LivePayload {
  opening?: string
  main_guidance?: string
  key_reflections?: string[]
  quran?: { surah?: number; ayah?: number; arabic?: string; translation?: string; reference?: string }
  hadith?: { text?: string; source?: string }
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
  quranVerse: {
    arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    translation: 'Verily, in the remembrance of Allah do hearts find rest.',
    reference: "Surah Ar-Ra'd, 13:28",
  },
  hadith: {
    text: 'How wonderful is the affair of the believer, for all his affairs are good. If something good happens to him, he is thankful, and that is good for him; and if something bad happens to him, he bears it with patience, and that is good for him.',
    source: 'Sahih Muslim 2999',
  },
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

// Verify/repair the cited verse against an authentic source so displayed text is accurate.
async function resolveVerse(
  quran: LivePayload['quran'],
): Promise<GuidanceResponse['quranVerse']> {
  const fallbackVerse = {
    arabic: quran?.arabic?.trim() || FALLBACK.quranVerse.arabic,
    translation: quran?.translation?.trim() || FALLBACK.quranVerse.translation,
    reference: quran?.reference?.trim() || FALLBACK.quranVerse.reference,
  }

  const surah = Number(quran?.surah)
  const ayah = Number(quran?.ayah)
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

  const quranVerse = await resolveVerse(live.quran)

  const keyReflections =
    Array.isArray(live.key_reflections) && live.key_reflections.length > 0
      ? live.key_reflections
      : FALLBACK.keyReflections

  const practicalSteps =
    Array.isArray(live.practical_steps) && live.practical_steps.length > 0
      ? live.practical_steps
      : FALLBACK.practicalSteps

  return {
    mode: 'groq',
    opening: live.opening?.trim() || FALLBACK.opening,
    mainGuidance: live.main_guidance?.trim() || FALLBACK.mainGuidance,
    keyReflections,
    quranVerse,
    hadith: {
      text: live.hadith?.text?.trim() || FALLBACK.hadith.text,
      source: live.hadith?.source?.trim() || FALLBACK.hadith.source,
    },
    practicalSteps,
    dua: {
      arabic: live.dua?.arabic?.trim() || FALLBACK.dua.arabic,
      transliteration: live.dua?.transliteration?.trim() || FALLBACK.dua.transliteration,
      translation: live.dua?.translation?.trim() || FALLBACK.dua.translation,
    },
  }
}
