import Header from '../../components/layout/Header'
import LiveScoreCard from '../../components/match/LiveScoreCard'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import { BarsIcon } from '../../components/common/Icons'
import { useMatches } from '../../hooks/useMatches'
import { isToday } from '../../utils/formatDate'

export default function LiveScores() {
  const { matches, loading } = useMatches()
  if (loading) return <Loader />

  const live = matches.filter((m) => m.status === 'live')
  const todayScheduled = matches
    .filter((m) => m.status === 'scheduled' && isToday(m.scheduledAt))
    .sort((a, b) => (a.scheduledAt?.seconds || 0) - (b.scheduledAt?.seconds || 0))
  const todayFinished = matches.filter((m) => m.status === 'finished' && isToday(m.scheduledAt))

  const nothingToday = live.length + todayScheduled.length + todayFinished.length === 0

  return (
    <div>
      <Header title="Placar ao vivo" subtitle="Tudo que está acontecendo hoje" />
      <div className="p-4 pt-2">
        {nothingToday && (
          <EmptyState
            icon={<BarsIcon className="w-10 h-10" />}
            title="Nenhum jogo hoje"
            subtitle="Confira a tabela completa em Horários"
          />
        )}

        {live.length > 0 && (
          <>
            <GroupTitle live>Rolando agora</GroupTitle>
            {live.map((m) => <LiveScoreCard key={m.id} match={m} />)}
          </>
        )}

        {todayScheduled.length > 0 && (
          <>
            <GroupTitle>Ainda hoje</GroupTitle>
            {todayScheduled.map((m) => <LiveScoreCard key={m.id} match={m} />)}
          </>
        )}

        {todayFinished.length > 0 && (
          <>
            <GroupTitle>Já encerrados</GroupTitle>
            {todayFinished.map((m) => <LiveScoreCard key={m.id} match={m} />)}
          </>
        )}
      </div>
    </div>
  )
}

function GroupTitle({ children, live = false }) {
  return (
    <h2 className="headline text-base text-brand-navy mt-4 mb-3 flex items-center gap-2">
      {live && <span className="w-2.5 h-2.5 bg-live rounded-full pulse-live not-italic" />}
      {children}
    </h2>
  )
}
