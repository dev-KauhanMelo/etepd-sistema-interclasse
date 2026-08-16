import { Link } from 'react-router-dom'
import TeamCrest from './TeamCrest'
import { matchTime, isTimeTBD } from '../../utils/formatDate'

// Card de confronto usado em todas as listas de jogos (Placar, Cronograma).
//
// Dois andares de propósito:
//  - em cima, a meta (status + local) — antes o local ficava numa coluna
//    lateral e espremia os nomes das turmas, que chegavam a truncar;
//  - embaixo, o confronto respirando: bandeira 46px e nome da turma inteiro
//    (`whitespace-nowrap` — nome de turma tem 4 caracteres, nunca deve cortar).
export default function MatchRow({ match, modName }) {
  const live = match.status === 'live'
  const finished = match.status === 'finished'
  const scheduled = match.status === 'scheduled'
  const winner = !scheduled && match.scoreA !== match.scoreB ? (match.scoreA > match.scoreB ? 'A' : 'B') : null

  const [venue, space] = match.space
    ? [match.venue === 'unibra' ? 'UNIBRA' : 'ETE PD', match.space]
    : String(match.location || '').split(' · ')

  return (
    <Link
      to={`/placar/${match.id}`}
      className={`block cut-corner bg-arena-panel border transition hover:border-gold/40 ${
        live ? 'border-live/35' : 'border-white/[0.07]'
      } ${finished ? 'opacity-70' : ''}`}
    >
      {live && <div className="h-[3px] live-bar" />}

      {/* Andar 1 — meta */}
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-white/[0.06]">
        <span
          className={`inline-flex items-center gap-1.5 font-bracket font-bold text-[10px] tracking-[0.14em] uppercase ${
            live ? 'text-live' : scheduled ? 'text-accent' : 'text-arena-muted'
          }`}
        >
          {live && <span className="w-1.5 h-1.5 rounded-full bg-live pulse-live" />}
          {live ? 'Ao vivo' : finished ? 'Encerrado' : `Agendado · ${isTimeTBD(match) ? 'a definir' : matchTime(match)}`}
        </span>
        <span className="font-bracket font-bold text-[10px] tracking-[0.1em] text-arena-dim uppercase truncate">
          {venue}{space ? ` · ${space}` : ''}
        </span>
      </div>

      {/* Andar 2 — confronto */}
      <div className="flex items-center justify-center gap-3 px-3 pt-3.5 pb-4">
        <TeamSide team={match.teamA} align="end" winner={winner === 'A'} />
        {scheduled ? (
          <span className="font-varsity text-sm text-gold shrink-0">VS</span>
        ) : (
          <span className="flex items-center gap-2 shrink-0">
            <span className={`font-jersey text-[30px] leading-none ${winner === 'A' ? 'text-gold' : 'text-white'}`}>
              {match.scoreA ?? 0}
            </span>
            <span className="font-bracket-display text-base text-arena-dim leading-none">×</span>
            <span className={`font-jersey text-[30px] leading-none ${winner === 'B' ? 'text-gold' : 'text-white'}`}>
              {match.scoreB ?? 0}
            </span>
          </span>
        )}
        <TeamSide team={match.teamB} align="start" winner={winner === 'B'} />
      </div>

      {modName && (
        <p className="px-3.5 pb-2.5 -mt-1 text-center font-body font-medium text-[11px] text-arena-dim">
          {modName}
        </p>
      )}
    </Link>
  )
}

function TeamSide({ team, align, winner }) {
  return (
    <div className={`flex-1 min-w-0 flex items-center gap-2.5 ${align === 'end' ? 'justify-end' : ''}`}>
      {align === 'end' && <TeamName team={team} winner={winner} />}
      <TeamCrest team={team} size="md" />
      {align === 'start' && <TeamName team={team} winner={winner} />}
    </div>
  )
}

// Nome nunca trunca: turma tem no máximo 4 caracteres ("3º B")
function TeamName({ team, winner }) {
  return (
    <span
      className={`font-bracket-display text-[19px] tracking-[0.04em] whitespace-nowrap ${
        winner ? 'text-gold' : 'text-white'
      }`}
    >
      {team?.name || '—'}
    </span>
  )
}
