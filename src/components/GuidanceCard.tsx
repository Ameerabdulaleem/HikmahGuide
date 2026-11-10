import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import type { AssistantMessage } from '../lib/chatTypes'
import { sha256Hex } from '../lib/proof'
import { formatWhen } from '../lib/time'
import { splitCitations } from '../shared/citations'
import { parseSourceRefs, quranUrl, refUrl, sunnahUrl } from '../shared/links'
import type { GuidanceNote, GuidanceResult, HadithSource } from '../shared/types'
import { Icon, type IconName } from './icons'
import { OrnamentDivider } from './Ornaments'

interface CardProps {
  message: AssistantMessage
  showBismillah: boolean
  busy: boolean
  onAsk: (question: string) => void
}

function CitedText({ text, known, onJump }: { text: string; known: ReadonlySet<string>; onJump: (id: string) => void }) {
  return (
    <>
      {splitCitations(text).map((segment, index) =>
        segment.type === 'text' ? (
          <span key={index}>{segment.value}</span>
        ) : known.has(segment.id) ? (
          <button
            key={index}
            type="button"
            className={`cite cite--${segment.id[0].toLowerCase()}`}
            onClick={() => onJump(segment.id)}
            aria-label={`Go to source ${segment.id}`}
          >
            {segment.id}
          </button>
        ) : null,
      )}
    </>
  )
}

const NOTE_ICONS: Record<GuidanceNote['kind'], IconName> = { care: 'heart', scholar: 'scale', degraded: 'cloud' }

function Section({ icon, title, tone, children }: { icon: IconName; title: string; tone: 'emerald' | 'gold'; children: React.ReactNode }) {
  return (
    <section className={`section section--${tone}`}>
      <div className="section__head">
        <span className="section__icon">
          <Icon name={icon} size={14} />
        </span>
        <h3 className="section__title">{title}</h3>
      </div>
      {children}
    </section>
  )
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a className="source-link" href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <Icon name="external" size={12} />
    </a>
  )
}

const hadithLink = (hadith: HadithSource) => sunnahUrl(hadith.collection, hadith.number)

function ModeBadge({ mode }: { mode: GuidanceResult['mode'] }) {
  if (mode === 'redirect') return null
  const grounded = mode === 'grounded'
  return (
    <div className="badge-wrap">
      <span className={`badge ${grounded ? 'badge--em' : 'badge--gold'}`}>
        <span className="badge__dot" />
        {grounded ? 'Written from the sources below' : 'Compiled directly from the sources'}
      </span>
      <p className="badge__detail">
        {grounded
          ? 'Every verse and ḥadīth comes from a cited source. The assistant only wrote the reflection around them.'
          : 'The writing assistant was not available, so this answer is assembled from the sources themselves.'}
      </p>
    </div>
  )
}

function Proof({ question, createdAt }: { question: string; createdAt: number }) {
  const [open, setOpen] = useState(false)
  const [digest, setDigest] = useState<string | null | undefined>(undefined)
  const iso = new Date(createdAt).toISOString()

  useEffect(() => {
    if (!open) return
    let live = true
    sha256Hex(`${question}${iso}`).then((hex) => {
      if (live) setDigest(hex)
    })
    return () => {
      live = false
    }
  }, [open, question, iso])

  return (
    <details className="proof" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>
        <span>Proof / Hash</span>
        <span className="proof__agent">OKX Lifestyle Agent</span>
      </summary>
      <div className="proof__body">
        <code className="proof__digest">{digest ? `0x${digest}` : digest === null ? 'Unavailable on this connection' : 'computing…'}</code>
        <code className="proof__formula">{`SHA-256("${question}" + ${iso})`}</code>
        <p>Reproducible proof of this response: the SHA-256 of your question combined with the timestamp above.</p>
      </div>
    </details>
  )
}

function plainText(message: AssistantMessage): string {
  const { result, question } = message
  const strip = (text: string) => text.replace(/\[[QHD]\d{1,2}\]/g, '').replace(/\s{2,}/g, ' ').replace(/\s+([.,;:])/g, '$1')
  return [
    `HikmahGuide, ${question}`,
    '',
    strip(result.main_guidance),
    '',
    ...result.quran.map((v) => `Qurʾān: ${v.translation} (${v.reference})`),
    ...result.hadith.map((h) => `Ḥadīth: ${h.text} (${h.reference})`),
    ...(result.dua ? [`Duʿāʾ: ${result.dua.translation} (${result.dua.reference})`] : []),
    '',
    'For reflection and knowledge only. Please consult a qualified scholar for rulings.',
  ].join('\n')
}

