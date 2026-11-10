import Groq from 'groq-sdk'

// A thin wrapper so the rest of the server never touches the SDK directly. Tests
// replace it with a fake, and nothing outside this file knows which provider is used.

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LlmRequest {
  messages: LlmMessage[]
  maxTokens: number
  temperature: number
  timeoutMs: number
}

export interface LlmClient {
  /** Resolves to the parsed JSON object, or throws if the call fails or the reply is not JSON. */
  json(request: LlmRequest): Promise<unknown>
}

export const DEFAULT_MODEL = 'llama-3.3-70b-versatile'

export function createGroqClient(apiKey: string, model: string = DEFAULT_MODEL): LlmClient {
  const groq = new Groq({ apiKey, dangerouslyAllowBrowser: false })

  return {
    async json({ messages, maxTokens, temperature, timeoutMs }) {
      const completion = await groq.chat.completions.create(
        {
          model,
          temperature,
          max_tokens: maxTokens,
          response_format: { type: 'json_object' },
          messages,
        },
        { timeout: timeoutMs, maxRetries: 0 },
      )
      const content = completion.choices[0]?.message?.content
      if (!content) throw new Error('Empty model reply')
      return JSON.parse(content) as unknown
    },
  }
}

/** Builds the model client from the environment, or null when no key is configured. */
export function llmFromEnv(env: NodeJS.ProcessEnv = process.env): LlmClient | null {
  // VITE_GROQ_API_KEY is accepted only so existing deployments keep working. A VITE_ prefix
  // marks a variable as safe to publish in the browser bundle, which a secret key is not.
  const apiKey = env.GROQ_API_KEY || env.VITE_GROQ_API_KEY
  if (!env.GROQ_API_KEY && env.VITE_GROQ_API_KEY) {
    console.warn('VITE_GROQ_API_KEY is deprecated. Rename it to GROQ_API_KEY so the key is never treated as a public variable.')
  }
  if (!apiKey) return null
  return createGroqClient(apiKey, env.GROQ_MODEL || DEFAULT_MODEL)
}
