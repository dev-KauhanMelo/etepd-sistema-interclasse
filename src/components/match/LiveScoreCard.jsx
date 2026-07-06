import { Link } from 'react-router-dom'
import MatchStatusBadge from './MatchStatusBadge'
import TeamCrest from './TeamCrest'
import FlipScore from './FlipScore'
import { formatTime } from '../../utils/formatDate'

// O card-assinatura do site: escudo de cada turma em cima do nome
// (como nos jogos de basquete), placar gigante no centro.
export default function LiveScoreCard({ match }) {
  const isLive = match.status === 'live'

  return (
    <Link to={`/placar/${match.id}`} className="block mb-3 animate-pop-in">
      <div className={`bg-white rounded-2xl shadow-card border overflow-hidden transition hover:-translate-y-0.5 ${isLive ? 'border-live/30' : 'border-brand-mist/25 hover:border-brand/40'}`}>
        {isLive && <div className="h-1 live-bar" />}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <MatchStatusBadge status={match.status} />
            <span className="text-xs font-medium text-brand-steel">
              {formatTime(match.scheduledAt)} · {match.location}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <TeamSide team={match.teamA} />
            <div className="flex items-center gap-1.5">
              <FlipScore value={match.scoreA} size="md" />
              <span className="text-brand-mist text-lg font-bold px-0.5">×</span>
              <FlipScore value={match.scoreB} size="md" />
            </div>
            <TeamSide team={match.teamB} />
          </div>
        </div>
      </div>
    </Link>
  )
}

function TeamSide({ team }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
      <TeamCrest team={team} size="md" />
      <span className="text-xs font-bold text-brand-deep truncate max-w-full">{team?.name || '-'}</span>
    </div>
  )
}
