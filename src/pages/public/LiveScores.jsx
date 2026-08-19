import { useState } from 'react'
import LiveScoreCard from '../../components/match/LiveScoreCard'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import FilterBar from '../../components/common/FilterBar'
import ShowMore from '../../components/common/ShowMore'
import BackButton from '../../components/common/BackButton'
import { BarsIcon } from '../../components/common/Icons'
import { useMatches } from '../../hooks/useMatches'
import { useModalities } from '../../hooks/useModalities'
import { isToday } from '../../utils/formatDate'
import { filterMatches } from '../../utils/matchFilters'
import { emAndamento } from '../../utils/matchFilters'

const SEGMENTS = [
  { key: 'live', label: 'Ao vivo' },
  { key: 'today', label: 'Hoje' },
  { key: 'finished', label: 'Encerrados' },
]

// Quantos jogos a lista mostra antes do "ver todos"
const PAGE = 6

export default function LiveScores() {
  const { matches, loading } = useMatches()
  const { modalities } = useModalities()
  const [segment, setSegment] = useState('today')
  const [query, setQuery] = useState('')
  const [modalityFilter, setModalityFilter] = useState('all')
  const [venueFilter, setVenueFilter] = useState('all')
  const [showAll, setShowAll] = useState(false)

  if (loading) return <Loader />

  const bySegment =
    segment === 'live'
      ? matches.filter(emAndamento)
      : segment === 'finished'
        ? matches.filter((m) => m.status === 'finished')
        : matches.filter((m) => isToday(m.scheduledAt) || emAndamento(m))

  const visible = filterMatches(bySegment, { query, modalityId: modalityFilter, modalities })
    .filter((m) => venueFilter === 'all' || m.venue === venueFilter)
    .sort((a, b) => (emAndamento(a) ? -1 : 1) - (emAndamento(b) ? -1 : 1))

  const shown = showAll ? visible : visible.slice(0, PAGE)
  const liveCount = matches.filter(emAndamento).length

  // Só oferece filtrar pelas modalidades que existem neste segmento
  const modalityOptions = [
    { value: 'all', label: 'Todas' },
    ...modalities
      .filter((m) => bySegment.some((x) => x.modalityId === m.id))
      .map((m) => ({ value: m.id, label: m.name })),
  ]

  return (
    <div>
      <header className="px-4 pt-5 pb-0 flex items-center gap-3">
        <BackButton />
        <div>
          <h1 className="font-varsity text-[30px] text-white tracking-[0.03em] leading-none flex items-center gap-2.5">
            {liveCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-live pulse-live" />}
            PLACAR
          </h1>
          <p className="font-body font-medium text-[13px] text-arena-muted mt-1">
            {liveCount > 0 ? `${liveCount} jogo${liveCount > 1 ? 's' : ''} rolando agora` : 'Tudo que está acontecendo'}
          </p>
        </div>
      </header>

      {/* Segmentado AO VIVO / HOJE / ENCERRADOS */}
      <div className="mx-4 mt-4 cut-corner-sm bg-arena-panel p-1 flex gap-1">
        {SEGMENTS.map((s) => (
          <button
            key={s.key}
            onClick={() => { setSegment(s.key); setShowAll(false) }}
            className={`flex-1 py-[7px] font-bracket font-bold text-xs tracking-[0.1em] uppercase transition ${
              segment === s.key ? 'cut-corner-sm bg-gold text-brand-ink' : 'text-arena-muted hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="px-4 pt-3">
        <FilterBar
          query={query}
          onQueryChange={setQuery}
          placeholder="Buscar turma, local ou modalidade…"
          resultCount={visible.length}
          totalCount={bySegment.length}
          groups={[
            { key: 'mod', label: 'Modalidade', value: modalityFilter, onChange: setModalityFilter, options: modalityOptions },
            {
              key: 'venue', label: 'Local', value: venueFilter, onChange: setVenueFilter,
              options: [
                { value: 'all', label: 'Todos' },
                { value: 'pd', label: 'ETE PD' },
                { value: 'unibra', label: 'UNIBRA' },
              ],
            },
          ]}
        />
      </div>

      <div className="px-4 pt-3 pb-4">
        {visible.length === 0 ? (
          <EmptyState
            icon={<BarsIcon className="w-10 h-10" />}
            title={segment === 'live' ? 'Nenhum jogo ao vivo' : segment === 'today' ? 'Nenhum jogo hoje' : 'Nenhum jogo encontrado'}
            subtitle={
              query || modalityFilter !== 'all' || venueFilter !== 'all'
                ? 'Tente outra busca ou filtro'
                : segment === 'today'
                  ? 'Os jogos começam seg · 17/08. Veja a programação completa na Tabela'
                  : 'Confira a tabela completa em Tabela'
            }
          />
        ) : (
          <>
            {shown.map((m) => <LiveScoreCard key={m.id} match={m} />)}
            <ShowMore hidden={visible.length - shown.length} onClick={() => setShowAll(true)} />
          </>
        )}
      </div>
    </div>
  )
}
