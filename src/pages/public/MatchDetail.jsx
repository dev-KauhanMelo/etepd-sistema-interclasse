import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Card from '../../components/common/Card'
import PalpiteWidget from '../../components/bolao/PalpiteWidget'
import { SoccerBallIcon } from '../../components/common/Icons'
import { getFanProfile } from '../../utils/fanProfile'
import MatchStatusBadge from '../../components/match/MatchStatusBadge'
import TeamCrest from '../../components/match/TeamCrest'
import ScoreBoard from '../../components/match/ScoreBoard'
import Loader from '../../components/common/Loader'
import BackButton from '../../components/common/BackButton'
import { useMatch } from '../../hooks/useMatch'
import { matchDateTime } from '../../utils/formatDate'
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
      <BackButton className="mb-3" />

      {/* Painel de placar estilo arena */}
      <div className="rounded-3xl overflow-hidden shadow-card animate-pop-in bg-white border border-brand-mist/25">
        {isLive && <div className="h-1 live-bar" />}
        <div className="p-5">
          <div className="flex items-center justify-center gap-2 mb-1">
            <MatchStatusBadge status={match.status} />
          </div>
          <p className="text-center text-xs font-bold uppercase tracking-widest mb-4 text-brand-steel">
            {PHASE_LABELS[match.phase] || 'Partida'} · {match.location}
          </p>

          <div className="flex items-center justify-between gap-2">
            <TeamCol team={match.teamA} />
            <ScoreBoard scoreA={match.scoreA} scoreB={match.scoreB} />
            <TeamCol team={match.teamB} />
          </div>

          <p className="text-center text-xs mt-4 text-brand-steel">
            {matchDateTime(match)}
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

function TeamCol({ team }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
      <TeamCrest team={team} size="md" />
      <p className="text-xs font-bold truncate max-w-full text-brand-deep">{team?.name || '-'}</p>
    </div>
  )
}
