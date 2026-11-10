import type { IncomingMessage, ServerResponse } from 'node:http'
import { loadEnv, type Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

// In production /api/guidance is a Vercel function. In development this plugin serves the
// very same handler, so `npm run dev` gives real answers (and works without a model key:
// answers are then compiled directly from the sources).
function devApi(): Plugin {
  return {
    name: 'hikmahguide-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/guidance', (req: IncomingMessage, res: ServerResponse) => {
        const chunks: Buffer[] = []
        let size = 0

        req.on('data', (chunk: Buffer) => {
          size += chunk.length
          if (size > 100_000) {
            res.statusCode = 413
            res.end()
            req.destroy()
            return
          }
          chunks.push(chunk)
        })

        req.on('end', async () => {
          try {
            const { handleGuidance } = (await server.ssrLoadModule('/server/handler.ts')) as typeof import('./server/handler')
            const raw = Buffer.concat(chunks).toString('utf8')
            let body: unknown = raw
            try {
              body = raw ? JSON.parse(raw) : undefined
            } catch {
              // Leave the raw string. The handler rejects it.
            }
            const result = await handleGuidance({ method: req.method, headers: req.headers, body })
            res.statusCode = result.status
            for (const [name, value] of Object.entries(result.headers)) res.setHeader(name, value)
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify(result.body))
          } catch (error) {
            server.config.logger.error(String(error))
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Dev API failed' }))
          }
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Make .env values (GROQ_API_KEY and friends) visible to the dev API handler.
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value
  }
  return {
    plugins: [devApi()],
    test: {
      environment: 'node',
      include: ['tests/**/*.test.ts'],
    },
  }
})
