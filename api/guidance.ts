import type { VercelRequest, VercelResponse } from '@vercel/node'
import Groq from 'groq-sdk'

const SYSTEM_PROMPT = `You are HikmahGuide, a calm, respectful, and sincere AI companion for Muslims. You focus on reflection, patience, trust in Allah, and practical advice, and you are always empathetic. You never predict the future and never give binding fatwas.

Respond with ONLY a single valid JSON object (no markdown, no code fences) matching this exact schema:

{
  "opening": "1-2 warm sentences acknowledging the person's specific situation",
  "main_guidance": "2-4 sentences of reflective Islamic guidance grounded in their question",
  "key_reflections": ["3 short reflective insights, each one sentence"],
  "quran": {
    "surah": <integer surah number, 1-114>,
    "ayah": <integer ayah number within that surah>,
    "arabic": "the Arabic text of that exact verse with diacritics",
    "translation": "the English (Sahih International style) translation of that exact verse",
    "reference": "Surah name, chapter:verse — e.g. Surah Ar-Ra'd, 13:28"
  },
  "hadith": {
    "text": "the English text of one authentic hadith directly relevant to the question",
    "source": "collection and number — e.g. Sahih Muslim 2999"
  },
  "practical_steps": ["4-5 concrete, actionable steps"],
  "dua": {
    "arabic": "an authentic dua in Arabic that directly relates to the question's theme",
    "transliteration": "romanized transliteration of the dua",
    "translation": "the English meaning of the dua"
  }
}

Rules:
- Choose a Quran verse and a hadith that DIRECTLY relate to the specific question. The surah/ayah numbers must be accurate for the verse you cite.
- The dua must match the theme of the question (e.g. anxiety, guidance, forgiveness, provision).
- Use only authentic sources. Never invent or fabricate a hadith or verse.
- Do not give binding fatwas or predict the future.`

interface GuidancePayload {
  opening?: string
  main_guidance?: string
  key_reflections?: string[]
  quran?: { surah?: number; ayah?: number; arabic?: string; translation?: string; reference?: string }
  hadith?: { text?: string; source?: string }
  practical_steps?: string[]
  dua?: { arabic?: string; transliteration?: string; translation?: string }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { question } = req.body || {}

  if (!question || typeof question !== 'string') {
    res.status(400).json({ error: 'Question is required' })
    return
  }

  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY

  if (!apiKey) {
    res.status(500).json({ error: 'Groq API key is not configured' })
    return
  }

  try {
    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: false })
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1600,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: question },
      ],
    })

    const llmText = completion.choices[0]?.message?.content || '{}'

    let parsed: GuidancePayload
    try {
      parsed = JSON.parse(llmText)
    } catch (parseError) {
      console.error('Failed to parse Groq JSON:', parseError, llmText)
      res.status(502).json({ error: 'The guidance response could not be parsed.' })
      return
    }

    res.status(200).json(parsed)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Groq request failed:', message)
    res.status(500).json({ error: 'Groq request failed', details: message })
  }
}
