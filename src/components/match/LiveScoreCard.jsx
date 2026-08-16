import { Link } from 'react-router-dom'
import TeamCrest from './TeamCrest'
import { useModalities } from '../../hooks/useModalities'
import { matchTime } from '../../utils/formatDate'

// Card de jogo do Modo Arena: times empilhados, placar Anton à direita.
// Três caras: ao vivo (borda vermelha + live-bar), agendado (fantasma
// tracejado) e encerrado (apagado, vencedor em dourado).
export default function LiveScoreCard({ match }) {
  const { modalities } = useModalities()
  const modName = modalities.find((m) => m.id === match.modalityId)?.name || ''

  if (match.status === 'scheduled') return <GhostCard match={match} modName={modName} />

  const isLive = match.status === 'live'
  const finished = match.status === 'finished'
  const winner =
    finished && match.scoreA !== match.scoreB ? (match.scoreA > match.scoreB ? 'A' : 'B') : null
  const leader = isLive && match.scoreA !== match.scoreB ? (match.scoreA > match.scoreB ? 'A' : 'B') : winner

  return (
    <Link to={`/placar/${match.id}`} className="block mb-2.5 animate-pop-in">
      <div
        className={`cut-corner relative bg-arena-panel border transition hover:border-gold/40 ${
          isLive ? 'border-live/35' : 'border-white/[0.07]'
        } ${finished ? 'opacity-70' : ''}`}
      >
        {isLive && <div className="h-[3px] live-bar" />}
        <div className="px-3.5 py-3">
          <div className="flex items-center justify-between mb-2.5">
            <span
              className={`inline-flex items-center gap-1.5 font-bracket font-bold text-[11px] tracking-[0.12em] uppercase ${
                isLive ? 'text-live' : 'text-arena-muted'
              }`}
            >
              {isLive && <span className="w-1.5 h-1.5 rounded-full bg-live pulse-live" />}
              {isLive ? `Ao vivo · ${modName}` : `Encerrado · ${modName}`}
            </span>
            <span className="font-bracket font-semibold text-[11px] text-arena-muted tracking-[0.08em] uppercase">
              {match.location}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <TeamRow team={match.teamA} score={match.scoreA} lead={leader === 'A'} />
            <TeamRow team={match.teamB} score={match.scoreB} lead={leader === 'B'} />
          </div>
        </div>
      </div>
    </Link>
  )
}

function TeamRow({ team, score, lead }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-1 h-[22px] shrink-0" style={{ backgroundColor: team?.color || '#5A6C8C' }} />
      <TeamCrest team={team} size="sm" />
      <span className="flex-1 min-w-0 font-bracket font-bold text-[15px] text-white tracking-[0.05em] truncate">
        {team?.name || '-'}
      </span>
      <span className={`font-bracket-display text-[26px] leading-none ${lead ? 'text-gold' : 'text-white'}`}>
        {score ?? 0}
      </span>
    </div>
  )
}

// Agendado: card "fantasma" — hora (ou A DEF.) em dourado, confronto discreto.
function GhostCard({ match, modName }) {
  return (
    <Link to={`/placar/${match.id}`} className="block mb-2.5 animate-pop-in">
      <div className="cut-corner bg-arena-ghost border border-dashed border-white/[0.14] px-3.5 py-3 flex items-center gap-3 transition hover:border-gold/40">
        <span className="w-[52px] shrink-0 font-bracket-display text-lg leading-none text-gold uppercase [font-size:min(18px,1.1rem)]">
          {matchTime(match)}
        </span>
        <span className="flex-1 min-w-0 font-bracket font-bold text-sm text-[#B9C4D8] tracking-[0.05em] truncate">
          {match.teamA?.name} <span className="text-arena-dim">vs</span> {match.teamB?.name}
        </span>
        <span className="shrink-0 font-bracket font-bold text-[10px] tracking-[0.12em] text-arena-muted uppercase text-right">
          {modName}
          <br />
          <span className="text-arena-dim normal-case tracking-normal">{match.location}</span>
        </span>
      </div>
    </Link>
  )
}
