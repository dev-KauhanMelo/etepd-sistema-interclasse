import { Link } from 'react-router-dom'
import Header from '../../components/layout/Header'
import LiveScoreCard from '../../components/match/LiveScoreCard'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import Card from '../../components/common/Card'
import { useMatches } from '../../hooks/useMatches'
import { useAnnouncements } from '../../hooks/useAnnouncements'
import { formatDateTime } from '../../utils/formatDate'

export default function Home() {
  const { matches, loading } = useMatches()
  const { announcements } = useAnnouncements()

  if (loading) return <Loader />

  const live = matches.filter((m) => m.status === 'live')
  const next = matches
    .filter((m) => m.status === 'scheduled')
    .sort((a, b) => (a.scheduledAt?.seconds || 0) - (b.scheduledAt?.seconds || 0))[0]

  return (
    <div>
      <Header title="Interclasse 2026" subtitle="ETE Porto Digital" />
      <div className="p-4">
        <SectionTitle>Ao vivo agora</SectionTitle>
        {live.length === 0 ? (
          <EmptyState
            title="Nenhum jogo ao vivo"
            subtitle={next ? `Próximo jogo: ${formatDateTime(next.scheduledAt)}` : 'Sem jogos agendados'}
          />
        ) : (
          live.map((m) => <LiveScoreCard key={m.id} match={m} />)
        )}

        {next && (
          <>
            <SectionTitle>Próximo jogo</SectionTitle>
            <LiveScoreCard match={next} />
          </>
        )}

        {announcements[0] && (
          <>
            <SectionTitle>Último aviso</SectionTitle>
            <Card>
              <p className="font-semibold text-sm">{announcements[0].title}</p>
              <p className="text-sm text-slate-500 mt-1">{announcements[0].message}</p>
            </Card>
          </>
        )}

        <Link to="/ranking" className="block text-center text-brand font-medium text-sm mt-6">
          Ver ranking completo →
        </Link>
      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mt-6 mb-3">{children}</h2>
}
