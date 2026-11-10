import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleGuidance } from '../server/handler.js'

// The only public endpoint. All the work happens in server/, so the same code runs here
// on Vercel and in the Vite dev server.
//
//   POST /api/guidance
//   { "question": "...", "history": [{ "role": "user" | "assistant", "content": "..." }], "exclude": ["quran:13:28"] }
//
// Only `question` is required, which keeps the original contract documented in A2MCP.md.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const result = await handleGuidance({ method: req.method, headers: req.headers, body: req.body })
  for (const [name, value] of Object.entries(result.headers)) res.setHeader(name, value)
  res.status(result.status).json(result.body)
}
