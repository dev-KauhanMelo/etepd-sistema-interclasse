import { useState } from 'react'
import Header from '../../components/layout/Header'
import Card from '../../components/common/Card'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import MatchStatusBadge from '../../components/match/MatchStatusBadge'
import { useMatches } from '../../hooks/useMatches'
import { useModalities } from '../../hooks/useModalities'
import { formatDateTime } from '../../utils/formatDate'

export default function Schedule() {
  const { matches, loading } = useMatches()
  const { modalities } = useModalities()
  const [modalityFilter, setModalityFilter] = useState('all')

  if (loading) return <Loader />

  const filtered = matches.filter((m) => modalityFilter === 'all' || m.modalityId === modalityFilter)

  return (
    <div>
      <Header title="Horários" subtitle="Cronograma completo" />
      <div className="p-4">
        <select
          value={modalityFilter}
          onChange={(e) => setModalityFilter(e.target.value)}
          className="w-full mb-4 rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="all">Todas as modalidades</option>
          {modalities.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        {filtered.length === 0 ? (
          <EmptyState title="Nenhum jogo encontrado" />
        ) : (
          filtered.map((m) => (
            <Card key={m.id} className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-400">{formatDateTime(m.scheduledAt)}</span>
                <MatchStatusBadge status={m.status} />
              </div>
              <p className="font-medium text-sm">{m.teamA?.name} × {m.teamB?.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{m.location}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
