import type { GuidanceResult } from '../shared/types'

export interface UserMessage {
  id: string
  role: 'user'
  content: string
  createdAt: number
}

export interface AssistantMessage {
  id: string
  role: 'assistant'
  createdAt: number
  /** The question this answer responds to. Used for the proof hash. */
  question: string
  result: GuidanceResult
}

export type ChatMessage = UserMessage | AssistantMessage

export interface Conversation {
  id: string
  title: string
  /** True once the person has renamed the chat, so a suggested title never overwrites it */
  titleLocked: boolean
  createdAt: number
  updatedAt: number
  messages: ChatMessage[]
}

export interface ConversationMeta {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  preview: string
  /** The person's own questions, joined, so search can find a chat by what they asked */
  questions: string
  count: number
}

export const CHAT_LIMITS = {
  conversations: 60,
  messages: 120,
  title: 80,
} as const
