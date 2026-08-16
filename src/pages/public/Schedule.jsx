import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../../components/layout/Header'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import SearchBar from '../../components/common/SearchBar'
import TeamCrest from '../../components/match/TeamCrest'
import { ClockIcon } from '../../components/common/Icons'
import { useMatches } from '../../hooks/useMatches'
import { useModalities } from '../../hooks/useModalities'
import { isToday, matchTime, isTimeTBD } from '../../utils/formatDate'
import { filterMatches, groupByDay } from '../../utils/matchFilters'
import ProgramGrid from '../../components/schedule/ProgramGrid'
import { MATCH_STATUS } from '../../utils/constants'

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
      <Header title="CRONOGRAMA" subtitle="5 dias · ETE PD + UNIBRA · 08h—16h40" />

      <div className="mx-4 mt-1 cut-corner-sm bg-arena-panel p-1 flex gap-1">
        <TabButton active={tab === 'grade'} onClick={() => setTab('grade')}>Programação</TabButton>
        <TabButton active={tab === 'jogos'} onClick={() => setTab('jogos')}>Jogos marcados</TabButton>
      </div>

      {tab === 'grade' ? (
        <div className="px-4 py-4">
          <ProgramGrid />
        </div>
      ) : (
        <>
          <div className="px-4 pt-3">
            <SearchBar value={query} onChange={setQuery} placeholder="Buscar turma, local ou modalidade…" />
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
            <Chip active={modalityFilter === 'all'} onClick={() => setModalityFilter('all')}>Todas</Chip>
            {modalities.map((m) => (
              <Chip key={m.id} active={modalityFilter === m.id} onClick={() => setModalityFilter(m.id)}>
                {m.name}
              </Chip>
            ))}
          </div>

          <div className="px-4 pb-4 pt-1">
            <p className="font-bracket font-semibold text-xs text-arena-muted mb-2">
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
                  <div className="flex items-center gap-2.5 mb-2">
                    <p className="font-bracket-display text-sm text-gold tracking-wide uppercase">{g.key}</p>
                    <span className="flex-1 h-px bg-white/[0.08]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {g.items.map((m) => (
                      <Link
                        key={m.id}
                        to={`/placar/${m.id}`}
                        className="cut-tl bg-arena-panel border border-white/[0.07] flex items-center gap-3 px-3.5 py-2.5 hover:border-gold/40 transition"
                      >
                        <span className={`w-[48px] shrink-0 font-bracket-display leading-none ${isTimeTBD(m) ? 'text-[10px] text-arena-muted uppercase tracking-wide' : 'text-base text-gold'}`}>
                          {matchTime(m)}
                        </span>
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <TeamCrest team={m.teamA} size="sm" />
                          <span className="font-bracket font-bold text-xs text-white truncate">{m.teamA?.name}</span>
                          <span className="text-arena-dim text-xs font-bold px-0.5">×</span>
                          <span className="font-bracket font-bold text-xs text-white truncate">{m.teamB?.name}</span>
                          <TeamCrest team={m.teamB} size="sm" />
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <StatusTag status={m.status} />
                          <span className="font-bracket font-semibold text-[10px] text-arena-muted">{m.location}</span>
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

function StatusTag({ status }) {
  const live = status === 'live'
  return (
    <span
      className={`inline-flex items-center gap-1 font-bracket font-bold text-[10px] tracking-[0.08em] uppercase px-2 py-0.5 ${
        live ? 'bg-live text-white chevron-tag pr-3' : 'text-arena-muted border border-white/[0.12]'
      }`}
    >
      {live && <span className="w-1 h-1 rounded-full bg-white pulse-live" />}
      {MATCH_STATUS[status]?.label || status}
    </span>
  )
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 font-bracket font-bold text-xs tracking-[0.1em] uppercase transition ${
        active ? 'cut-corner-sm bg-gold text-brand-ink' : 'text-arena-muted hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3.5 py-[5px] font-bracket font-bold text-xs tracking-[0.08em] uppercase transition ${
        active ? 'cut-corner-sm bg-gold text-brand-ink' : 'border border-white/[0.12] text-arena-muted hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
