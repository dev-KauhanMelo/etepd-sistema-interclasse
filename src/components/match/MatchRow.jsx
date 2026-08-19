import { Link } from 'react-router-dom'
import TeamCrest from './TeamCrest'
import { matchTime, isTimeTBD } from '../../utils/formatDate'
import SetLine from './SetLine'
import { emAndamento, estaPausado } from '../../utils/matchFilters'

// Card de confronto usado em todas as listas de jogos (Placar, Cronograma).
//
// Dois andares de propósito:
//  - em cima, a meta (status + local) — antes o local ficava numa coluna
//    lateral e espremia os nomes das turmas, que chegavam a truncar;
//  - embaixo, o confronto respirando: bandeira 46px e nome da turma inteiro
//    (`whitespace-nowrap` — nome de turma tem 4 caracteres, nunca deve cortar).
export default function MatchRow({ match, modName }) {
  // Pausado continua com o peso visual de jogo rolando — muda só o rótulo.
  const live = emAndamento(match)
  const pausado = estaPausado(match)
  const finished = match.status === 'finished'
  const scheduled = match.status === 'scheduled'
  const winner = !scheduled && match.scoreA !== match.scoreB ? (match.scoreA > match.scoreB ? 'A' : 'B') : null

  const [venue, space] = match.space
    ? [match.venue === 'unibra' ? 'UNIBRA' : 'ETE PD', match.space]
    : String(match.location || '').split(' · ')

  // Jogo rolando: o card ganha o campo dividido nas cores das duas turmas,
  // como o hero da Home. É o único estado que merece esse peso visual.
  const colorA = match.teamA?.color || '#DC2626'
  const colorB = match.teamB?.color || '#2563EB'

  return (
    <Link
      to={`/placar/${match.id}`}
      className={`block cut-corner relative overflow-hidden border transition hover:border-gold/40 ${
        live ? 'border-white/70' : 'border-white/[0.07] bg-arena-panel'
      } ${finished ? 'opacity-70' : ''}`}
      style={live ? { background: `linear-gradient(104deg, ${colorA} 0%, ${colorA} 46%, ${colorB} 54%, ${colorB} 100%)` } : undefined}
    >
      {/* Véu escuro por cima das cores: garante o contraste do placar branco */}
      {live && <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,15,25,0.42),rgba(11,15,25,0.88))]" />}
      {live && !pausado && <div className="relative h-[3px] live-bar" />}
      {pausado && <div className="relative h-[3px] bg-amber-500/70" />}

      {/* Andar 1 — meta */}
      <div className={`relative flex items-center justify-between gap-2 px-3.5 py-2.5 ${live ? 'border-b border-white/15' : 'border-b border-white/[0.06]'}`}>
        {live ? (
          // Pílula branca em volta do vermelho: o contraste faz o "ao vivo"
          // saltar mesmo por cima das cores fortes das turmas.
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-[3px] font-bracket font-bold text-[10px] tracking-[0.14em] uppercase shadow-sm ${
            pausado ? 'text-amber-600' : 'text-live'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${pausado ? 'bg-amber-500' : 'bg-live pulse-live'}`} />
            {pausado ? 'Pausado' : 'Ao vivo'}
          </span>
        ) : (
          <span
            className={`inline-flex items-center gap-1.5 font-bracket font-bold text-[10px] tracking-[0.14em] uppercase ${
              scheduled ? 'text-accent' : 'text-arena-muted'
            }`}
          >
            {finished ? 'Encerrado' : `Agendado · ${isTimeTBD(match) ? 'a definir' : matchTime(match)}`}
          </span>
        )}
        <span className="font-bracket font-bold text-[10px] tracking-[0.1em] text-arena-dim uppercase truncate">
          {venue}{space ? ` · ${space}` : ''}
        </span>
      </div>

      {/* Andar 2 — confronto */}
      <div className="relative flex items-center justify-center gap-2.5 px-3 pt-3.5 pb-4">
        <TeamSide team={match.teamA} align="end" winner={winner === 'A'} />
        {scheduled ? (
          <span className="font-varsity text-sm text-gold shrink-0">VS</span>
        ) : (
          // O "×" fica numa caixa de altura fixa e centralizado: a fonte Jersey
          // (só dígitos) e a do "×" têm métricas diferentes, e alinhá-los pela
          // linha de base jogava o "×" pra baixo, parecendo um ponto solto.
          <span className="flex items-center gap-2 shrink-0 leading-none">
            <span className={`font-jersey text-[32px] leading-none ${winner === 'A' ? 'text-gold' : 'text-white'}`}>
              {match.scoreA ?? 0}
            </span>
            <span className="font-bracket-display text-lg text-gold/70 leading-none flex items-center h-[32px]">×</span>
            <span className={`font-jersey text-[32px] leading-none ${winner === 'B' ? 'text-gold' : 'text-white'}`}>
              {match.scoreB ?? 0}
            </span>
          </span>
        )}
        <TeamSide team={match.teamB} align="start" winner={winner === 'B'} />
      </div>

      <SetLine match={match} className="relative px-3.5 -mt-1 text-center" />

      {modName && (
        <p className={`relative px-3.5 pb-2.5 pt-1 text-center font-body font-medium text-[11px] ${live ? 'text-white/60' : 'text-arena-dim'}`}>
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
