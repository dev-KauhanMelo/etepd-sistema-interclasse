import { useParams, Link } from 'react-router-dom'
import Header from '../../components/layout/Header'
import Card from '../../components/common/Card'
import MatchStatusBadge from '../../components/match/MatchStatusBadge'
import Loader from '../../components/common/Loader'
import { useMatch } from '../../hooks/useMatch'
import { formatDateTime } from '../../utils/formatDate'
import { PHASE_LABELS } from '../../utils/constants'

export default function MatchDetail() {
  const { id } = useParams()
  const { match, loading } = useMatch(id)

  if (loading) return <Loader />
  if (!match) {
    return (
      <div className="p-4">
        Jogo não encontrado. <Link to="/placar" className="text-brand">Voltar</Link>
      </div>
    )
  }

  return (
    <div>
      <Header title={PHASE_LABELS[match.phase] || 'Partida'} subtitle={match.location} />
      <div className="p-4">
        <Card>
          <div className="flex justify-center mb-4"><MatchStatusBadge status={match.status} /></div>
          <div className="flex items-center justify-between">
            <TeamCol team={match.teamA} />
            <span className="score-number text-5xl text-slate-800 px-2">{match.scoreA ?? 0}</span>
            <span className="text-slate-300 text-2xl">×</span>
            <span className="score-number text-5xl text-slate-800 px-2">{match.scoreB ?? 0}</span>
            <TeamCol team={match.teamB} />
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">{formatDateTime(match.scheduledAt)}</p>
        </Card>

        {match.periodScores?.length > 0 && (
          <Card className="mt-4">
            <p className="text-sm font-semibold mb-2">Pontuação por período</p>
            {match.periodScores.map((p, i) => (
              <div key={i} className="flex justify-between text-sm py-1 border-b border-slate-50 last:border-0">
                <span className="text-slate-400">Período {p.period}</span>
                <span>{p.scoreA} × {p.scoreB}</span>
              </div>
            ))}
          </Card>
        )}

        {match.matchNotes?.length > 0 && (
          <Card className="mt-4">
            <p className="text-sm font-semibold mb-2">Avisos da partida</p>
            {match.matchNotes.slice().reverse().map((n, i) => (
              <p key={i} className="text-sm text-slate-500 py-1">• {n}</p>
            ))}
          </Card>
        )}
      </div>
    </div>
  )
}

function TeamCol({ team }) {
  return (
    <div className="flex-1 text-center">
      <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: team?.color || '#94a3b8' }} />
      <p className="text-sm font-medium">{team?.name || '-'}</p>
    </div>
  )
}
