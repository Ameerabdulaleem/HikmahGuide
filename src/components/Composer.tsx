import { useEffect, useId, useRef, useState } from 'react'
import { LIMITS } from '../shared/types'
import { Icon } from './icons'

interface ComposerProps {
  variant: 'hero' | 'dock'
  pending: boolean
  placeholder: string
  /** Changes whenever the visible chat changes, so the box takes focus again */
  focusKey: string
  onSubmit: (text: string) => void
  onStop: () => void
}

export function Composer({ variant, pending, placeholder, focusKey, onSubmit, onStop }: ComposerProps) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)
  const hintId = useId()

  const trimmed = value.trim()
  const canSend = trimmed.length > 0 && trimmed.length <= LIMITS.question && !pending
  const nearLimit = value.length > LIMITS.question * 0.8

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, variant === 'hero' ? 220 : 180)}px`
  }, [value, variant])

  useEffect(() => {
    // Moving focus on a phone would pop the keyboard up over the page, so only do it on large screens.
    if (window.matchMedia('(min-width: 900px)').matches) ref.current?.focus({ preventScroll: true })
  }, [focusKey])

  const send = () => {
    if (!canSend) return
    onSubmit(trimmed)
    setValue('')
  }

  return (
    <div className={`composer composer--${variant}${focused ? ' is-focused' : ''}`}>
      <div className="composer__field">
        <label htmlFor={`${hintId}-input`} className="sr-only">
          Your question
        </label>
        <textarea
          id={`${hintId}-input`}
          ref={ref}
          value={value}
          rows={variant === 'hero' ? 3 : 1}
          maxLength={LIMITS.question}
          placeholder={placeholder}
          aria-describedby={hintId}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              send()
            }
          }}
        />
        {variant === 'dock' &&
          (pending ? (
            <button type="button" className="composer__round composer__round--stop" onClick={onStop} aria-label="Stop">
              <Icon name="stop" size={16} />
            </button>
          ) : (
            <button type="button" className="composer__round" onClick={send} disabled={!canSend} aria-label="Send">
              <Icon name="send" size={17} />
            </button>
          ))}
      </div>

      <p id={hintId} className={`composer__hint${nearLimit ? ' is-warn' : ''}`}>
        {nearLimit ? `${value.length} of ${LIMITS.question} characters` : 'Enter to send, Shift and Enter for a new line'}
      </p>

      {variant === 'hero' &&
        (pending ? (
          <button type="button" className="seek seek--stop" onClick={onStop}>
            <Icon name="stop" size={16} />
            Stop
          </button>
        ) : (
          <button type="button" className="seek" onClick={send} disabled={!canSend}>
            <Icon name="lantern" size={18} />
            Seek Guidance
          </button>
        ))}
    </div>
  )
}
