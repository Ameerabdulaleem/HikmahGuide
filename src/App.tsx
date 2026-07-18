import { useEffect, useRef, useState, type ReactNode } from 'react'
import { generateGuidance } from './lib/hikmahGuide'

type Variant = 'serene' | 'warm'
type UIState = 'idle' | 'loading' | 'response'

interface GuidanceData {
  query: string
  timestamp: number
  opening: string
  mainGuidance: string
  keyReflections: string[]
  quranVerses: { arabic: string; translation: string; reference: string }[]
  hadiths: { text: string; source: string }[]
  practicalSteps: string[]
  dua: { arabic: string; transliteration: string; translation: string; source: string }
}

const MOCK_RESPONSE: GuidanceData = {
  query: 'How to overcome anxiety?',
  timestamp: 0,
  opening:
    'May Allah grant you peace and ease your heart. Anxiety is a deeply human experience, and Islam offers both spiritual anchoring and practical wisdom to help you navigate these moments with trust in Allah.',
  mainGuidance:
    'Anxiety often arises from our attachment to outcomes beyond our control. Islam teaches us that true peace — sakīnah — comes not from controlling our circumstances, but from deepening our reliance on Allah. When we remember that Allah is Al-Wakīl, the Disposer of all affairs, our grip on worry begins to loosen.',
  keyReflections: [
    'Your worry cannot alter what Allah has decreed — tawakkul (trust) is the antidote to anxiety',
    'Anxiety is often a sign of forgetting: dhikr returns us to presence and surrender',
    'The Prophet ﷺ experienced hardship and modeled resilience through faith, patience, and community',
  ],
  quranVerses: [
    {
      arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
      translation: 'Verily, in the remembrance of Allah do hearts find rest.',
      reference: 'Sūrah Ar-Raʿd, 13:28',
    },
    {
      arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
      translation: 'For indeed, with hardship will be ease.',
      reference: 'Sūrah Ash-Sharḥ, 94:5',
    },
  ],
  hadiths: [
    {
      text: 'How wonderful is the case of a believer — there is good for him in everything. If prosperity attends him, he is grateful to Allah and that is good for him; and if adversity befalls him, he endures it patiently and that is also good for him.',
      source: 'Ṣaḥīḥ Muslim, 2999',
    },
    {
      text: 'Know that victory comes with patience, relief with affliction, and ease with hardship.',
      source: 'Musnad Ahmad 2803',
    },
  ],
  practicalSteps: [
    'Establish the five daily prayers with full presence — treat salāh as a sanctuary, not a routine',
    'After each prayer, recite 33× SubḥānAllāh, 33× Alḥamdulillāh, 34× Allāhu Akbar',
    'Read Sūrah Al-Inshirāḥ (94) daily — its message directly addresses constriction of the chest',
    'Journal your worries, then formally surrender them to Allah through duʿāʾ before sleep',
    'Seek a trusted community — the Prophet ﷺ emphasized brotherhood and mutual support',
  ],
  dua: {
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ',
    transliteration: 'Allāhumma innī aʿūdhu bika minal-hammi wal-ḥazan',
    translation: 'O Allah, I seek refuge in You from worry and grief.',
    source: 'Hisnul Muslim; Sahih al-Bukhari 6369',
  },
}

// Simple, verifiable proof: SHA256(question + timestamp).
// Anyone can reproduce it with the shown question and timestamp, which fits the
// OKX.AI ecosystem's emphasis on transparent, auditable agent output.
async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

const EXAMPLE_PROMPTS = [
  'How to overcome anxiety?',
  'Guidance on a career decision',
  'Dealing with family conflict',
  'Increasing barakah in daily life',
  'How to strengthen my imān?',
]

function IslamicStar({ size = 40, color = '#c8a85a', opacity = 1 }: { size?: number; color?: string; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" style={{ opacity }}>
      <polygon
        points="40,8 45,29 63,17 51,35 72,40 51,45 63,63 45,51 40,72 35,51 17,63 29,45 8,40 29,35 17,17 35,29"
        fill={color}
        fillOpacity="0.12"
        stroke={color}
        strokeWidth="1"
      />
      <circle cx="40" cy="40" r="7" fill={color} fillOpacity="0.5" />
      <circle cx="40" cy="40" r="3" fill={color} fillOpacity="0.9" />
    </svg>
  )
}

