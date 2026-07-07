// Cartão de número do placar de mesa: painel preto, dígito amarelo,
// linha no meio. Quando o número muda, a folhinha vira (flip-turn no CSS).
// O key={value} força o React a recriar o dígito, disparando a animação.
const sizes = {
  sm: { panel: 'w-8 h-10', digit: 'text-xl' },
  md: { panel: 'w-10 h-12', digit: 'text-2xl' },
  lg: { panel: 'w-14 h-[4.25rem]', digit: 'text-4xl' },
}

export default function FlipScore({ value, size = 'md' }) {
  const s = sizes[size] || sizes.md
  const display = value ?? 0
  return (
    <div className={`flip-panel ${s.panel}`}>
      <span key={display} className={`flip-digit ${s.digit}`}>{display}</span>
    </div>
  )
}