function GuidanceCardView({ message, showBismillah, busy, onAsk }: CardProps) {
  const { result, question, createdAt, id } = message
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle')

  const known = useMemo(
    () => new Set([...result.quran.map((q) => q.id), ...result.hadith.map((h) => h.id), ...(result.dua ? [result.dua.id] : [])]),
    [result],
  )

  const jump = useCallback(
    (sourceId: string) => {
      const target = document.getElementById(`${id}-${sourceId}`)
      if (!target) return
      target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' })
      target.focus({ preventScroll: true })
      target.classList.add('is-flash')
      window.setTimeout(() => target.classList.remove('is-flash'), 1800)
    },
    [id],
  )

  const copy = async (share: boolean) => {
    const text = plainText(message)
    try {
      if (share && typeof navigator.share === 'function') {
        await navigator.share({ title: 'HikmahGuide', text })
        return
      }
      await navigator.clipboard.writeText(text)
      setStatus('copied')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setStatus('failed')
    }
    window.setTimeout(() => setStatus('idle'), 2200)
  }

  const cited = (text: string) => <CitedText text={text} known={known} onJump={jump} />
  const noteOrder = [...result.notes].sort((a, b) => (a.kind === 'care' ? -1 : b.kind === 'care' ? 1 : 0))

  return (
    <article className="card" id={`msg-${id}`} aria-label="Guidance">
      <div className="card__bar" />
      <div className="card__body">
        {showBismillah && (
          <header className="bismillah">
            <p lang="ar" dir="rtl">
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </p>
            <OrnamentDivider width={36} />
          </header>
        )}

        {noteOrder.map((note) => (
          <div key={note.kind} className={`note note--${note.kind}`} role="note">
            <span className="note__icon">
              <Icon name={NOTE_ICONS[note.kind]} size={16} />
            </span>
            <p>{note.text}</p>
          </div>
        ))}

        {result.opening && <p className="opening">{result.opening}</p>}
        <p className="answer">{cited(result.main_guidance)}</p>
        <ModeBadge mode={result.mode} />

        {result.key_reflections.length > 0 && (
          <Section icon="reflection" title="Key Reflections" tone="emerald">
            <ul className="bullets">
              {result.key_reflections.map((text, i) => (
                <li key={i}>
                  <span className="bullets__dot" />
                  <span>{cited(text)}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {result.quran.length > 0 && (
          <section className="panel panel--gold">
            <div className="section__head">
              <span className="section__icon">
                <Icon name="book" size={14} />
              </span>
              <h3 className="section__title">Qurʾānic Guidance</h3>
            </div>
            {result.quran.map((verse) => (
              <div key={verse.id} id={`${id}-${verse.id}`} tabIndex={-1} className="source verse">
                <p className="verse__ar" lang="ar" dir="rtl">
                  {verse.arabic}
                </p>
                <p className="verse__tr">“{verse.translation}”</p>
                <div className="source__meta">
                  <span className="srcid srcid--q">{verse.id}</span>
                  <span className="tag tag--gold">✦ {verse.reference}</span>
                  {verse.verified && (
                    <span className="verified" title="Fetched live from AlQuran Cloud for this answer">
                      <Icon name="verified" size={13} /> Verified on AlQuran Cloud
                    </span>
                  )}
                  <ExternalLink href={quranUrl(verse.surah, verse.ayah)}>Read on Quran.com</ExternalLink>
                </div>
              </div>
            ))}
          </section>
        )}

        {result.hadith.length > 0 && (
          <section className="panel panel--em">
            <div className="section__head">
              <span className="section__icon">
                <Icon name="hadith" size={14} />
              </span>
              <h3 className="section__title">Authentic Ḥadīth</h3>
            </div>
            {result.hadith.map((hadith) => (
              <div key={hadith.id} id={`${id}-${hadith.id}`} tabIndex={-1} className="source hadith">
                <p className="hadith__text">“{hadith.text}”</p>
                <div className="source__meta">
                  <span className="srcid srcid--h">{hadith.id}</span>
                  <span className="tag tag--em">◆ {hadith.reference}</span>
                  {hadith.grade && <span className="grade">{hadith.grade}</span>}
                  {hadithLink(hadith) && <ExternalLink href={hadithLink(hadith)!}>Read on Sunnah.com</ExternalLink>}
                </div>
              </div>
            ))}
          </section>
        )}

        {result.practical_steps.length > 0 && (
          <Section icon="checklist" title="Practical Steps" tone="emerald">
            <ol className="steps">
              {result.practical_steps.map((text, i) => (
                <li key={i}>
                  <span className="steps__n">{i + 1}</span>
                  <span>{cited(text)}</span>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {result.dua && (
          <div id={`${id}-${result.dua.id}`} tabIndex={-1} className="source dua">
            <p className="dua__label">✦ Suggested Duʿāʾ ✦</p>
            <p className="dua__ar" lang="ar" dir="rtl">
              {result.dua.arabic}
            </p>
            {result.dua.transliteration && <p className="dua__tl">{result.dua.transliteration}</p>}
            <p className="dua__tr">“{result.dua.translation}”</p>
            <div className="source__meta source__meta--center">
              <span className="srcid srcid--d">{result.dua.id}</span>
              <span className="dua__ref">{result.dua.reference}</span>
              {parseSourceRefs(result.dua.reference)
                .map((ref) => ({ ref, url: refUrl(ref) }))
                .filter((item): item is { ref: typeof item.ref; url: string } => item.url !== null)
                .slice(0, 2)
                .map(({ ref, url }) => (
                  <ExternalLink key={url} href={url}>
                    {ref.type === 'hadith' ? 'Sunnah.com' : 'Quran.com'}
                  </ExternalLink>
                ))}
            </div>
          </div>
        )}

        {result.mode !== 'redirect' && <Proof question={question} createdAt={createdAt} />}

        {result.follow_ups.length > 0 && (
          <div className="followups">
            <p className="followups__label">Continue the conversation</p>
            <div className="followups__list">
              {result.follow_ups.map((text) => (
                <button key={text} type="button" className="chip" disabled={busy} onClick={() => onAsk(text)}>
                  {text}
                </button>
              ))}
            </div>
          </div>
        )}

        <footer className="card__foot">
          <time dateTime={new Date(createdAt).toISOString()}>{formatWhen(createdAt)}</time>
          {result.mode !== 'redirect' && (
            <div className="card__actions">
              <button type="button" className="btn btn--gold" onClick={() => copy(false)}>
                <Icon name="copy" size={14} />
                {status === 'copied' ? 'Copied ✓' : status === 'failed' ? 'Could not copy' : 'Copy'}
              </button>
              <button type="button" className="btn btn--muted" onClick={() => copy(true)}>
                <Icon name="share" size={14} />
                Share
              </button>
            </div>
          )}
        </footer>
      </div>
    </article>
  )
}

export const GuidanceCard = memo(GuidanceCardView)
