import { useState } from 'react'

// Troféu que coroa a Final. Se existir /trophy.png em public/, usa a imagem
// oficial; senão desenha um troféu dourado em SVG (mesma silhueta, mesma
// altura), pra tela nunca ficar com um buraco no meio.
export default function TrophyArt({ width = 150, height = 140, className = '', style }) {
  const [failed, setFailed] = useState(false)

  if (!failed) {
    return (
      <img
        src="/trophy.png"
        alt="Troféu do campeão"
        width={width}
        height={height}
        onError={() => setFailed(true)}
        className={className}
        style={{ objectFit: 'contain', ...style }}
      />
    )
  }

  return (
    <svg viewBox="0 0 100 92" width={width} height={height} className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id="jipd-trophy-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF9A8" />
          <stop offset="40%" stopColor="#F5EA15" />
          <stop offset="100%" stopColor="#B9A600" />
        </linearGradient>
      </defs>
      {/* alças */}
      <path d="M30 18H18a15 15 0 0 0 14 15" fill="none" stroke="url(#jipd-trophy-gold)" strokeWidth="5" strokeLinecap="round" />
      <path d="M70 18h12a15 15 0 0 1-14 15" fill="none" stroke="url(#jipd-trophy-gold)" strokeWidth="5" strokeLinecap="round" />
      <g fill="url(#jipd-trophy-gold)">
        {/* copa, haste, prato e base */}
        <path d="M28 8h44v22c0 12.2-9.8 22-22 22s-22-9.8-22-22V8Z" />
        <path d="M45 50h10v14H45z" />
        <rect x="33" y="63" width="34" height="7" rx="2.5" />
        <rect x="25" y="72" width="50" height="11" rx="3" />
      </g>
      <path d="M28 8h44v5H28z" fill="#FFFDE0" opacity="0.9" />
      <path d="M36 16c0 10 2 17 7 22-8-2-13-11-13-22h6Z" fill="#FFFDE0" opacity="0.35" />
    </svg>
  )
}
