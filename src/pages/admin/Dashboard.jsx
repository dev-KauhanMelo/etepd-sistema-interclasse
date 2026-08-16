import { Link } from 'react-router-dom'
import Card from '../../components/common/Card'
import MatchStatusBadge from '../../components/match/MatchStatusBadge'
import { useMatches } from '../../hooks/useMatches'
import { isToday, matchTime } from '../../utils/formatDate'

export default function Dashboard() {
  const { matches } = useMatches()
  const today = matches.filter((m) => isToday(m.scheduledAt) || m.status === 'live')
  const liveCount = matches.filter((m) => m.status === 'live').length

  return (
    <div>
      <h1 className="text-lg font-display font-bold mb-1">Painel</h1>
      <p className="text-sm text-slate-400 mb-4">{liveCount} jogo(s) ao vivo agora</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link to="/admin/jogos"><Card className="text-center text-sm font-medium text-brand">+ Novo jogo</Card></Link>
        <Link to="/admin/avisos"><Card className="text-center text-sm font-medium text-brand">+ Novo aviso</Card></Link>
        <Link to="/admin/chaveamento" className="col-span-2">
          <Card className="text-center text-sm font-medium text-brand">🏆 Montar chaveamento</Card>
        </Link>
      </div>

      <p className="text-sm font-semibold text-slate-500 mb-2">Jogos de hoje</p>
      {today.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhum jogo hoje.</p>
      ) : (
        today.map((m) => (
          <Link key={m.id} to={`/admin/jogos/${m.id}/placar`}>
            <Card className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{m.teamA?.name} × {m.teamB?.name}</p>
                <p className="text-xs text-slate-400">{matchTime(m)} · {m.location}</p>
              </div>
              <MatchStatusBadge status={m.status} />
            </Card>
          </Link>
        ))
      )}
    </div>
  )
}
