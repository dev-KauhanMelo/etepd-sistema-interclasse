import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../../components/layout/Header'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import SearchBar from '../../components/common/SearchBar'
import MatchStatusBadge from '../../components/match/MatchStatusBadge'
import TeamCrest from '../../components/match/TeamCrest'
import { ClockIcon } from '../../components/common/Icons'
import { useMatches } from '../../hooks/useMatches'
import { useModalities } from '../../hooks/useModalities'
import { formatTime, isToday } from '../../utils/formatDate'
import { filterMatches, groupByDay } from '../../utils/matchFilters'
import ProgramGrid from '../../components/schedule/ProgramGrid'
import { VENUE_LIST } from '../../utils/cronograma'

const STATUS_TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'today', label: 'Hoje' },
  { key: 'scheduled', label: 'A jogar' },
  { key: 'finished', label: 'Encerrados' },
]

export default function Schedule() {
  const { matches, loading } = useMatches()
  const { modalities } = useModalities()
  const [modalityFilter, setModalityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('grade')
  const [venueFilter, setVenueFilter] = useState('all')

  if (loading) return <Loader />

  // "Hoje" é filtro de data, os outros são de status — por isso separado.
  const byStatus = statusFilter === 'today'
    ? matches.filter((m) => isToday(m.scheduledAt))
    : filterMatches(matches, { status: statusFilter })

  const filtered = filterMatches(byStatus, { query, modalityId: modalityFilter, modalities })
  const groups = groupByDay(filtered)
  const isFiltering = query || modalityFilter !== 'all' || statusFilter !== 'all'

  return (
    <div>
      <Header title="Cronograma" subtitle="Programação oficial do JIPD 2026" />

      <div className="px-4 pt-1">
        <div className="flex gap-2 bg-white rounded-2xl p-1 border border-brand-mist/30 shadow-card">
          <TabButton active={tab === 'grade'} onClick={() => setTab('grade')}>Programação</TabButton>
          <TabButton active={tab === 'jogos'} onClick={() => setTab('jogos')}>Jogos marcados</TabButton>
        </div>
      </div>

      {tab === 'grade' ? (
        <div className="px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
            <Chip active={venueFilter === 'all'} onClick={() => setVenueFilter('all')}>Tudo</Chip>
            {VENUE_LIST.map((v) => (
              <Chip key={v.id} active={venueFilter === v.id} onClick={() => setVenueFilter(v.id)}>
                {v.short}
              </Chip>
            ))}
          </div>
          <ProgramGrid venueFilter={venueFilter} />
        </div>
      ) : (
      <>
      <div className="px-4 pt-3">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Buscar turma, local ou modalidade…"
        />
      </div>

      {/* Filtro por momento do jogo */}
      <div className="flex gap-2 overflow-x-auto px-4 pt-3 scrollbar-none">
        {STATUS_TABS.map((t) => (
          <Chip key={t.key} active={statusFilter === t.key} onClick={() => setStatusFilter(t.key)}>
            {t.label}
          </Chip>
        ))}
      </div>

      {/* Filtro por modalidade */}
      <div className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-none">
        <Chip active={modalityFilter === 'all'} onClick={() => setModalityFilter('all')} subtle>Todas</Chip>
        {modalities.map((m) => (
          <Chip key={m.id} active={modalityFilter === m.id} onClick={() => setModalityFilter(m.id)} subtle>
            {m.name}
          </Chip>
        ))}
      </div>

      <div className="px-4 pb-4 pt-1">
        <p className="text-xs text-brand-steel mb-2">
          {filtered.length} {filtered.length === 1 ? 'jogo' : 'jogos'}
          {isFiltering && ` de ${matches.length}`}
        </p>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClockIcon className="w-10 h-10" />}
            title="Nenhum jogo encontrado"
            subtitle={query ? `Nada bate com "${query}"` : 'Tente outro filtro'}
          />
        ) : (
          groups.map((g) => (
            <div key={g.key} className="mb-5">
              <p className="headline text-sm text-brand-steel mb-2">{g.key}</p>
              <div className="bg-white rounded-2xl shadow-card border border-brand-mist/25 divide-y divide-brand-paper overflow-hidden">
                {g.items.map((m) => (
                  <Link key={m.id} to={`/placar/${m.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-brand-paper/60 transition">
                    <span className="score-number text-base text-brand w-12 shrink-0">{formatTime(m.scheduledAt)}</span>
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <TeamCrest team={m.teamA} size="sm" />
                      <span className="text-xs font-bold text-brand-deep truncate">{m.teamA?.name}</span>
                      <span className="text-brand-mist text-xs font-bold px-0.5">×</span>
                      <span className="text-xs font-bold text-brand-deep truncate">{m.teamB?.name}</span>
                      <TeamCrest team={m.teamB} size="sm" />
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <MatchStatusBadge status={m.status} />
                      <span className="text-[10px] text-brand-steel">{m.location}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      </>
      )}
    </div>
  )
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${active ? 'bg-brand text-white shadow-sm' : 'text-brand-steel'}`}
    >
      {children}
    </button>
  )
}

function Chip({ active, children, onClick, subtle = false }) {
  const activeClass = subtle ? 'bg-brand-deep text-white shadow-sm' : 'bg-brand text-white shadow-sm'
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition ${
        active ? activeClass : 'bg-white text-brand-steel border border-brand-mist/40'
      }`}
    >
      {children}
    </button>
  )
}
