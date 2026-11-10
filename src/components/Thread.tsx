import type { Conversation } from '../lib/chatTypes'
import { GuidanceCard } from './GuidanceCard'
import { Icon } from './icons'
import { IslamicStar } from './Ornaments'

export interface ThreadError {
  message: string
  kind: string
}

interface ThreadProps {
  conversation: Conversation
  pending: boolean
  error: ThreadError | null
  onAsk: (text: string) => void
  onRetry: () => void
}

function Thinking() {
  return (
    <div className="thinking" role="status">
      <div className="thinking__star">
        <IslamicStar size={40} color="#c8a85a" opacity={0.85} />
      </div>
      <div>
        <p className="thinking__ar" lang="ar" dir="rtl">
          يجري البحث عن الحكمة...
        </p>
        <p className="thinking__en">Gathering authentic sources for you…</p>
      </div>
      <div className="thinking__dots" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ animationDelay: `${i * 0.28}s` }} />
        ))}
      </div>
    </div>
  )
}

export function Thread({ conversation, pending, error, onAsk, onRetry }: ThreadProps) {
  const { messages } = conversation
  const last = messages[messages.length - 1]
  const firstAnswer = messages.findIndex((m) => m.role === 'assistant')
  const unanswered = last?.role === 'user' && !pending && !error

  return (
    <section className="thread" aria-label="Conversation">
      {messages.map((message, index) =>
        message.role === 'user' ? (
          <div key={message.id} id={`msg-${message.id}`} className="msg msg--user">
            <p className="bubble">{message.content}</p>
          </div>
        ) : (
          <div key={message.id} className="msg msg--assistant">
            <GuidanceCard message={message} showBismillah={index === firstAnswer} busy={pending} onAsk={onAsk} />
          </div>
        ),
      )}

      {pending && <Thinking />}

      {(error || unanswered) && (
        <div className="retry" role="alert">
          <p>{error?.message ?? 'This question did not get an answer.'}</p>
          <button type="button" className="btn btn--emerald" onClick={onRetry}>
            <Icon name="refresh" size={14} />
            Try again
          </button>
        </div>
      )}
    </section>
  )
}
