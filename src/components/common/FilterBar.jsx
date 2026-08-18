import { useState } from 'react'
import SearchBar from './SearchBar'
import { FunnelIcon, CloseIcon } from './Icons'

// Barra de filtros única de todas as listas do site — pública e do admin.
//
// Antes cada tela empilhava busca + fileiras de chips que rolavam de lado, e
// com 25 modalidades achar uma era pior do que rolar a lista. Pior ainda no
// computador, onde a fileira não rolava com o mouse. Agora a linha fica sempre
// curta — busca + botão de funil — e os filtros moram num painel que só abre
// quando a pessoa quer, com TODAS as opções visíveis de uma vez.
//
// `groups`: [{ key, label, options: [{value, label}], value, onChange }]
// `light`: tema claro, para o admin. Sem ele, Modo Arena (escuro).
export default function FilterBar({
  query, onQueryChange, placeholder = 'Buscar…',
  groups = [], resultCount = null, totalCount = null,
  light = false, countLabel = 'jogo',
}) {
  const [open, setOpen] = useState(false)

  // `neutral`: o valor que significa "sem filtro" naquele grupo. Quase sempre
  // 'all', mas o Ranking usa 'geral' — sem isso o funil marcava um filtro
  // ativo já na abertura, e o contador de filtros virava ruído.
  const activeCount = groups.filter((g) => g.value && g.value !== (g.neutral || 'all')).length
  const filtering = activeCount > 0 || !!query
  const searchable = typeof onQueryChange === 'function'

  const clearAll = () => {
    if (searchable) onQueryChange('')
    groups.forEach((g) => g.onChange(g.neutral || 'all'))
  }

  const skin = light
    ? {
        funnelIdle: 'bg-white border-brand-mist/40 text-brand-steel hover:text-brand-deep',
        funnelOn: 'bg-brand border-brand text-white',
        panel: 'bg-white border-brand-mist/40 shadow-card',
        groupLabel: 'text-brand-steel',
        optIdle: 'border border-brand-mist/40 text-brand-steel hover:text-brand-deep bg-white',
        optOn: 'bg-brand text-white',
        divider: 'border-brand-mist/25',
        muted: 'text-brand-steel',
        closeBtn: 'bg-brand-paper text-brand-deep',
        radius: 'rounded-xl',
        optRadius: 'rounded-full',
      }
    : {
        funnelIdle: 'bg-arena-panel border-white/10 text-arena-muted hover:text-white',
        funnelOn: 'bg-gold border-gold text-brand-ink',
        panel: 'cut-corner bg-arena-panel border-white/10',
        groupLabel: 'text-arena-dim',
        optIdle: 'border border-white/[0.12] text-arena-muted hover:text-white',
        optOn: 'cut-corner-sm bg-gold text-brand-ink',
        divider: 'border-white/[0.07]',
        muted: 'text-arena-muted',
        closeBtn: 'cut-corner-sm bg-white/[0.08] text-white',
        radius: 'cut-corner-sm',
        optRadius: '',
      }

  return (
    <div>
      <div className="flex gap-2">
        {searchable && (
          <SearchBar value={query} onChange={onQueryChange} placeholder={placeholder} className="flex-1" light={light} />
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={`Filtros${activeCount ? ` (${activeCount} ativo${activeCount > 1 ? 's' : ''})` : ''}`}
          className={`shrink-0 border flex items-center justify-center relative transition ${skin.radius} ${
            searchable ? 'w-11' : 'w-full gap-2 py-2 px-4'
          } ${open || activeCount ? skin.funnelOn : skin.funnelIdle}`}
        >
          <FunnelIcon className="w-[18px] h-[18px]" />
          {!searchable && (
            <span className={`font-bold text-xs ${light ? '' : 'font-bracket tracking-[0.1em] uppercase'}`}>
              {groups[0]?.options.find((o) => o.value === groups[0]?.value)?.label || 'Filtrar'}
            </span>
          )}
          {activeCount > 0 && !open && searchable && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-live text-white text-[10px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Painel: cada grupo em linhas que quebram — nada de rolagem lateral */}
      {open && (
        <div className={`border p-3.5 mt-2 animate-pop-in ${skin.panel}`}>
          {groups.map((g) => (
            <div key={g.key} className="mb-3 last:mb-0">
              <p className={`font-bold text-[10px] tracking-[0.2em] uppercase mb-1.5 ${skin.groupLabel} ${light ? '' : 'font-bracket'}`}>
                {g.label}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {g.options.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => { g.onChange(o.value); if (!searchable) setOpen(false) }}
                    className={`px-2.5 py-1 font-bold text-[11px] tracking-[0.06em] uppercase transition ${skin.optRadius} ${
                      g.value === o.value ? skin.optOn : skin.optIdle
                    } ${light ? '' : 'font-bracket'}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className={`flex items-center justify-between gap-3 pt-2.5 mt-1 border-t ${skin.divider}`}>
            <button
              onClick={clearAll}
              disabled={!filtering}
              className={`inline-flex items-center gap-1.5 font-bold text-[11px] tracking-wide uppercase disabled:opacity-40 ${skin.muted} ${light ? '' : 'font-bracket'}`}
            >
              <CloseIcon className="w-3 h-3" /> Limpar
            </button>
            <button
              onClick={() => setOpen(false)}
              className={`px-3 py-1.5 font-bold text-[11px] tracking-wide uppercase ${skin.closeBtn} ${light ? 'rounded-lg' : 'font-bracket'}`}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {resultCount !== null && (
        <p className={`text-xs mt-2 ${skin.muted} ${light ? '' : 'font-bracket font-semibold'}`}>
          {resultCount} {resultCount === 1 ? countLabel : `${countLabel}s`}
          {filtering && totalCount !== null && ` de ${totalCount}`}
        </p>
      )}
    </div>
  )
}
