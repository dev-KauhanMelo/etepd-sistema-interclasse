import TeamCrest from '../match/TeamCrest'
import { BooyahIcon } from '../common/Icons'
import { POINTS_FIELDS } from '../../utils/standings'

// Tabela de classificação por pontos (Free Fire), no espírito da LBFF:
// fundo escuro, colocação grande à esquerda, escudo da turma e as três
// colunas numéricas (P / B! / A). O líder ganha moldura dourada.
//
// Usa o mesmo tema escuro do chaveamento — as duas telas são o "momento
// torneio" do site, o resto do app segue claro.
export default function PointsTable({ standings, teamOf, title, subtitle }) {
  return (
    <div className="bracket-stage px-3 py-5 rounded-2xl border border-gold/25 animate-pop-in">
      <div className="text-center mb-4">
        <h2 className="font-bracket-display text-2xl text-white tracking-wide leading-none">CLASSIFICAÇÃO</h2>
        {(title || subtitle) && (
          <p className="font-bracket font-bold text-[11px] tracking-[0.18em] text-gold mt-1.5 uppercase">
            {subtitle || title}
          </p>
        )}
      </div>

      {/* Cabeçalho das colunas numéricas */}
      <div className="flex items-center gap-2 px-2 pb-1.5">
        <span className="w-7 shrink-0" />
        <span className="flex-1 min-w-0" />
        {POINTS_FIELDS.map((f) => (
          <span
            key={f.key}
            className="w-12 shrink-0 flex items-center justify-center font-bracket font-bold text-[11px] tracking-wider text-white/70"
            title={f.label}
          >
            {f.key === 'booyahs' ? <BooyahIcon className="w-[22px] h-[22px]" /> : f.short}
          </span>
        ))}
      </div>

      <div className="space-y-1.5">
        {standings.map((s, i) => {
          const team = teamOf(s)
          const isLeader = i === 0
          return (
            <div
              key={s.id}
              className={`flex items-center gap-2 rounded-lg px-2 py-2 border ${
                isLeader
                  ? 'bg-gradient-to-r from-gold/20 to-brand-navy/60 border-gold/70'
                  : 'bg-brand-navy/50 border-white/5'
              }`}
            >
              <span
                className={`w-7 shrink-0 text-center font-bracket-display text-lg leading-none ${
                  isLeader ? 'text-gold' : 'text-white/50'
                }`}
              >
                {i + 1}
              </span>

              <span className="flex items-center gap-2 flex-1 min-w-0">
                <TeamCrest team={team} size="sm" />
                <span
                  className={`font-bracket font-bold text-sm uppercase tracking-wide truncate ${
                    isLeader ? 'text-gold' : 'text-white'
                  }`}
                >
                  {team.name}
                </span>
              </span>

              {POINTS_FIELDS.map((f) => (
                <span
                  key={f.key}
                  className={`w-12 shrink-0 text-center font-bracket-display text-base leading-none ${
                    f.key === 'points'
                      ? isLeader ? 'text-gold' : 'text-white'
                      : 'text-white/60'
                  }`}
                >
                  {s[f.key] || 0}
                </span>
              ))}
            </div>
          )
        })}
      </div>

      <p className="text-center text-[10px] text-white/35 mt-4 font-bracket tracking-wider uppercase">
        P = pontos · B! = booyah · A = abates
      </p>
    </div>
  )
}