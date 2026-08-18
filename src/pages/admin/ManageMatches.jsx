import { useState } from 'react'
import { useStickyState } from '../../hooks/useStickyState'
import { Link } from 'react-router-dom'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import FilterBar from '../../components/common/FilterBar'
import MatchForm from '../../components/admin/MatchForm'
import MatchStatusBadge from '../../components/match/MatchStatusBadge'
import { useMatches } from '../../hooks/useMatches'
import { useModalities } from '../../hooks/useModalities'
import { deleteMatch } from '../../services/matchesService'
import { isToday, matchDateTime } from '../../utils/formatDate'
import { filterMatches, groupByDay } from '../../utils/matchFilters'

const STATUS_TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'today', label: 'Hoje' },
  { key: 'live', label: 'Ao vivo' },
  { key: 'scheduled', label: 'A jogar' },
  { key: 'finished', label: 'Encerrados' },
]

export default function ManageMatches() {
  const { matches } = useMatches()
  const { modalities } = useModalities()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [query, setQuery] = useState('')
  const [modalityFilter, setModalityFilter] = useStickyState('admJogos:mod', 'all')
  const [statusFilter, setStatusFilter] = useStickyState('admJogos:status', 'all')

  const byStatus = statusFilter === 'today'
    ? matches.filter((m) => isToday(m.scheduledAt))
    : filterMatches(matches, { status: statusFilter })

  const filtered = filterMatches(byStatus, { query, modalityId: modalityFilter, modalities })
  const groups = groupByDay(filtered)
  const isFiltering = query || modalityFilter !== 'all' || statusFilter !== 'all'

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-lg font-display font-bold">Jogos</h1>
        <Button onClick={() => { setEditing(null); setShowForm(true) }}>+ Novo jogo</Button>
      </div>

      {showForm && (
        <MatchForm
          match={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      <FilterBar
        light
        query={query}
        onQueryChange={setQuery}
        placeholder="Buscar turma, local ou modalidade…"
        resultCount={filtered.length}
        totalCount={matches.length}
        groups={[
          {
            key: 'status', label: 'Momento', value: statusFilter, onChange: setStatusFilter,
            options: STATUS_TABS.map((t) => ({ value: t.key, label: t.label })),
          },
          {
            key: 'mod', label: 'Modalidade', value: modalityFilter, onChange: setModalityFilter,
            options: [{ value: 'all', label: 'Todas' }, ...modalities.map((m) => ({ value: m.id, label: m.name }))],
          },
        ]}
      />

      <div className="mb-3" />

      {filtered.length === 0 ? (
        <Card className="text-sm text-slate-500">
          {matches.length === 0
            ? 'Nenhum jogo cadastrado ainda. Clique em "+ Novo jogo" pra começar.'
            : 'Nenhum jogo bate com esse filtro.'}
        </Card>
      ) : (
        groups.map((g) => (
          <div key={g.key} className="mb-4">
            <p className="text-xs font-semibold text-slate-500 mb-2">{g.key}</p>
            {g.items.map((m) => (
              <Card key={m.id} className="mb-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{m.teamA?.name} × {m.teamB?.name}</p>
                    <p className="text-xs text-slate-400">{matchDateTime(m)} · {m.location}</p>
                  </div>
                  <MatchStatusBadge status={m.status} />
                </div>
                <div className="flex gap-3 mt-3 text-sm">
                  <Link to={`/admin/jogos/${m.id}/placar`} className="text-brand font-medium">Placar</Link>
                  <button onClick={() => { setEditing(m); setShowForm(true) }} className="text-slate-500 font-medium">Editar</button>
                  <button
                    onClick={() => { if (confirm(`Excluir ${m.teamA?.name} × ${m.teamB?.name}?`)) deleteMatch(m.id) }}
                    className="text-red-500 font-medium"
                  >
                    Excluir
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ))
      )}
    </div>
  )
}
