import { useState } from 'react'

// "Escudo" da turma, estilo logo de time e-sport.
// Se a turma tem logo cadastrada (campo logoUrl, definido no painel admin),
// mostra a imagem; senão, cai no escudo padrão: círculo com a cor + sigla.
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
  const [imgFailed, setImgFailed] = useState(false)
  const sizeClass = sizes[size] || sizes.md

  if (team?.logoUrl && !imgFailed) {
    return (
      <img
        src={team.logoUrl}
        alt={`Logo ${team?.name || ''}`}
        loading="lazy"
        onError={() => setImgFailed(true)}
        className={`${sizeClass} rounded-full object-cover bg-white ring-2 ring-white shadow-card shrink-0`}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-display font-black italic text-white ring-2 ring-white shadow-card shrink-0`}
      style={{ backgroundColor: team?.color || '#5A6C8C' }}
    >
      {crestInitials(team?.name)}
    </div>
  )
}
