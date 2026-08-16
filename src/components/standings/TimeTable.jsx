import TeamCrest from '../match/TeamCrest'
import { TIME_FIELDS, roundAverage, formatTime } from '../../utils/standings'

// Tabela do Cubo Mágico: três tentativas cronometradas por turma e a média,
// que é o que decide (edital 7.8). Aqui o MENOR tempo é o melhor — o oposto
// das outras tabelas —, por isso a média fica em destaque dourado e as
// tentativas ficam discretas ao lado.
export default function TimeTable({ standings, teamOf, subtitle }) {
  return (
    <div className="bracket-stage px-3 py-5 rounded-2xl border border-gold/25 animate-pop-in">
      <div className="text-center mb-1">
        <h2 className="font-varsity text-2xl text-white tracking-wide leading-none">CLASSIFICAÇÃO</h2>
        {subtitle && (
          <p className="font-bracket font-bold text-[11px] tracking-[0.18em] text-gold mt-1.5 uppercase">
            {subtitle}
          </p>
        )}
      </div>
      <p className="text-center font-body font-medium text-[11px] text-white/45 mb-4">
        Menor média das 3 tentativas vence
      </p>

      {/* Cabeçalho */}
      <div className="flex items-center gap-2 px-2 pb-1.5">
        <span className="w-7 shrink-0" />
        <span className="flex-1 min-w-0" />
        {TIME_FIELDS.map((f) => (
          <span key={f.key} className="w-12 shrink-0 text-center font-bracket font-bold text-[11px] tracking-wider text-white/50">
            {f.short}
          </span>
        ))}
        <span className="w-[62px] shrink-0 text-center font-bracket font-bold text-[11px] tracking-wider text-gold">
          MÉDIA
        </span>
      </div>

      <div className="space-y-1.5">
        {standings.map((s, i) => {
          const team = teamOf(s)
          const avg = roundAverage(s)
          // Só lidera de verdade quem já tem tempo cronometrado
          const isLeader = i === 0 && avg !== null
          return (
            <div
              key={s.id}
              className={`flex items-center gap-2 rounded-lg px-2 py-2 border ${
                isLeader
                  ? 'bg-gradient-to-r from-gold/20 to-brand-navy/60 border-gold/70'
                  : 'bg-brand-navy/50 border-white/5'
              }`}
            >
              <span className={`w-7 shrink-0 text-center font-jersey text-lg leading-none ${isLeader ? 'text-gold' : 'text-white/50'}`}>
                {avg === null ? '—' : i + 1}
              </span>

              <span className="flex items-center gap-2 flex-1 min-w-0">
                <TeamCrest team={team} size="sm" />
                <span className={`font-bracket font-bold text-sm uppercase tracking-wide truncate ${isLeader ? 'text-gold' : 'text-white'}`}>
                  {team.name}
                </span>
              </span>

              {TIME_FIELDS.map((f) => (
                <span key={f.key} className="w-12 shrink-0 text-center font-bracket font-semibold text-[12px] text-white/55">
                  {formatTime(s[f.key])}
                </span>
              ))}

              <span className={`w-[62px] shrink-0 text-center font-jersey text-base leading-none ${isLeader ? 'text-gold' : 'text-white'}`}>
                {avg === null ? '—' : formatTime(avg)}
              </span>
            </div>
          )
        })}
      </div>

      <p className="text-center text-[10px] text-white/35 mt-4 font-bracket tracking-wider uppercase">
        Tempos em segundos · penalidade de +2s por tentativa, conforme o edital
      </p>
    </div>
  )
}
