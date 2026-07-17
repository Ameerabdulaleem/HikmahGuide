import { searchQuran, getHadith } from './islamicApi'

export interface GuidanceResponse {
  mode: 'groq' | 'fallback'
  guidance_summary: string
  full_guidance: string
  sources: Array<{ type: string; reference: string; text: string }>
  hadith: { collection: string; number: number | null; text: string } | null
  practical_steps: string[]
}

async function getLiveGuidance(question: string): Promise<{ guidance_summary: string; full_guidance: string } | null> {
  try {
    const response = await fetch('/api/guidance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Live guidance request failed:', error)
    return null
  }
}

export async function generateGuidance(question: string): Promise<GuidanceResponse> {
  const [quranSearch, randomHadith] = await Promise.all([
    searchQuran(question, 'en.sahih'),
    getHadith('eng-bukhari', Math.floor(Math.random() * 5000) + 1),
  ])

  if (import.meta.env.PROD) {
    const liveResponse = await getLiveGuidance(question)
    if (liveResponse) {
      return {
        mode: 'groq',
        guidance_summary: liveResponse.guidance_summary,
        full_guidance: liveResponse.full_guidance,
        sources: quranSearch?.matches?.slice(0, 2).map((m: any) => ({
          type: 'Quran',
          reference: `${m.surah.number}:${m.numberInSurah}`,
          text: m.text,
        })) || [],
        hadith: randomHadith ? {
          collection: 'Sahih Bukhari',
          number: randomHadith.number ?? null,
          text: randomHadith.text || randomHadith.english || 'A hadith reference is available.',
        } : null,
        practical_steps: ['Make dua with sincerity', 'Consult knowledgeable people', 'Be patient and trust Allah\'s plan'],
      }
    }
  }

  return {
    mode: 'fallback',
    guidance_summary: 'May Allah ease your affairs. The guidance assistant is running in fallback mode.',
    full_guidance: 'Live guidance is currently unavailable. Please check the server configuration for Groq support.',
    sources: quranSearch?.matches?.slice(0, 2).map((m: any) => ({
      type: 'Quran',
      reference: `${m.surah.number}:${m.numberInSurah}`,
      text: m.text,
    })) || [],
    hadith: randomHadith ? {
      collection: 'Sahih Bukhari',
      number: randomHadith.number ?? null,
      text: randomHadith.text || randomHadith.english || 'A hadith reference is available.',
    } : null,
    practical_steps: ['Make dua with sincerity', 'Consult knowledgeable people', 'Be patient and trust Allah\'s plan'],
  }
}
