import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../../components/layout/Header'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import SearchBar from '../../components/common/SearchBar'
import MatchRow from '../../components/match/MatchRow'
import { ClockIcon } from '../../components/common/Icons'
import { useMatches } from '../../hooks/useMatches'
import { useModalities } from '../../hooks/useModalities'
import { isToday } from '../../utils/formatDate'
import { filterMatches, groupByDay } from '../../utils/matchFilters'
import ProgramGrid from '../../components/schedule/ProgramGrid'

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

          {/* Filtro por momento do jogo: segmentado, mesma linguagem do Placar */}
          <div className="mx-4 mt-3 cut-corner-sm bg-arena-panel p-1 flex gap-1">
            {STATUS_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setStatusFilter(t.key)}
                className={`flex-1 py-[6px] font-bracket font-bold text-[11px] tracking-[0.08em] uppercase transition ${
                  statusFilter === t.key ? 'cut-corner-sm bg-gold text-brand-ink' : 'text-arena-muted hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Filtro por modalidade, com rótulo pra separar do bloco de cima */}
          <p className="px-4 pt-3 pb-1.5 font-bracket font-bold text-[10px] tracking-[0.2em] text-arena-dim uppercase">
            Modalidade
          </p>
          <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-none">
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
                  <div className="flex flex-col gap-2">
                    {g.items.map((m) => (
                      <MatchRow key={m.id} match={m} modName={modalities.find((x) => x.id === m.modalityId)?.name || ''} />
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
