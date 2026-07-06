import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Card from '../../components/common/Card'
import PalpiteWidget from '../../components/bolao/PalpiteWidget'
import { SoccerBallIcon } from '../../components/common/Icons'
import { getFanProfile } from '../../utils/fanProfile'
import MatchStatusBadge from '../../components/match/MatchStatusBadge'
import TeamCrest from '../../components/match/TeamCrest'
import FlipScore from '../../components/match/FlipScore'
import Loader from '../../components/common/Loader'
import { useMatch } from '../../hooks/useMatch'
import { formatDateTime } from '../../utils/formatDate'
import { PHASE_LABELS } from '../../utils/constants'

export default function MatchDetail() {
  const { id } = useParams()
  const { match, loading } = useMatch(id)
  const [profile] = useState(getFanProfile())

  if (loading) return <Loader />
  if (!match) {
    return (
      <div className="p-4">
        Jogo não encontrado. <Link to="/placar" className="text-brand font-semibold">Voltar</Link>
      </div>
    )
  }

  const isLive = match.status === 'live'

  return (
    <div className="p-4">
      {/* Painel de placar estilo arena */}
      <div className={`rounded-3xl overflow-hidden shadow-card animate-pop-in ${isLive ? 'jipd-hero' : 'bg-white border border-brand-mist/25'}`}>
        {isLive && <div className="h-1 live-bar" />}
        <div className="p-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <MatchStatusBadge status={match.status} />
          </div>
          <p className={`text-center text-xs font-bold uppercase tracking-widest mb-5 ${isLive ? 'text-brand-mist' : 'text-brand-steel'}`}>
            {PHASE_LABELS[match.phase] || 'Partida'} · {match.location}
          </p>

          <div className="flex items-center justify-between gap-2">
            <TeamCol team={match.teamA} dark={isLive} />
            <div className="flex items-center gap-2">
              <FlipScore value={match.scoreA} size="lg" />
              <span className={`text-2xl font-bold ${isLive ? 'text-brand-mist/60' : 'text-brand-mist'}`}>×</span>
              <FlipScore value={match.scoreB} size="lg" />
            </div>
            <TeamCol team={match.teamB} dark={isLive} />
          </div>

          <p className={`text-center text-xs mt-5 ${isLive ? 'text-brand-mist/80' : 'text-brand-steel'}`}>
            {formatDateTime(match.scheduledAt)}
          </p>
        </div>
      </div>

      {/* Bolão do jogo: palpite antes, torcida durante e depois */}
      {['scheduled', 'live', 'finished'].includes(match.status) && (
        <Card className="mt-4">
          <p className="headline text-sm text-brand-navy mb-3 flex items-center gap-1.5">
            Bolão JIPD <SoccerBallIcon className="w-4 h-4 text-brand not-italic" />
          </p>
          <PalpiteWidget match={match} profile={profile} />
        </Card>
      )}

      {match.periodScores?.length > 0 && (
        <Card className="mt-4">
          <p className="headline text-sm text-brand-navy mb-2">Pontuação por período</p>
          {match.periodScores.map((p, i) => (
            <div key={i} className="flex justify-between text-sm py-1.5 border-b border-brand-paper last:border-0">
              <span className="text-brand-steel">Período {p.period}</span>
              <span className="score-number text-brand-deep">{p.scoreA} × {p.scoreB}</span>
            </div>
          ))}
        </Card>
      )}

      {match.matchNotes?.length > 0 && (
        <Card className="mt-4 border-l-4 border-l-brand">
          <p className="headline text-sm text-brand-navy mb-2">Avisos da partida</p>
          {match.matchNotes.slice().reverse().map((n, i) => (
            <p key={i} className="text-sm text-brand-steel py-1">• {n}</p>
          ))}
        </Card>
      )}
    </div>
  )
}

function TeamCol({ team, dark = false }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
      <TeamCrest team={team} size="lg" />
      <p className={`text-sm font-bold truncate max-w-full ${dark ? 'text-white' : 'text-brand-deep'}`}>{team?.name || '-'}</p>
    </div>
  )
}
