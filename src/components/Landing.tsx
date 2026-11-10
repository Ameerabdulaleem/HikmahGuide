import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Composer } from './Composer'
import { Icon, type IconName } from './icons'
import { IslamicStar, LogoMark, OrnamentDivider } from './Ornaments'

const EXAMPLE_PROMPTS = [
  'How to overcome anxiety?',
  'Guidance on a career decision',
  'Dealing with family conflict',
  'Increasing barakah in daily life',
  'How to strengthen my imān?',
]

const DISCLAIMER = 'Disclaimer: Guidance is for reflection and knowledge and should not replace qualified Islamic scholarship for legal or religious rulings.'

function TypingDisclaimer({ text, speed = 22 }: { text: string; speed?: number }) {
  const [shown, setShown] = useState(() => (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? text.length : 0))

  useEffect(() => {
    if (shown >= text.length) return
    const timer = window.setTimeout(() => setShown((n) => n + 1), speed)
    return () => window.clearTimeout(timer)
  }, [shown, text, speed])

  return (
    <p className="disclaimer" aria-label={text}>
      <span aria-hidden="true">{text.slice(0, shown)}</span>
    </p>
  )
}

function FeatureCard({ icon, title, description, delay }: { icon: IconName; title: string; description: string; delay: number }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible(true), { threshold: 0.12 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`feature${visible ? ' is-visible' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className="feature__icon">
        <Icon name={icon} size={22} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith('http')
  return (
    <a className="footer__link" href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {children}
    </a>
  )
}

interface LandingProps {
  pending: boolean
  onSubmit: (text: string) => void
  onStop: () => void
}

export function Landing({ pending, onSubmit, onStop }: LandingProps) {
  return (
    <>
      <section className="hero">
        <div className="hero__logo">
          <LogoMark size={68} />
        </div>
        <h1 className="hero__title">HikmahGuide</h1>
        <p className="hero__ar" lang="ar" dir="rtl">
          دليل الحكمة
        </p>
        <div className="hero__divider">
          <OrnamentDivider width={52} />
        </div>
        <p className="hero__tagline">Seek Wisdom&nbsp;·&nbsp;Find Clarity&nbsp;·&nbsp;Guided by Authentic Sources</p>

        <div className="hero__panel">
          <TypingDisclaimer text={DISCLAIMER} />
          <Composer
            variant="hero"
            pending={pending}
            focusKey="landing"
            placeholder="What guidance do you seek today? (for example dealing with confusion, a difficult decision, or improving daily life)"
            onSubmit={onSubmit}
            onStop={onStop}
          />
          <div className="prompts">
            {EXAMPLE_PROMPTS.map((prompt) => (
              <button key={prompt} type="button" className="chip chip--prompt" disabled={pending} onClick={() => onSubmit(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features__head">
          <OrnamentDivider width={36} />
          <h2>Why HikmahGuide?</h2>
          <p>Built to serve with sincerity, guided by scholarship</p>
        </div>
        <div className="features__grid">
          <FeatureCard
            delay={0}
            icon="reflection"
            title="Thoughtful, Grounded Wisdom"
            description="Every reflection is written only from the verses and ḥadīth retrieved for your question, so the guidance stays tied to what the sources actually say."
          />
          <FeatureCard
            delay={110}
            icon="book"
            title="Authentic Sources"
            description="Qurʾān verses are fetched live from AlQuran Cloud, and ḥadīth and duʿāʾ come from a cited library, each with a link to read the original."
          />
          <FeatureCard
            delay={220}
            icon="shield"
            title="Private & Sincere"
            description="Your chats are saved on your own device so you can return to them, and you can delete any of them at any time."
          />
        </div>
      </section>

      <footer className="footer">
        <div className="footer__links">
          <FooterLink href="https://github.com/Ameerabdulaleem/HikmahGuide/blob/main/A2MCP.md">API Documentation</FooterLink>
          <FooterLink href="https://www.okx.ai/agents">OKX.AI</FooterLink>
          <FooterLink href="https://x.com/AmeerAbdulaleem">X (Twitter)</FooterLink>
          <FooterLink href="https://github.com/Ameerabdulaleem/HikmahGuide">GitHub</FooterLink>
        </div>
        <div className="footer__rule">
          <span />
          <IslamicStar size={12} color="#c8a85a" opacity={0.3} />
          <span />
        </div>
        <p className="footer__note">For reflection and knowledge only. Please consult qualified Islamic scholars for specific rulings and fatāwā.</p>
        <p className="footer__made">
          <IslamicStar size={10} color="#c8a85a" opacity={0.3} />
          Built with sincerity for the Ummah
          <IslamicStar size={10} color="#c8a85a" opacity={0.3} />
        </p>
      </footer>
    </>
  )
}
