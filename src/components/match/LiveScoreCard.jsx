import { Link } from 'react-router-dom'
import Card from '../common/Card'
import MatchStatusBadge from './MatchStatusBadge'
import { formatTime } from '../../utils/formatDate'

export default function LiveScoreCard({ match }) {
  return (
    <Link to={`/placar/${match.id}`}>
      <Card className="mb-3 hover:border-brand/40 transition">
        <div className="flex items-center justify-between mb-3">
          <MatchStatusBadge status={match.status} />
          <span className="text-xs text-slate-400">{formatTime(match.scheduledAt)} · {match.location}</span>
        </div>
        <div className="flex items-center justify-between">
          <TeamLabel team={match.teamA} />
          <div className="flex items-center gap-3 score-number text-3xl">
            <span style={{ color: match.teamA?.color }}>{match.scoreA ?? 0}</span>
            <span className="text-slate-300">×</span>
            <span style={{ color: match.teamB?.color }}>{match.scoreB ?? 0}</span>
          </div>
          <TeamLabel team={match.teamB} align="right" />
        </div>
      </Card>
    </Link>
  )
}

function TeamLabel({ team, align = 'left' }) {
  return (
    <div className={`flex-1 ${align === 'right' ? 'text-right' : ''}`}>
      <span
        className="w-2.5 h-2.5 rounded-full inline-block mr-1.5"
        style={{ backgroundColor: team?.color || '#94a3b8' }}
      />
      <span className="text-sm font-medium text-slate-600">{team?.name || '-'}</span>
    </div>
  )
}
