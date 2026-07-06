import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../../components/layout/Header'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import MatchStatusBadge from '../../components/match/MatchStatusBadge'
import TeamCrest from '../../components/match/TeamCrest'
import { ClockIcon } from '../../components/common/Icons'
import { useMatches } from '../../hooks/useMatches'
import { useModalities } from '../../hooks/useModalities'
import { formatTime, formatDayHeader } from '../../utils/formatDate'

export default function Schedule() {
  const { matches, loading } = useMatches()
  const { modalities } = useModalities()
  const [modalityFilter, setModalityFilter] = useState('all')

  if (loading) return <Loader />

  const filtered = matches.filter((m) => modalityFilter === 'all' || m.modalityId === modalityFilter)

  // Agrupa por dia, mantendo a ordem cronológica
  const groups = []
  for (const m of filtered) {
    const key = formatDayHeader(m.scheduledAt)
    const last = groups[groups.length - 1]
    if (last && last.key === key) last.items.push(m)
    else groups.push({ key, items: [m] })
  }

  return (
    <div>
      <Header title="Horários" subtitle="Tabela completa dos jogos" />

      {/* Filtro por modalidade em chips */}
      <div className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-none">
        <Chip active={modalityFilter === 'all'} onClick={() => setModalityFilter('all')}>Todas</Chip>
        {modalities.map((m) => (
          <Chip key={m.id} active={modalityFilter === m.id} onClick={() => setModalityFilter(m.id)}>
            {m.name}
          </Chip>
        ))}
      </div>

      <div className="p-4 pt-2">
        {filtered.length === 0 ? (
          <EmptyState icon={<ClockIcon className="w-10 h-10" />} title="Nenhum jogo encontrado" subtitle="Tente outra modalidade" />
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
    </div>
  )
}

function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition ${
        active ? 'bg-brand text-white shadow-sm' : 'bg-white text-brand-steel border border-brand-mist/40'
      }`}
    >
      {children}
    </button>
  )
}