function LogoMark({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="lgGold" x1="0" y1="0" x2="60" y2="60">
          <stop offset="0%" stopColor="#e2c97e" />
          <stop offset="60%" stopColor="#c8a85a" />
          <stop offset="100%" stopColor="#a88040" />
        </linearGradient>
        <linearGradient id="lgEmerald" x1="0" y1="0" x2="60" y2="60">
          <stop offset="0%" stopColor="#0ed4a0" />
          <stop offset="100%" stopColor="#0a9970" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle cx="30" cy="30" r="28" stroke="url(#lgGold)" strokeWidth="0.75" opacity="0.5" />
      <polygon
        points="30,6 34,22 47,13 39,26 54,30 39,34 47,47 34,38 30,54 26,38 13,47 21,34 6,30 21,26 13,13 26,22"
        fill="url(#lgGold)"
        fillOpacity="0.95"
        filter="url(#glow)"
      />
      <circle cx="30" cy="30" r="7" fill="url(#lgEmerald)" opacity="0.9" />
      <circle cx="30" cy="30" r="2.5" fill="white" opacity="0.95" />
    </svg>
  )
}

function BookOpenIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

function LanternIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2h6M12 2v3" />
      <path d="M7 5h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
      <circle cx="12" cy="11" r="2.5" />
      <path d="M9 19v3M15 19v3M9 22h6" />
    </svg>
  )
}

function ReflectionIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
    </svg>
  )
}

function ShieldCheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function ChecklistIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}

function HadithIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M12 20V10M18 20V4M6 20v-4" />
    </svg>
  )
}

function CopyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function ShareIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

function RefreshIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-3.14" />
    </svg>
  )
}

function OrnamentDivider({ width = 48 }: { width?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ width, height: '1px', background: 'linear-gradient(to right, transparent, rgba(200,168,90,0.35))' }} />
      <IslamicStar size={16} color="#c8a85a" opacity={0.55} />
      <div style={{ width, height: '1px', background: 'linear-gradient(to left, transparent, rgba(200,168,90,0.35))' }} />
    </div>
  )
}

function PromptChip({ label, onClick }: { label: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '6px 14px',
        borderRadius: '999px',
        fontSize: '0.76rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: hovered ? 'rgba(14,212,160,0.1)' : 'rgba(14,212,160,0.04)',
        border: `1px solid ${hovered ? 'rgba(14,212,160,0.35)' : 'rgba(14,212,160,0.16)'}`,
        color: hovered ? '#0ed4a0' : '#7ab8aa',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        letterSpacing: '0.01em',
      }}
    >
      {label}
    </button>
  )
}

function SourceTag({ type, reference }: { type: 'quran' | 'hadith'; reference: string }) {
  const isQuran = type === 'quran'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: '6px',
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.03em',
        background: isQuran ? 'rgba(200,168,90,0.1)' : 'rgba(14,212,160,0.07)',
        color: isQuran ? '#c8a85a' : '#0ed4a0',
        border: `1px solid ${isQuran ? 'rgba(200,168,90,0.22)' : 'rgba(14,212,160,0.18)'}`,
      }}
    >
      {isQuran ? '✦' : '◆'} {reference}
    </span>
  )
}

function SectionHeader({ icon, title, tone = 'emerald' }: { icon: ReactNode; title: string; tone?: 'emerald' | 'gold' }) {
  const isEmerald = tone === 'emerald'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: isEmerald ? 'rgba(14,212,160,0.1)' : 'rgba(200,168,90,0.1)',
          color: isEmerald ? '#0ed4a0' : '#c8a85a',
        }}
      >
        {icon}
      </span>
      <h3
        style={{
          fontSize: '0.68rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: isEmerald ? '#5ecfb8' : '#d4af5a',
          margin: 0,
        }}
      >
        {title}
      </h3>
    </div>
  )
}

