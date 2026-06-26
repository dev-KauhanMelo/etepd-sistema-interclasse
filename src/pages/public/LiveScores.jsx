import Header from '../../components/layout/Header'
import LiveScoreCard from '../../components/match/LiveScoreCard'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import { useMatches } from '../../hooks/useMatches'
import { isToday } from '../../utils/formatDate'

export default function LiveScores() {
  const { matches, loading } = useMatches()
  if (loading) return <Loader />

  const relevant = matches
    .filter((m) => m.status === 'live' || (m.status === 'scheduled' && isToday(m.scheduledAt)))
    .sort((a, b) => {
      if (a.status === 'live' && b.status !== 'live') return -1
      if (b.status === 'live' && a.status !== 'live') return 1
      return (a.scheduledAt?.seconds || 0) - (b.scheduledAt?.seconds || 0)
    })

  return (
    <div>
      <Header title="Placar ao vivo" subtitle="Jogos de hoje" />
      <div className="p-4">
        {relevant.length === 0 ? (
          <EmptyState title="Nenhum jogo hoje" subtitle="Volte mais tarde ou veja os horários" />
        ) : (
          relevant.map((m) => <LiveScoreCard key={m.id} match={m} />)
        )}
      </div>
    </div>
  )
}
