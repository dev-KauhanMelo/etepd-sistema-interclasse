// "Escudo" da turma: círculo com a cor da turma e a sigla dela,
// no estilo dos logos de time do basquete profissional.
const sizes = {
  sm: 'w-9 h-9 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
}

export function crestInitials(name = '') {
  const clean = name.replace(/[^0-9a-zA-ZÀ-ú]/g, '')
  return (clean || '?').slice(0, 3).toUpperCase()
}

export default function TeamCrest({ team, size = 'md' }) {
  return (
    <div
      className={`${sizes[size] || sizes.md} rounded-full flex items-center justify-center font-display font-black italic text-white ring-2 ring-white shadow-card shrink-0`}
      style={{ backgroundColor: team?.color || '#5A6C8C' }}
    >
      {crestInitials(team?.name)}
    </div>
  )
}
