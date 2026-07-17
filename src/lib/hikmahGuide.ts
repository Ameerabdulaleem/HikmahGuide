import Groq from 'groq-sdk'
import { searchQuran, getHadith } from './islamicApi'

const groqApiKey = (import.meta.env.VITE_GROQ_API_KEY as string | undefined) || (import.meta.env.GROQ_API_KEY as string | undefined)
const canUseLiveGroq = typeof window === 'undefined' && Boolean(groqApiKey)
const groq = canUseLiveGroq ? new Groq({ apiKey: groqApiKey }) : null

export interface GuidanceResponse {
  mode: 'groq' | 'fallback'
  guidance_summary: string
  full_guidance: string
  sources: Array<{ type: string; reference: string; text: string }>
  hadith: { collection: string; number: number | null; text: string } | null
  practical_steps: string[]
}

export async function generateGuidance(question: string): Promise<GuidanceResponse> {
  const [quranSearch, randomHadith] = await Promise.all([
    searchQuran(question, 'en.sahih'),
    getHadith('eng-bukhari', Math.floor(Math.random() * 5000) + 1),
  ])

  if (!groq) {
    return {
      mode: 'fallback',
      guidance_summary: 'May Allah ease your affairs. The guidance assistant is running in fallback mode.',
      full_guidance: 'Groq is not configured yet. Please add VITE_GROQ_API_KEY to your environment to enable live guidance generation.',
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

  try {
    const completion = await groq!.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      temperature: 0.7,
      max_tokens: 900,
      messages: [
        {
          role: 'system',
          content: 'You are HikmahGuide, a calm, respectful, and sincere AI companion for Muslims. Focus on reflection, patience, trust in Allah, and practical advice. Always be empathetic. Include authentic sources when relevant. Never predict future or give binding fatwas.',
        },
        { role: 'user', content: question },
      ],
    })

    const llmText = completion.choices[0]?.message?.content || 'Alhamdulillah, let us reflect together.'

    return {
      mode: 'groq',
      guidance_summary: llmText.split('\n')[0] || 'May Allah ease your affairs.',
      full_guidance: llmText,
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
  } catch (error) {
    console.error(error)
    return {
      mode: 'fallback',
      guidance_summary: 'Something went wrong. Please try again.',
      full_guidance: 'An error occurred while generating guidance. The fallback path is being used.',
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
