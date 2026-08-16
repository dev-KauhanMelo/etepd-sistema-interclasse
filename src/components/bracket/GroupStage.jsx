import { FEMININO_RODADAS, FEMININO_TEAMS, femininoTeam } from '../../utils/cronograma'

// Fase de grupos dos Esportes Femininos (edital 3.3): 4 equipes, 3 rodadas,
// e as DUAS melhores vão para a final. As equipes podem ser turmas unidas
// (edital 5.1) — por isso "Primeirão" e "Terceirão" em vez de 1ºA, 1ºB…
//
// Mesmo tema escuro do mata-mata: as duas telas são o "momento torneio".
export default function GroupStage({ title }) {
  return (
    <div className="bracket-stage rounded-2xl border border-gold/25 overflow-hidden animate-pop-in">
      <div className="px-4 pt-5 pb-1 flex justify-center">
        <div
          className="px-8 py-2.5 text-center"
          style={{
            background: 'linear-gradient(90deg,#10306E,#0552CB)',
            borderTop: '3px solid #F5EA15',
            borderBottom: '3px solid #F5EA15',
            clipPath: 'polygon(3% 0,97% 0,100% 50%,97% 100%,3% 100%,0 50%)',
          }}
        >
          <div className="font-bracket-display text-[22px] text-white leading-none tracking-wide">FEMININO</div>
          <div className="font-bracket font-bold text-[11px] text-gold tracking-[0.15em] mt-0.5 uppercase">
            {title || 'Fase de grupos'}
          </div>
        </div>
      </div>

      {/* As 4 equipes que disputam */}
      <div className="px-4 pt-4">
        <p className="font-bracket text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2">Equipes</p>
        <div className="grid grid-cols-2 gap-1.5">
          {FEMININO_TEAMS.map((t) => (
            <div key={t.id} className="bg-brand-navy/50 border border-white/5 rounded-lg px-2.5 py-2">
              <p className="font-bracket font-bold text-sm text-white uppercase leading-none">{t.name}</p>
              <p className="font-bracket text-[10px] text-white/45 mt-1">{t.hint}</p>
            </div>
          ))}
        </div>
      </div>

      {/* As 3 rodadas */}
      <div className="px-4 py-4 space-y-3">
        {FEMININO_RODADAS.map((rodada) => (
          <div key={rodada.round}>
            <p className="font-bracket text-[10px] uppercase tracking-[0.18em] text-gold/80 mb-1.5">
              {rodada.label}
            </p>
            <div className="space-y-1.5">
              {rodada.games.map(([a, b], i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-brand-navy/40 border border-gold/15 rounded-lg px-2.5 py-2"
                >
                  <span className="flex-1 min-w-0 text-right font-bracket font-bold text-xs text-white uppercase truncate">
                    {femininoTeam(a)?.name}
                  </span>
                  <span className="shrink-0 font-bracket-display text-[10px] text-brand-deep bg-gold px-1.5 py-0.5 leading-none">
                    VS
                  </span>
                  <span className="flex-1 min-w-0 font-bracket font-bold text-xs text-white uppercase truncate">
                    {femininoTeam(b)?.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-5">
        <div className="bg-gold/10 border border-gold/30 rounded-lg px-3 py-2.5">
          <p className="font-bracket font-bold text-[11px] text-gold uppercase tracking-wide">
            As 2 melhores vão para a final
          </p>
          <p className="font-bracket text-[11px] text-white/55 mt-0.5 leading-snug">
            Handebol, Queimado e Barra Bandeira não entram aqui — essas são mata-mata.
          </p>
        </div>
      </div>
    </div>
  )
}
