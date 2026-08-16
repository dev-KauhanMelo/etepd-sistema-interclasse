import { SearchIcon, CloseIcon } from './Icons'

// Barra de busca do site. Aparece em Horários, Placar e no admin de Jogos —
// com muitos jogos cadastrados, rolar a lista inteira fica inviável.
export default function SearchBar({ value, onChange, placeholder = 'Buscar turma, local…', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-steel/60 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        // O X nativo do type=search some, porque temos o nosso
        className="w-full rounded-full border border-brand-mist/40 bg-white pl-9 pr-9 py-2 text-sm text-brand-deep placeholder:text-brand-steel/60 focus:outline-none focus:border-brand [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpar busca"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-steel/60 hover:text-brand-steel p-1"
        >
          <CloseIcon className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
