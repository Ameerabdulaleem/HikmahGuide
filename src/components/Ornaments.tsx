export function IslamicStar({ size = 40, color = '#c8a85a', opacity = 1 }: { size?: number; color?: string; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" style={{ opacity }} aria-hidden="true" focusable="false">
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

export function LogoMark({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="lgGold" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e2c97e" />
          <stop offset="60%" stopColor="#c8a85a" />
          <stop offset="100%" stopColor="#a88040" />
        </linearGradient>
        <linearGradient id="lgEmerald" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0ed4a0" />
          <stop offset="100%" stopColor="#0a9970" />
        </linearGradient>
        <filter id="logoGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="30" cy="30" r="28" stroke="url(#lgGold)" strokeWidth="0.75" opacity="0.5" />
      <polygon
        points="30,6 34,22 47,13 39,26 54,30 39,34 47,47 34,38 30,54 26,38 13,47 21,34 6,30 21,26 13,13 26,22"
        fill="url(#lgGold)"
        fillOpacity="0.95"
        filter="url(#logoGlow)"
      />
      <circle cx="30" cy="30" r="7" fill="url(#lgEmerald)" opacity="0.9" />
      <circle cx="30" cy="30" r="2.5" fill="white" opacity="0.95" />
    </svg>
  )
}

export function OrnamentDivider({ width = 48 }: { width?: number }) {
  return (
    <div className="ornament" aria-hidden="true">
      <span className="ornament__line ornament__line--left" style={{ width }} />
      <IslamicStar size={16} color="#c8a85a" opacity={0.55} />
      <span className="ornament__line ornament__line--right" style={{ width }} />
    </div>
  )
}
