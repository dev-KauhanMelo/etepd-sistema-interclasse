import { Link } from 'react-router-dom'
import JipdLogo from '../../components/common/JipdLogo'
import LiveScoreCard from '../../components/match/LiveScoreCard'
import Loader from '../../components/common/Loader'
import Card from '../../components/common/Card'
import { NodesIcon, TrophyIcon, ClockIcon } from '../../components/common/Icons'
import { useMatches } from '../../hooks/useMatches'
import { useAnnouncements } from '../../hooks/useAnnouncements'
import { useEventSettings } from '../../hooks/useEventSettings'
import { formatDateTime, formatShortDate } from '../../utils/formatDate'

export default function Home() {
  const { matches, loading } = useMatches()
  const { announcements } = useAnnouncements()
  const { settings } = useEventSettings()

  if (loading) return <Loader />

  const live = matches.filter((m) => m.status === 'live')
  const upcoming = matches
    .filter((m) => m.status === 'scheduled')
    .sort((a, b) => (a.scheduledAt?.seconds || 0) - (b.scheduledAt?.seconds || 0))
    .slice(0, 2)

  return (
    <div className="p-4">
      {/* Hero JIPD */}
      <div className="jipd-gradient circuit-lines rounded-3xl px-6 pt-8 pb-7 text-center shadow-card animate-pop-in">
        <JipdLogo size="lg" variant="dark" withTagline />
        {settings?.startAt && (
          <span className="inline-block mt-5 bg-white/10 border border-white/15 text-brand-mist text-xs font-bold px-4 py-1.5 rounded-full tracking-wide">
            {formatShortDate(settings.startAt)}{settings.endAt ? ` → ${formatShortDate(settings.endAt)}` : ''} · ETE Porto Digital
          </span>
        )}
      </div>

      {/* Ao vivo */}
      <SectionTitle live={live.length > 0}>{live.length > 0 ? 'Rolando agora' : 'Ao vivo'}</SectionTitle>
      {live.length === 0 ? (
        <Card className="text-center py-6">
          <p className="font-display font-bold text-brand-deep">Nenhum jogo ao vivo</p>
          <p className="text-sm text-brand-steel mt-1">
            {upcoming[0] ? `Próximo: ${formatDateTime(upcoming[0].scheduledAt)}` : 'Sem jogos agendados por enquanto'}
          </p>
        </Card>
      ) : (
        live.map((m) => <LiveScoreCard key={m.id} match={m} />)
      )}

      {/* Bolão teaser */}
      <Link to="/bolao" className="block mt-6 animate-pop-in">
        <div className="bg-brand-navy rounded-2xl p-4 flex items-center gap-4 shadow-card border border-brand/30 hover:border-brand-light/50 transition">
          <div className="w-12 h-12 rounded-2xl bg-brand/30 flex items-center justify-center shrink-0">
            <NodesIcon className="w-6 h-6 text-brand-light" />
          </div>
          <div className="flex-1">
            <p className="font-display font-extrabold text-white">Bolão JIPD 🔥</p>
            <p className="text-xs text-brand-mist mt-0.5">Dê seus palpites, acerte os placares e suba no ranking dos cravadores!</p>
          </div>
          <span className="text-brand-light font-black text-xl">→</span>
        </div>
      </Link>

      {/* Próximos jogos */}
      {upcoming.length > 0 && (
        <>
          <SectionTitle>Próximos jogos</SectionTitle>
          {upcoming.map((m) => <LiveScoreCard key={m.id} match={m} />)}
        </>
      )}

      {/* Último aviso */}
      {announcements[0] && (
        <>
          <SectionTitle>Último aviso</SectionTitle>
          <Card className="border-l-4 border-l-brand">
            <p className="font-bold text-sm text-brand-deep">{announcements[0].title}</p>
            <p className="text-sm text-brand-steel mt-1">{announcements[0].message}</p>
            <Link to="/avisos" className="inline-block text-brand font-semibold text-xs mt-3">
              Ver todos os avisos →
            </Link>
          </Card>
        </>
      )}

      {/* Atalhos */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <QuickLink to="/horarios" icon={<ClockIcon className="w-5 h-5" />} label="Tabela de jogos" />
        <QuickLink to="/ranking" icon={<TrophyIcon className="w-5 h-5" />} label="Classificação" />
      </div>
    </div>
  )
}

function SectionTitle({ children, live = false }) {
  return (
    <h2 className="headline text-base text-brand-navy mt-6 mb-3 flex items-center gap-2">
      {live && <span className="w-2.5 h-2.5 bg-live rounded-full pulse-live not-italic" />}
      {children}
    </h2>
  )
}

function QuickLink({ to, icon, label }) {
  return (
    <Link to={to}>
      <Card className="flex items-center gap-3 py-3 text-brand hover:border-brand/40 transition">
        {icon}
        <span className="text-sm font-bold text-brand-deep">{label}</span>
      </Card>
    </Link>
  )
}
