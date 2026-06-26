import Badge from '../common/Badge'
import { MATCH_STATUS } from '../../utils/constants'

export default function MatchStatusBadge({ status }) {
  const info = MATCH_STATUS[status] || MATCH_STATUS.scheduled
  return (
    <Badge className={info.color}>
      {status === 'live' && <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 pulse-live inline-block" />}
      {info.label}
    </Badge>
  )
}
