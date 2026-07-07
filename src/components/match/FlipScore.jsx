// Cartão de número do placar de mesa: painel preto, dígito amarelo,
// linha no meio. Quando o número muda, a folhinha vira (flip-turn no CSS).
// O key={display} força o React a recriar o dígito, disparando a animação.
// pad = mostra com zero à esquerda (02), como nos placares de verdade.
const sizes = {
  sm: { panel: 'w-8 h-10', digit: 'text-xl' },
  md: { panel: 'w-10 h-12', digit: 'text-2xl' },
  lg: { panel: 'w-12 h-14', digit: 'text-2xl' },
}

export default function FlipScore({ value, size = 'md', pad = false }) {
  const s = sizes[size] || sizes.md
  const display = pad ? String(value ?? 0).padStart(2, '0') : (value ?? 0)
  return (
    <div className={`flip-panel ${s.panel}`}>
      <span key={display} className={`flip-digit ${s.digit}`}>{display}</span>
    </div>
  )
}
