import { useState } from 'react'
import LiveScoreCard from '../../components/match/LiveScoreCard'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import SearchBar from '../../components/common/SearchBar'
import BackButton from '../../components/common/BackButton'
import { BarsIcon } from '../../components/common/Icons'
import { useMatches } from '../../hooks/useMatches'
import { useModalities } from '../../hooks/useModalities'
import { isToday } from '../../utils/formatDate'
import { filterMatches } from '../../utils/matchFilters'

const SEGMENTS = [
  { key: 'live', label: 'Ao vivo' },
  { key: 'today', label: 'Hoje' },
  { key: 'finished', label: 'Encerrados' },
]

export default function LiveScores() {
  const { matches, loading } = useMatches()
  const { modalities } = useModalities()
  const [segment, setSegment] = useState('today')
  const [query, setQuery] = useState('')
  const [modalityFilter, setModalityFilter] = useState('all')

  if (loading) return <Loader />

  const bySegment =
    segment === 'live'
      ? matches.filter((m) => m.status === 'live')
      : segment === 'finished'
        ? matches.filter((m) => m.status === 'finished')
        : matches.filter((m) => isToday(m.scheduledAt) || m.status === 'live')

  const visible = filterMatches(bySegment, { query, modalityId: modalityFilter, modalities })
    .sort((a, b) => (a.status === 'live' ? -1 : 1) - (b.status === 'live' ? -1 : 1))

  const liveCount = matches.filter((m) => m.status === 'live').length

  return (
    <div>
      {/* Header */}
      <header className="px-4 pt-5 pb-0 flex items-center gap-3">
        <BackButton />
        <div>
          <h1 className="font-bracket-display text-3xl text-white tracking-[0.03em] leading-none flex items-center gap-2.5">
            {liveCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-live pulse-live" />}
            PLACAR
          </h1>
          <p className="font-bracket font-semibold text-[13px] text-arena-muted mt-1 tracking-[0.06em] uppercase">
            {liveCount > 0 ? `${liveCount} jogo${liveCount > 1 ? 's' : ''} rolando agora` : 'Tudo que está acontecendo'}
          </p>
        </div>
      </header>

      {/* Segmentado AO VIVO / HOJE / ENCERRADOS */}
      <div className="mx-4 mt-4 cut-corner-sm bg-arena-panel p-1 flex gap-1">
        {SEGMENTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSegment(s.key)}
            className={`flex-1 py-[7px] font-bracket font-bold text-xs tracking-[0.1em] uppercase transition ${
              segment === s.key ? 'cut-corner-sm bg-gold text-brand-ink' : 'text-arena-muted hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="px-4 pt-3">
        <SearchBar value={query} onChange={setQuery} placeholder="Buscar turma, local ou modalidade…" />
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
        <Chip active={modalityFilter === 'all'} onClick={() => setModalityFilter('all')}>Todas</Chip>
        {modalities.map((m) => (
          <Chip key={m.id} active={modalityFilter === m.id} onClick={() => setModalityFilter(m.id)}>
            {m.name}
          </Chip>
        ))}
      </div>

      <div className="px-4 pb-4">
        {visible.length === 0 ? (
          <EmptyState
            icon={<BarsIcon className="w-10 h-10" />}
            title={segment === 'live' ? 'Nenhum jogo ao vivo' : segment === 'today' ? 'Nenhum jogo hoje' : 'Nenhum jogo encontrado'}
            subtitle={
              query || modalityFilter !== 'all'
                ? 'Tente outra busca ou modalidade'
                : segment === 'today'
                  ? 'Os jogos começam seg · 17/08. Veja a programação completa na Tabela'
                  : 'Confira a tabela completa em Tabela'
            }
          />
        ) : (
          visible.map((m) => <LiveScoreCard key={m.id} match={m} />)
        )}
      </div>
    </div>
  )
}

function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3.5 py-[5px] font-bracket font-bold text-xs tracking-[0.08em] uppercase transition ${
        active
          ? 'cut-corner-sm bg-gold text-brand-ink'
          : 'border border-white/[0.12] text-arena-muted hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
