import { Link } from 'react-router-dom'
import Loader from '../../components/common/Loader'
import TeamCrest from '../../components/match/TeamCrest'
import { useMatches } from '../../hooks/useMatches'
import { useModalities } from '../../hooks/useModalities'
import { useAnnouncements } from '../../hooks/useAnnouncements'
import { matchTime, isTimeTBD } from '../../utils/formatDate'
import { CRONOGRAMA, VENUES, dayLabel, isCurrentDay, isPastDay, EVENT_HOURS } from '../../utils/cronograma'

// Home do Modo Arena: contexto do dia (que dia do evento é, onde é),
// o jogo ao vivo como herói, próximos jogos e o bolão. Sem hero de boas-vindas
// e sem grid de atalhos — a bottom-nav já leva pra tudo.
export default function Home() {
  const { matches, loading } = useMatches()
  const { modalities } = useModalities()
  const { announcements } = useAnnouncements()

  if (loading) return <Loader />

  const modName = (id) => modalities.find((m) => m.id === id)?.name || ''
  const live = matches.filter((m) => m.status === 'live')
  const upcoming = matches
    .filter((m) => m.status === 'scheduled')
    .sort((a, b) => (a.scheduledAt?.seconds || 0) - (b.scheduledAt?.seconds || 0))
    .slice(0, 3)

  // Que dia do evento é hoje (ou o próximo, se for véspera/fim de semana)
  const today = CRONOGRAMA.find((d) => isCurrentDay(d.date))
  const next = CRONOGRAMA.find((d) => !isPastDay(d.date))
  const ctx = today || next
  const over = !ctx
  const venue = ctx ? VENUES[ctx.venue] : null

  const headline = over
    ? 'VALEU, JIPD.'
    : !today
      ? 'OS JOGOS VÊM AÍ.'
      : ctx.venue === 'unibra'
        ? 'HOJE TEM QUADRA.'
        : 'HOJE TEM JOGO NA ETE.'

  return (
    <div className="pb-4">
      {/* Contexto do dia */}
      <div className="px-5 pt-6 pb-5">
        {ctx && (
          <p className="font-bracket font-bold text-xs tracking-[0.28em] text-gold uppercase">
            Dia {ctx.day} de 5
          </p>
        )}
        <h1 className="font-bracket-display text-[42px] leading-[0.98] text-white mt-1.5">
          {headline}
        </h1>
        {ctx && (
          <p className="font-bracket font-semibold text-sm text-arena-muted mt-2 uppercase tracking-[0.06em]">
            {dayLabel(ctx.date)} · {venue.name} · {EVENT_HOURS.start}—{EVENT_HOURS.end}
          </p>
        )}
        {/* Progresso do evento: 5 losangos */}
        <div className="flex gap-1.5 mt-4" aria-label={ctx ? `Dia ${ctx.day} de 5` : 'Evento encerrado'}>
          {CRONOGRAMA.map((d) => {
            const done = isPastDay(d.date)
            const current = isCurrentDay(d.date)
            return (
              <span
                key={d.day}
                className={`w-3.5 h-3.5 rotate-45 ${
                  done || current ? 'bg-gold' : 'bg-white/[0.12]'
                } ${current ? 'shadow-[0_0_12px_rgba(245,234,21,0.8)]' : ''}`}
              />
            )
          })}
        </div>
      </div>

      {/* Jogo ao vivo como herói — as cores das turmas tomam o card */}
      {live.length > 0 ? (
        live.map((m) => <LiveHero key={m.id} match={m} modName={modName(m.modalityId)} />)
      ) : (
        <div className="mx-4 cut-corner bg-arena-panel border border-white/[0.07] px-5 py-5 text-center">
          <p className="font-bracket-display text-lg text-white tracking-wide">NENHUM JOGO AO VIVO</p>
          <p className="font-bracket font-semibold text-sm text-arena-muted mt-1">
            {upcoming[0]
              ? `Próximo: ${upcoming[0].teamA?.name} vs ${upcoming[0].teamB?.name} · ${upcoming[0].location}`
              : 'Sem jogos agendados por enquanto'}
          </p>
        </div>
      )}

      {/* Próximos jogos */}
      {upcoming.length > 0 && (
        <>
          <SectionTitle className="mt-6">Próximos jogos</SectionTitle>
          <div className="flex flex-col gap-2 mx-4">
            {upcoming.map((m) => (
              <Link
                key={m.id}
                to={`/placar/${m.id}`}
                className="cut-tl bg-arena-panel border border-white/[0.07] px-3.5 py-2.5 flex items-center gap-3 hover:border-gold/40 transition"
              >
                <span className={`w-[52px] shrink-0 font-bracket-display leading-none ${isTimeTBD(m) ? 'text-[11px] text-arena-muted uppercase tracking-wide' : 'text-lg text-gold'}`}>
                  {matchTime(m)}
                </span>
                <span className="flex-1 min-w-0 flex items-center gap-1.5 font-bracket font-bold text-sm text-arena-text tracking-[0.04em]">
                  <TeamCrest team={m.teamA} size="sm" />
                  <span className="truncate">{m.teamA?.name}</span>
                  <span className="text-arena-dim font-semibold px-0.5">vs</span>
                  <TeamCrest team={m.teamB} size="sm" />
                  <span className="truncate">{m.teamB?.name}</span>
                </span>
                <span className="shrink-0 font-bracket font-bold text-[10px] tracking-[0.12em] text-arena-muted uppercase">
                  {modName(m.modalityId)}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Bolão */}
      <Link to="/bolao" className="block mx-4 mt-6">
        <div className="cut-corner bg-gold px-4 py-3.5 flex items-center justify-between hover:brightness-95 transition">
          <div>
            <p className="font-bracket-display text-lg text-brand-ink tracking-[0.03em]">BOLÃO JIPD</p>
            <p className="font-bracket font-semibold text-xs text-brand-ink/70 mt-0.5">
              Crave o placar e suba no ranking dos cravadores
            </p>
          </div>
          <span className="font-bracket-display text-[22px] text-brand-ink">→</span>
        </div>
      </Link>

      {/* Último aviso */}
      {announcements[0] && (
        <>
          <SectionTitle className="mt-6">Último aviso</SectionTitle>
          <div className="mx-4 cut-corner bg-arena-panel border border-white/[0.07] p-4">
            <p className="font-bracket font-bold text-sm text-white">{announcements[0].title}</p>
            <p className="text-sm text-arena-muted mt-1 leading-snug">{announcements[0].message}</p>
            <Link to="/avisos" className="inline-block font-bracket font-bold text-xs text-gold mt-3 tracking-wide uppercase">
              Ver todos os avisos →
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

// Card-herói do jogo ao vivo: fundo dividido nas cores das turmas + overlay
// escuro pra garantir o contraste do placar branco.
function LiveHero({ match, modName }) {
  const a = match.teamA?.color || '#DC2626'
  const b = match.teamB?.color || '#2563EB'
  return (
    <Link to={`/placar/${match.id}`} className="block mx-4 animate-pop-in">
      <div
        className="cut-corner relative overflow-hidden"
        style={{ background: `linear-gradient(104deg, ${a} 0%, ${a} 46%, ${b} 54%, ${b} 100%)` }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,15,25,0.30),rgba(11,15,25,0.86))]" />
        <div className="relative px-4 pt-3.5 pb-4">
          <div className="flex items-center justify-between">
            <span className="chevron-tag inline-flex items-center gap-1.5 bg-live text-white font-bracket font-bold text-[11px] tracking-[0.1em] px-2.5 py-[3px] pr-4 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-white pulse-live" />
              Ao vivo
            </span>
            <span className="font-bracket font-bold text-[11px] tracking-[0.14em] text-white/75 uppercase">
              {modName}
            </span>
          </div>
          <div className="flex items-center justify-center gap-4 mt-3.5">
            <HeroSide team={match.teamA} />
            <div className="flex items-baseline gap-2.5">
              <span className="font-jersey text-[58px] leading-none text-white">{match.scoreA ?? 0}</span>
              <span className="font-bracket-display text-[22px] text-gold">×</span>
              <span className="font-jersey text-[58px] leading-none text-white">{match.scoreB ?? 0}</span>
            </div>
            <HeroSide team={match.teamB} />
          </div>
        </div>
      </div>
    </Link>
  )
}

function HeroSide({ team }) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-[84px] min-w-0">
      <TeamCrest team={team} size="md" />
      <span className="font-bracket font-bold text-[13px] text-white tracking-[0.06em] truncate max-w-full">
        {team?.name}
      </span>
    </div>
  )
}

function SectionTitle({ children, className = '' }) {
  return (
    <h2 className={`flex items-center gap-2.5 mx-4 mb-2.5 ${className}`}>
      <span className="section-slash" aria-hidden="true" />
      <span className="font-bracket-display text-[17px] text-white tracking-[0.05em] uppercase">{children}</span>
    </h2>
  )
}
