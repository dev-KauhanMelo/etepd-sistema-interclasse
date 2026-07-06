import { FlameIcon } from './Icons'

// Lockup tipográfico da logo JIPD: letras pesadas em itálico,
// "P" em cor de destaque e a tocha acesa sobre o "I".
// variant "dark" = para fundos escuros | "light" = para fundos claros
const sizes = {
  sm: { text: 'text-2xl', flame: 'w-3 h-3 -top-2.5' },
  md: { text: 'text-4xl', flame: 'w-4 h-4 -top-3.5' },
  lg: { text: 'text-6xl', flame: 'w-6 h-6 -top-5' },
  xl: { text: 'text-7xl', flame: 'w-7 h-7 -top-6' },
}

export default function JipdLogo({ size = 'md', variant = 'dark', withTagline = false }) {
  const s = sizes[size] || sizes.md
  const main = variant === 'dark' ? 'text-white' : 'text-brand'
  const accent = variant === 'dark' ? 'text-brand-light' : 'text-brand-ink'

  return (
    <span className="inline-flex flex-col items-center leading-none select-none">
      <span className={`headline ${s.text} ${main} inline-flex items-end`}>
        J
        <span className="relative inline-block">
          I
          <FlameIcon className={`flame absolute left-1/2 -translate-x-1/2 ${s.flame} text-amber-400`} />
        </span>
        <span className={accent}>P</span>
        D
      </span>
      {withTagline && (
        <span className={`mt-1.5 text-[0.6em] font-display font-bold tracking-[0.35em] uppercase ${variant === 'dark' ? 'text-brand-mist' : 'text-brand-steel'}`}>
          — Jogos Internos —
        </span>
      )}
    </span>
  )
}
