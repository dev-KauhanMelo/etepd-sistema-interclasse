import { useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import MatchForm from '../../components/admin/MatchForm'
import MatchStatusBadge from '../../components/match/MatchStatusBadge'
import { useMatches } from '../../hooks/useMatches'
import { deleteMatch } from '../../services/matchesService'
import { formatDateTime } from '../../utils/formatDate'

export default function ManageMatches() {
  const { matches } = useMatches()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-display font-bold">Jogos</h1>
        <Button onClick={() => { setEditing(null); setShowForm(true) }}>+ Novo jogo</Button>
      </div>

      {showForm && (
        <MatchForm
          match={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      {matches.map((m) => (
        <Card key={m.id} className="mb-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium">{m.teamA?.name} × {m.teamB?.name}</p>
              <p className="text-xs text-slate-400">{formatDateTime(m.scheduledAt)} · {m.location}</p>
            </div>
            <MatchStatusBadge status={m.status} />
          </div>
          <div className="flex gap-3 mt-3 text-sm">
            <Link to={`/admin/jogos/${m.id}/placar`} className="text-brand font-medium">Placar</Link>
            <button onClick={() => { setEditing(m); setShowForm(true) }} className="text-slate-500 font-medium">Editar</button>
            <button onClick={() => deleteMatch(m.id)} className="text-red-500 font-medium">Excluir</button>
          </div>
        </Card>
      ))}
    </div>
  )
}
