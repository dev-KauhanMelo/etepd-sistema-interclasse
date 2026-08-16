import { SearchIcon, CloseIcon } from './Icons'

// Barra de busca do site. Com dezenas de jogos por dia, rolar a lista inteira
// é inviável — ela aparece em toda tela de lista longa.
// Tema padrão: Modo Arena (escuro). O admin, que continua claro, passa `light`.
export default function SearchBar({ value, onChange, placeholder = 'Buscar turma, local…', className = '', light = false }) {
  const skin = light
    ? 'border-brand-mist/40 bg-white text-brand-deep placeholder:text-brand-steel/60 focus:border-brand'
    : 'border-white/10 bg-arena-panel text-arena-text placeholder:text-arena-muted/70 focus:border-gold/60'
  const iconColor = light ? 'text-brand-steel/60' : 'text-arena-muted'

  return (
    <div className={`relative ${className}`}>
      <SearchIcon className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${iconColor}`} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full cut-corner-sm border pl-9 pr-9 py-2 text-sm font-bracket font-semibold focus:outline-none [&::-webkit-search-cancel-button]:appearance-none ${skin}`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpar busca"
          className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 ${iconColor} hover:opacity-80`}
        >
          <CloseIcon className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
