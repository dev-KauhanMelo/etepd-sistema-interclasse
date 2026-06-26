import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useMatch } from '../../hooks/useMatch'
import { useAuth } from '../../context/AuthContext'
import { adjustScore, addMatchNote, updateMatch } from '../../services/matchesService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import MatchStatusBadge from '../../components/match/MatchStatusBadge'

const STATUSES = ['scheduled', 'live', 'paused', 'finished', 'suspended', 'cancelled']

export default function UpdateScore() {
  const { id } = useParams()
  const { match, loading } = useMatch(id)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [note, setNote] = useState('')

  if (loading || !match) return <p className="text-sm text-slate-400">Carregando...</p>

  return (
    <div>
      <button onClick={() => navigate('/admin/jogos')} className="text-sm text-slate-400 mb-3">← Voltar</button>

      <Card className="mb-4">
        <p className="text-center text-sm text-slate-400 mb-3">{match.teamA?.name} × {match.teamB?.name}</p>
        <div className="flex items-center justify-around">
          <ScoreControl team={match.teamA} score={match.scoreA} onAdjust={(d) => adjustScore(match, 'A', d, user?.uid)} />
          <span className="text-slate-300 score-number text-2xl">×</span>
          <ScoreControl team={match.teamB} score={match.scoreB} onAdjust={(d) => adjustScore(match, 'B', d, user?.uid)} />
        </div>
      </Card>

      <Card className="mb-4">
        <p className="text-sm font-semibold mb-2">Status da partida</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => updateMatch(match.id, { status: s }, user?.uid)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${match.status === s ? 'ring-2 ring-brand bg-brand/10' : 'bg-slate-100'}`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="mt-3"><MatchStatusBadge status={match.status} /></div>
      </Card>

      <Card>
        <p className="text-sm font-semibold mb-2">Aviso rápido da partida</p>
        <div className="flex gap-2">
          <input
            value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Ex.: Gol aos 12min"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <Button onClick={async () => { if (note) { await addMatchNote(match, note, user?.uid); setNote('') } }}>
            Enviar
          </Button>
        </div>
        {match.matchNotes?.slice().reverse().map((n, i) => (
          <p key={i} className="text-sm text-slate-500 mt-2">• {n}</p>
        ))}
      </Card>
    </div>
  )
}

function ScoreControl({ team, score, onAdjust }) {
  return (
    <div className="text-center">
      <p className="text-xs font-medium text-slate-500 mb-2">{team?.name}</p>
      <p className="score-number text-5xl mb-3" style={{ color: team?.color }}>{score ?? 0}</p>
      <div className="flex gap-2 justify-center">
        <button onClick={() => onAdjust(-1)} className="w-10 h-10 rounded-full bg-slate-100 font-bold">−</button>
        <button onClick={() => onAdjust(1)} className="w-10 h-10 rounded-full bg-brand text-white font-bold">+</button>
      </div>
    </div>
  )
}
