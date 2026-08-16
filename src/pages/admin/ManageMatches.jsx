import { useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import SearchBar from '../../components/common/SearchBar'
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
  const [modalityFilter, setModalityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

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

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Buscar turma, local ou modalidade…"
        className="mb-3"
        light
      />

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {STATUS_TABS.map((t) => (
          <Chip key={t.key} active={statusFilter === t.key} onClick={() => setStatusFilter(t.key)}>
            {t.label}
          </Chip>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
        <Chip active={modalityFilter === 'all'} onClick={() => setModalityFilter('all')}>Todas</Chip>
        {modalities.map((m) => (
          <Chip key={m.id} active={modalityFilter === m.id} onClick={() => setModalityFilter(m.id)}>
            {m.name}
          </Chip>
        ))}
      </div>

      <p className="text-xs text-slate-400 mb-2">
        {filtered.length} {filtered.length === 1 ? 'jogo' : 'jogos'}
        {isFiltering && ` de ${matches.length}`}
      </p>

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

function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
        active ? 'bg-brand text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200'
      }`}
    >
      {children}
    </button>
  )
}
