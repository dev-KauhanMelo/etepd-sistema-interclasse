// Placar estilo "mesa manual": painel escuro com linha no meio.
// Quando o número muda, a folhinha vira (animação flip-turn no CSS).
// O key={value} força o React a recriar o dígito, disparando a animação.
const sizes = {
  md: { panel: 'w-11 h-14', digit: 'text-3xl' },
  lg: { panel: 'w-20 h-24', digit: 'text-6xl' },
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
