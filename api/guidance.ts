import type { VercelRequest, VercelResponse } from '@vercel/node'
import Groq from 'groq-sdk'

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

    res.status(200).json({
      guidance_summary: llmText.split('\n')[0] || 'May Allah ease your affairs.',
      full_guidance: llmText,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Groq request failed' })
  }
}