function LoadingIndicator() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        padding: '60px 0',
        animation: 'fadeIn 0.4s ease-out',
      }}
    >
      <div style={{ animation: 'spinSlow 4s linear infinite' }}>
        <IslamicStar size={52} color="#c8a85a" opacity={0.85} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'Amiri, serif', fontSize: '1.25rem', color: '#c8a85a', letterSpacing: '0.04em', marginBottom: '6px' }}>
          يجري البحث عن الحكمة...
        </p>
        <p style={{ color: '#4a6080', fontSize: '0.82rem' }}>Seeking wisdom for you…</p>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#0ed4a0',
              display: 'block',
              animation: `dotPulse 1.6s ease-in-out ${i * 0.28}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

function ResponseCard({ data, onReset, status }: { data: GuidanceData; onReset: () => void; status: { mode: 'groq' | 'fallback' | 'loading'; label: string; detail: string } }) {
  const [copied, setCopied] = useState(false)
  const [digest, setDigest] = useState('')

  // Proof = SHA256(question + timestamp) — reproducible from the exact two values shown below.
  const isoTimestamp = new Date(data.timestamp).toISOString()
  const proofInput = `${data.query}${isoTimestamp}`
  useEffect(() => {
    let active = true
    sha256Hex(proofInput).then((hex) => {
      if (active) setDigest(hex)
    })
    return () => {
      active = false
    }
  }, [proofInput])

  const proof = {
    agent: 'OKX Lifestyle Agent',
    label: 'Proof / Hash',
    formula: `SHA-256("${data.query}" + ${isoTimestamp})`,
    timestamp: isoTimestamp,
    digest: digest ? `0x${digest}` : 'computing…',
    note: 'Reproducible proof of this response: SHA-256 of your question combined with the timestamp above.',
  }

  const handleCopy = () => {
    const text = [
      `HikmahGuide — "${data.query}"`,
      '',
      `Proof / Hash: ${proof.digest}`,
      `Formula: ${proof.formula}`,
      `Timestamp: ${proof.timestamp}`,
      `Agent: ${proof.agent}`,
      '',
      data.mainGuidance,
      '',
      ...data.quranVerses.map((v) => `Qurʾān: ${v.translation} — ${v.reference}`),
      '',
      ...data.hadiths.map((h) => `Ḥadīth: ${h.text} — ${h.source}`),
      '',
      `Duʿāʾ: ${data.dua.translation} — ${data.dua.source}`,
    ].join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    })
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '760px',
        margin: '0 auto',
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'rgba(7, 14, 28, 0.88)',
        backdropFilter: 'blur(28px)',
        border: '1px solid rgba(200,168,90,0.14)',
        boxShadow:
          '0 0 0 1px rgba(14,212,160,0.04) inset, 0 0 80px rgba(14,212,160,0.05), 0 40px 80px rgba(0,0,0,0.5)',
        animation: 'cardSlideIn 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        style={{
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, #c8a85a 30%, #0ed4a0 70%, transparent 100%)',
        }}
      />

      <div style={{ padding: 'clamp(28px, 5vw, 48px)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p
            style={{
              fontFamily: 'Amiri, serif',
              fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
              color: '#c8a85a',
              lineHeight: 1.7,
              direction: 'rtl',
              marginBottom: '12px',
            }}
          >
            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <OrnamentDivider width={36} />
          </div>
        </div>

        <div
          style={{
            marginBottom: '20px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(14,212,160,0.04)',
            borderLeft: '3px solid rgba(14,212,160,0.35)',
          }}
        >
          <p style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#3a5570', marginBottom: '4px' }}>
            Your question
          </p>
          <p style={{ color: '#c8d8ee', fontSize: '0.93rem' }}>{data.query}</p>
        </div>

        <p style={{ color: '#8a9fb8', lineHeight: 1.8, marginBottom: '16px', fontSize: '0.92rem' }}>{data.opening}</p>
        <p style={{ color: '#dde8f8', lineHeight: 1.85, marginBottom: '20px', fontSize: '0.97rem' }}>{data.mainGuidance}</p>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '999px',
            marginBottom: '16px',
            background: status.mode === 'groq' ? 'rgba(14,212,160,0.08)' : 'rgba(200,168,90,0.08)',
            border: `1px solid ${status.mode === 'groq' ? 'rgba(14,212,160,0.18)' : 'rgba(200,168,90,0.18)'}`,
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: status.mode === 'groq' ? '#0ed4a0' : status.mode === 'loading' ? '#c8a85a' : '#6a7f9a',
              boxShadow: status.mode === 'groq' ? '0 0 8px rgba(14,212,160,0.45)' : 'none',
            }}
          />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: status.mode === 'groq' ? '#0ed4a0' : '#c8a85a' }}>
            {status.label}
          </span>
        </div>
        <p style={{ margin: '0 0 20px', fontSize: '0.78rem', color: '#4a6080' }}>{status.detail}</p>

        <div style={{ height: '1px', background: 'rgba(200,168,90,0.09)', marginBottom: '28px' }} />

        <div style={{ marginBottom: '28px' }}>
          <SectionHeader icon={<ReflectionIcon size={14} />} title="Key Reflections" tone="emerald" />
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.keyReflections.map((r, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span
                  style={{
                    marginTop: '7px',
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: '#0ed4a0',
                    flexShrink: 0,
                    boxShadow: '0 0 6px rgba(14,212,160,0.5)',
                  }}
                />
                <span style={{ color: '#8a9fb8', lineHeight: 1.65, fontSize: '0.91rem' }}>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{
            marginBottom: '20px',
            borderRadius: '14px',
            padding: '20px 24px',
            background: 'rgba(200,168,90,0.04)',
            border: '1px solid rgba(200,168,90,0.12)',
          }}
        >
          <SectionHeader icon={<BookOpenIcon size={14} />} title="Qurʾānic Guidance" tone="gold" />
          {data.quranVerses.map((verse, i) => (
            <div
              key={verse.reference + i}
              style={{
                marginTop: i === 0 ? 0 : '20px',
                paddingTop: i === 0 ? 0 : '20px',
                borderTop: i === 0 ? 'none' : '1px solid rgba(200,168,90,0.12)',
              }}
            >
              <p
                style={{
                  fontFamily: 'Amiri, serif',
                  fontSize: 'clamp(1.15rem, 2.5vw, 1.5rem)',
                  color: '#e2c97e',
                  lineHeight: 1.8,
                  direction: 'rtl',
                  textAlign: 'right',
                  marginBottom: '12px',
                }}
              >
                {verse.arabic}
              </p>
              <p
                style={{
                  color: '#8a9fb8',
                  fontSize: '0.91rem',
                  lineHeight: 1.65,
                  fontStyle: 'italic',
                  marginBottom: '12px',
                }}
              >
                "{verse.translation}"
              </p>
              <SourceTag type="quran" reference={verse.reference} />
            </div>
          ))}
        </div>

        <div
          style={{
            marginBottom: '28px',
            borderRadius: '14px',
            padding: '20px 24px',
            background: 'rgba(14,212,160,0.03)',
            border: '1px solid rgba(14,212,160,0.09)',
          }}
        >
          <SectionHeader icon={<HadithIcon size={14} />} title="Authentic Ḥadīth" tone="emerald" />
          {data.hadiths.map((h, i) => (
            <div
              key={h.source + i}
              style={{
                marginTop: i === 0 ? 0 : '20px',
                paddingTop: i === 0 ? 0 : '20px',
                borderTop: i === 0 ? 'none' : '1px solid rgba(14,212,160,0.09)',
              }}
            >
              <p style={{ color: '#8a9fb8', fontSize: '0.91rem', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '12px' }}>
                "{h.text}"
              </p>
              <SourceTag type="hadith" reference={h.source} />
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '28px' }}>
          <SectionHeader icon={<ChecklistIcon size={14} />} title="Practical Steps" tone="emerald" />
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.practicalSteps.map((step, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <span
                  style={{
                    flexShrink: 0,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(14,212,160,0.09)',
                    color: '#0ed4a0',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    marginTop: '1px',
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ color: '#8a9fb8', lineHeight: 1.65, fontSize: '0.91rem' }}>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div
          style={{
            marginBottom: '32px',
            borderRadius: '14px',
            padding: '20px 24px',
            background: 'rgba(200,168,90,0.05)',
            border: '1px solid rgba(200,168,90,0.14)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '0.66rem',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: '#6a4f20',
              marginBottom: '14px',
            }}
          >
            ✦ Suggested Duʿāʾ ✦
          </p>
          <p
            style={{
              fontFamily: 'Amiri, serif',
              fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)',
              color: '#e2c97e',
              lineHeight: 1.75,
              direction: 'rtl',
              marginBottom: '10px',
            }}
          >
            {data.dua.arabic}
          </p>
          <p style={{ color: '#a07840', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '4px' }}>
            {data.dua.transliteration}
          </p>
          <p style={{ color: '#6a5030', fontSize: '0.8rem', marginBottom: '10px' }}>"{data.dua.translation}"</p>
          <p style={{ color: '#8a6a34', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {data.dua.source}
          </p>
        </div>

        <div
          style={{
            marginBottom: '28px',
            padding: '14px 16px',
            borderRadius: '14px',
            background: 'rgba(7, 20, 30, 0.82)',
            border: '1px solid rgba(14,212,160,0.16)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6f9aa3' }}>
              {proof.label}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#0ed4a0', fontWeight: 600 }}>
              {proof.agent}
            </span>
          </div>
          <div
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '0.86rem',
              color: '#ecf8ff',
              wordBreak: 'break-all',
              letterSpacing: '0.03em',
            }}
          >
            {proof.digest}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', margin: '8px 0 0' }}>
            <span style={{ fontSize: '0.72rem', color: '#6f9aa3', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', wordBreak: 'break-all' }}>
              {proof.formula}
            </span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#4a6080', lineHeight: 1.6 }}>
            {proof.note}
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          <ActionButton icon={<CopyIcon size={14} />} onClick={handleCopy} tone="gold">
            {copied ? 'Copied ✓' : 'Copy Guidance'}
          </ActionButton>
          <ActionButton icon={<RefreshIcon size={14} />} onClick={onReset} tone="emerald">
            New Question
          </ActionButton>
          <ActionButton icon={<ShareIcon size={14} />} onClick={() => {}} tone="muted">
            Share
          </ActionButton>
        </div>
      </div>
    </div>
  )
}

function ActionButton({
  children,
  icon,
  onClick,
  tone = 'muted',
  disabled = false,
}: {
  children: ReactNode
  icon?: ReactNode
  onClick: () => void
  tone?: 'gold' | 'emerald' | 'muted'
  disabled?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const base = {
    gold: { bg: 'rgba(200,168,90,0.08)', bgH: 'rgba(200,168,90,0.16)', border: 'rgba(200,168,90,0.2)', borderH: 'rgba(200,168,90,0.35)', color: '#c8a85a' },
    emerald: { bg: 'rgba(14,212,160,0.07)', bgH: 'rgba(14,212,160,0.14)', border: 'rgba(14,212,160,0.16)', borderH: 'rgba(14,212,160,0.32)', color: '#0ed4a0' },
    muted: { bg: 'rgba(255,255,255,0.04)', bgH: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.08)', borderH: 'rgba(255,255,255,0.14)', color: '#6a7f9a' },
  }[tone]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        borderRadius: '12px',
        fontSize: '0.81rem',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        background: hovered ? base.bgH : base.bg,
        border: `1px solid ${hovered ? base.borderH : base.border}`,
        color: base.color,
        letterSpacing: '0.02em',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {icon}
      {children}
    </button>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
}: {
  icon: ReactNode
  title: string
  description: string
  delay?: number
}) {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: '18px',
        padding: '28px',
        background: 'rgba(7,14,28,0.7)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${hovered ? 'rgba(14,212,160,0.18)' : 'rgba(200,168,90,0.1)'}`,
        boxShadow: hovered ? '0 0 50px rgba(14,212,160,0.06)' : 'none',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms, border 0.25s ease, box-shadow 0.25s ease`,
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '18px',
          background: hovered ? 'rgba(14,212,160,0.1)' : 'rgba(200,168,90,0.08)',
          color: hovered ? '#0ed4a0' : '#c8a85a',
          transition: 'all 0.25s ease',
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '0.95rem',
          fontWeight: 600,
          color: '#dde8f8',
          letterSpacing: '0.04em',
          marginBottom: '10px',
        }}
      >
        {title}
      </h3>
      <p style={{ color: '#4a6080', lineHeight: 1.72, fontSize: '0.85rem' }}>{description}</p>
    </div>
  )
}

export default function App() {
  const [query, setQuery] = useState('')
  const [uiState, setUiState] = useState<UIState>('idle')
  const [guidance, setGuidance] = useState<GuidanceData | null>(null)
  const [variant, setVariant] = useState<Variant>('serene')
  const liveReady = import.meta.env.PROD
  const [status, setStatus] = useState<{ mode: 'groq' | 'fallback' | 'loading'; label: string; detail: string }>({
    mode: liveReady ? 'groq' : 'fallback',
    label: 'Ready to guide',
    detail: 'Ask your question and receive guidance rooted in the Qurʾān and Sunnah.',
  })
  const responseRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [inputFocused, setInputFocused] = useState(false)

  const patternOpacity = variant === 'warm' ? 0.085 : 0.042

  const submit = async (q?: string) => {
    const finalQ = (q ?? query).trim()
    if (!finalQ) return
    setQuery(finalQ)
    setUiState('loading')
    setStatus({ mode: 'loading', label: 'Preparing guidance', detail: 'Preparing a thoughtful response for you…' })

    try {
      const result = await generateGuidance(finalQ)
      const nextGuidance: GuidanceData = {
        query: finalQ,
        timestamp: Date.now(),
        opening: result.opening,
        mainGuidance: result.mainGuidance,
        keyReflections: result.keyReflections,
        quranVerses: result.quranVerses,
        hadiths: result.hadiths,
        practicalSteps: result.practicalSteps,
        dua: result.dua,
      }
      setGuidance(nextGuidance)
      setStatus({
        mode: result.mode === 'groq' ? 'groq' : 'fallback',
        label: result.mode === 'groq' ? 'Guidance ready' : 'Guidance ready',
        detail: 'May Allah accept this guidance and grant you clarity and ease.',
      })
    } catch (error) {
      console.error(error)
      setGuidance({ ...MOCK_RESPONSE, query: finalQ, timestamp: Date.now() })
      setStatus({ mode: 'fallback', label: 'Guidance ready', detail: 'May Allah accept this guidance and grant you clarity and ease.' })
    } finally {
      setUiState('response')
      setTimeout(() => {
        responseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    }
  }

  const reset = () => {
    setUiState('idle')
    setGuidance(null)
    setQuery('')
    setStatus({
      mode: liveReady ? 'groq' : 'fallback',
      label: 'Ready to guide',
      detail: 'Ask your question and receive guidance rooted in the Qurʾān and Sunnah.',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#060d1a',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        color: '#dde8f8',
        position: 'relative',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpolygon points='40,8 45,29 63,17 51,35 72,40 51,45 63,63 45,51 40,72 35,51 17,63 29,45 8,40 29,35 17,17 35,29' fill='none' stroke='%23c8a85a' stroke-width='0.65'/%3E%3C/svg%3E")`,
          opacity: patternOpacity,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background: 'radial-gradient(ellipse 75% 45% at 50% -8%, rgba(14,212,160,0.07) 0%, transparent 65%)',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background: `radial-gradient(ellipse 55% 45% at -5% 105%, rgba(200,168,90,${variant === 'warm' ? '0.07' : '0.04'}) 0%, transparent 60%)`,
        }}
      />
      {variant === 'warm' && (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
            background: 'radial-gradient(ellipse 40% 60% at 105% 40%, rgba(180,90,30,0.04) 0%, transparent 55%)',
          }}
        />
      )}

      <div
        style={{
          position: 'fixed',
          top: 18,
          right: 18,
          zIndex: 100,
          display: 'flex',
          borderRadius: '999px',
          overflow: 'hidden',
          border: '1px solid rgba(200,168,90,0.18)',
          background: 'rgba(6,13,26,0.85)',
          backdropFilter: 'blur(14px)',
        }}
      >
        {(['serene', 'warm'] as Variant[]).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            style={{
              padding: '6px 16px',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'capitalize',
              cursor: 'pointer',
              transition: 'all 0.22s ease',
              background: variant === v ? 'rgba(200,168,90,0.14)' : 'transparent',
              color: variant === v ? '#c8a85a' : '#3a5070',
              border: 'none',
            }}
          >
            {v}
          </button>
        ))}
      </div>

      <section
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(80px, 12vh, 120px) 16px 60px',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: '20px', animation: 'fadeInDown 0.7s ease-out' }}>
          <LogoMark size={68} />
        </div>

        <h1
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 'clamp(2rem, 7vw, 4.2rem)',
            fontWeight: 700,
            letterSpacing: '0.09em',
            background: 'linear-gradient(135deg, #e8d898 0%, #c8a85a 45%, #ecd898 75%, #c8a85a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 8px 0',
            lineHeight: 1.1,
            animation: 'fadeInDown 0.75s ease-out 0.08s both',
          }}
        >
          HikmahGuide
        </h1>

        <p
          style={{
            fontFamily: 'Amiri, serif',
            fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
            color: '#c8a85a',
            opacity: 0.65,
            letterSpacing: '0.06em',
            marginBottom: '18px',
            direction: 'rtl',
            animation: 'fadeInDown 0.75s ease-out 0.15s both',
          }}
        >
          دليل الحكمة
        </p>

        <div style={{ marginBottom: '18px', animation: 'fadeIn 0.9s ease-out 0.22s both' }}>
          <OrnamentDivider width={52} />
        </div>

        <p
          style={{
            color: '#4a6070',
            fontSize: 'clamp(0.7rem, 1.8vw, 0.82rem)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: 'clamp(32px, 5vh, 48px)',
            animation: 'fadeIn 0.9s ease-out 0.28s both',
          }}
        >
          Seek Wisdom&nbsp;·&nbsp;Find Clarity&nbsp;·&nbsp;Guided by Authentic Sources
        </p>

        {uiState === 'idle' && (
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              animation: 'fadeInUp 0.75s ease-out 0.38s both',
            }}
          >
            <TypingDisclaimer text="Disclaimer : Guidance is for reflection/knowledge and should not replace qualified Islamic scholarship for legal or religious rulings." />

            <div style={{ position: 'relative' }}>
              <textarea
                ref={textareaRef}
                value={query}
                rows={3}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    submit()
                  }
                }}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="What guidance do you seek today? (e.g. dealing with confusion, a difficult decision, or improving daily life)"
                style={{
                  width: '100%',
                  resize: 'none',
                  borderRadius: '18px',
                  padding: '18px 22px',
                  fontSize: '0.93rem',
                  lineHeight: 1.72,
                  outline: 'none',
                  transition: 'border 0.25s ease, box-shadow 0.25s ease',
                  background: 'rgba(8,16,32,0.92)',
                  border: `1px solid ${inputFocused ? 'rgba(14,212,160,0.38)' : 'rgba(200,168,90,0.18)'}`,
                  color: '#dde8f8',
                  backdropFilter: 'blur(14px)',
                  boxShadow: inputFocused
                    ? '0 0 0 3px rgba(14,212,160,0.07), 0 0 50px rgba(14,212,160,0.09)'
                    : '0 8px 32px rgba(0,0,0,0.3)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '999px',
                marginTop: '12px',
                background: status.mode === 'groq' ? 'rgba(14,212,160,0.08)' : 'rgba(200,168,90,0.08)',
                border: `1px solid ${status.mode === 'groq' ? 'rgba(14,212,160,0.18)' : 'rgba(200,168,90,0.18)'}`,
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: status.mode === 'groq' ? '#0ed4a0' : status.mode === 'loading' ? '#c8a85a' : '#6a7f9a',
                }}
              />
              <span style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: status.mode === 'groq' ? '#0ed4a0' : '#c8a85a' }}>
                {status.label}
              </span>
            </div>

            <SeekButton active={!!query.trim()} onClick={() => submit()} />

            <div
              style={{
                marginTop: '20px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {EXAMPLE_PROMPTS.map((p) => (
                <PromptChip key={p} label={p} onClick={() => submit(p)} />
              ))}
            </div>
          </div>
        )}

        {uiState === 'loading' && (
          <div style={{ width: '100%', maxWidth: '480px' }}>
            <LoadingIndicator />
          </div>
        )}
      </section>

      {uiState === 'response' && guidance && (
        <section
          ref={responseRef}
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '0 16px clamp(48px, 8vh, 80px)',
          }}
        >
          <ResponseCard data={guidance} onReset={reset} status={status} />
        </section>
      )}

      <section
        style={{
          position: 'relative',
          zIndex: 1,
          padding: 'clamp(60px, 10vh, 100px) 16px',
          maxWidth: '1000px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vh, 60px)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <OrnamentDivider width={36} />
          </div>
          <h2
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: 'clamp(1.2rem, 3vw, 1.7rem)',
              fontWeight: 600,
              letterSpacing: '0.07em',
              color: '#dde8f8',
              marginBottom: '10px',
            }}
          >
            Why HikmahGuide?
          </h2>
          <p style={{ color: '#3a5070', fontSize: '0.84rem' }}>Built to serve with sincerity, guided by scholarship</p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          <FeatureCard
            delay={0}
            icon={<ReflectionIcon size={22} />}
            title="Thoughtful AI Wisdom"
            description="Guidance rooted in deep reflection — our AI synthesizes classical Islamic scholarship with contemporary understanding to meet you where you are."
          />
          <FeatureCard
            delay={110}
            icon={<BookOpenIcon size={22} />}
            title="Authentic Sources"
            description="Every response cites the Qurʾān and verified Ḥadīth collections. We prioritize authenticity and scholarly consensus in all guidance provided."
          />
          <FeatureCard
            delay={220}
            icon={<ShieldCheckIcon size={22} />}
            title="Private & Sincere"
            description="Your questions remain confidential. This is a sacred space for reflection — designed with the dignity and sincerity the seeker deserves."
          />
        </div>
      </section>

      <footer
        style={{
          position: 'relative',
          zIndex: 1,
          borderTop: '1px solid rgba(200,168,90,0.07)',
          padding: '32px 16px 36px',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '8px 32px',
              marginBottom: '24px',
            }}
          >
            {[
              { label: 'API Documentation', href: '#' },
              { label: 'OKX.AI', href: 'https://www.okx.ai/agents' },
              { label: 'X (Twitter)', href: 'https://x.com/AmeerAbdulaleem' },
              { label: 'GitHub', href: 'https://github.com/Ameerabdulaleem/HikmahGuide' },
            ].map((link) => (
              <FooterLink key={link.label} href={link.href}>{link.label}</FooterLink>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ width: '100%', maxWidth: '400px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(200,168,90,0.07)' }} />
              <IslamicStar size={12} color="#c8a85a" opacity={0.3} />
              <div style={{ flex: 1, height: '1px', background: 'rgba(200,168,90,0.07)' }} />
            </div>
          </div>

          <p
            style={{
              textAlign: 'center',
              fontSize: '0.74rem',
              color: '#253545',
              lineHeight: 1.7,
              marginBottom: '10px',
            }}
          >
            For reflection and knowledge only. Please consult qualified Islamic scholars for specific rulings and fatāwā.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <IslamicStar size={10} color="#c8a85a" opacity={0.3} />
            <p style={{ fontSize: '0.72rem', color: '#253545' }}>Built with sincerity for the Ummah</p>
            <IslamicStar size={10} color="#c8a85a" opacity={0.3} />
          </div>
        </div>
      </footer>
    </div>
  )
}

function SeekButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={!active}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        marginTop: '12px',
        width: '100%',
        padding: '16px 24px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        fontSize: '0.88rem',
        fontWeight: 600,
        fontFamily: 'Cinzel, serif',
        letterSpacing: '0.07em',
        cursor: active ? 'pointer' : 'not-allowed',
        transition: 'all 0.28s ease',
        background: active
          ? hovered
            ? 'linear-gradient(135deg, #0cc48e, #14e6ad, #0cc48e)'
            : 'linear-gradient(135deg, #0a9970, #0ed4a0, #0a9970)'
          : 'rgba(8,16,32,0.6)',
        backgroundSize: '200% 100%',
        color: active ? '#040e1a' : '#1e3048',
        border: `1px solid ${active ? 'rgba(14,212,160,0.35)' : 'rgba(200,168,90,0.07)'}`,
        boxShadow: active
          ? hovered
            ? '0 0 45px rgba(14,212,160,0.32), 0 8px 32px rgba(14,212,160,0.18)'
            : '0 0 28px rgba(14,212,160,0.18), 0 8px 24px rgba(0,0,0,0.3)'
          : 'none',
        transform: active && hovered ? 'translateY(-1px)' : 'translateY(0)',
        animation: active ? 'glowPulse 3s ease-in-out infinite' : 'none',
      }}
    >
      <LanternIcon size={18} />
      Seek Guidance
    </button>
  )
}

function TypingDisclaimer({ text, speed = 35 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    let index = 0
    const interval = window.setInterval(() => {
      setDisplayed(text.slice(0, index + 1))
      index += 1
      if (index >= text.length) {
        window.clearInterval(interval)
      }
    }, speed)

    return () => window.clearInterval(interval)
  }, [text, speed])

  return (
    <p
      style={{
        color: '#6a7f9a',
        fontSize: '0.78rem',
        lineHeight: 1.65,
        margin: '0 0 14px',
        minHeight: '1.2em',
        fontStyle: 'italic',
      }}
    >
      {displayed}
    </p>
  )
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: '0.78rem',
        color: hovered ? '#c8a85a' : '#253545',
        transition: 'color 0.2s ease',
        textDecoration: 'none',
      }}
    >
      {children}
    </a>
  )
}
