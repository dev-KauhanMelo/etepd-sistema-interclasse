import { useState } from 'react'
import SearchBar from './SearchBar'
import { FunnelIcon, CloseIcon } from './Icons'

// Barra de filtros única de todas as listas do site.
//
// Antes cada tela empilhava busca + duas fileiras de chips que rolavam
// lateralmente, e com 25 modalidades achar uma era pior do que rolar a lista.
// Agora a linha fica sempre curta — busca + botão de funil — e os filtros
// moram num painel que só abre quando a pessoa quer, com TODAS as opções
// visíveis de uma vez (sem rolagem lateral).
//
// `groups`: [{ key, label, options: [{value, label}], value, onChange }]
export default function FilterBar({
  query, onQueryChange, placeholder = 'Buscar…',
  groups = [], resultCount = null, totalCount = null,
}) {
  const [open, setOpen] = useState(false)

  const activeCount = groups.filter((g) => g.value && g.value !== 'all').length
  const filtering = activeCount > 0 || !!query

  const clearAll = () => {
    onQueryChange('')
    groups.forEach((g) => g.onChange('all'))
  }

  return (
    <div>
      <div className="flex gap-2">
        <SearchBar value={query} onChange={onQueryChange} placeholder={placeholder} className="flex-1" />
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={`Filtros${activeCount ? ` (${activeCount} ativo${activeCount > 1 ? 's' : ''})` : ''}`}
          className={`shrink-0 w-11 cut-corner-sm border flex items-center justify-center relative transition ${
            open || activeCount
              ? 'bg-gold border-gold text-brand-ink'
              : 'bg-arena-panel border-white/10 text-arena-muted hover:text-white'
          }`}
        >
          <FunnelIcon className="w-[18px] h-[18px]" />
          {activeCount > 0 && !open && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-live text-white text-[10px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Painel: cada grupo em linhas que quebram — nada de rolagem lateral */}
      {open && (
        <div className="cut-corner bg-arena-panel border border-white/10 p-3.5 mt-2 animate-pop-in">
          {groups.map((g) => (
            <div key={g.key} className="mb-3 last:mb-0">
              <p className="font-bracket font-bold text-[10px] tracking-[0.2em] text-arena-dim uppercase mb-1.5">
                {g.label}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {g.options.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => g.onChange(o.value)}
                    className={`px-2.5 py-1 font-bracket font-bold text-[11px] tracking-[0.06em] uppercase transition ${
                      g.value === o.value
                        ? 'cut-corner-sm bg-gold text-brand-ink'
                        : 'border border-white/[0.12] text-arena-muted hover:text-white'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between gap-3 pt-2.5 mt-1 border-t border-white/[0.07]">
            <button
              onClick={clearAll}
              disabled={!filtering}
              className="inline-flex items-center gap-1.5 font-bracket font-bold text-[11px] tracking-wide uppercase text-arena-muted disabled:opacity-40"
            >
              <CloseIcon className="w-3 h-3" /> Limpar
            </button>
            <button
              onClick={() => setOpen(false)}
              className="cut-corner-sm bg-white/[0.08] px-3 py-1.5 font-bracket font-bold text-[11px] tracking-wide uppercase text-white"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {resultCount !== null && (
        <p className="font-bracket font-semibold text-xs text-arena-muted mt-2">
          {resultCount} {resultCount === 1 ? 'jogo' : 'jogos'}
          {filtering && totalCount !== null && ` de ${totalCount}`}
        </p>
      )}
    </div>
  )
}
