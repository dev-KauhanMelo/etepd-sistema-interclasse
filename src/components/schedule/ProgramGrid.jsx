import { useState } from 'react'
import {
  CRONOGRAMA, VENUES, CATEGORY, EVENT_HOURS,
  dayLabel, isPastDay, isCurrentDay,
} from '../../utils/cronograma'

// Grade oficial (Modo Arena): rail D1–D5 pra escolher o dia, e a programação
// daquele dia por espaço. Sem horários por slot — a Comissão não os definiu,
// então a grade mostra a ORDEM das modalidades em cada espaço.
export default function ProgramGrid() {
  const initial = CRONOGRAMA.find((d) => isCurrentDay(d.date)) || CRONOGRAMA.find((d) => !isPastDay(d.date)) || CRONOGRAMA[0]
  const [selected, setSelected] = useState(initial.day)
  const day = CRONOGRAMA.find((d) => d.day === selected)
  const venue = VENUES[day.venue]
  const today = isCurrentDay(day.date)

  return (
    <div>
      {/* Rail D1–D5 */}
      <div className="flex gap-2" role="tablist" aria-label="Dias do evento">
        {CRONOGRAMA.map((d) => {
          const active = d.day === selected
          const past = isPastDay(d.date)
          const current = isCurrentDay(d.date)
          return (
            <button
              key={d.day}
              role="tab"
              aria-selected={active}
              onClick={() => setSelected(d.day)}
              className={`flex-1 text-center py-2 transition ${
                active
                  ? 'cut-corner-sm bg-gold'
                  : `bg-arena-panel border border-white/[0.07] ${past ? 'opacity-55' : ''}`
              } ${current && !active ? 'border-gold/40' : ''}`}
            >
              <span className={`block font-bracket-display text-[22px] leading-none ${active ? 'text-brand-ink' : 'text-white'}`}>
                D{d.day}
              </span>
              <span className={`block font-bracket font-bold text-[9px] tracking-[0.1em] mt-0.5 ${active ? 'text-brand-ink/70' : 'text-arena-muted'}`}>
                {VENUES[d.venue].short}
              </span>
            </button>
          )
        })}
      </div>

      {/* Cabeçalho do dia */}
      <div className="flex items-center gap-2.5 mt-4 mb-2.5">
        <span className={`font-bracket-display text-base tracking-wide ${today ? 'text-gold' : 'text-white'}`}>
          {dayLabel(day.date).toUpperCase()}
        </span>
        {today && (
          <span className="font-bracket font-bold text-[9px] tracking-[0.14em] text-brand-ink bg-gold px-1.5 py-0.5 uppercase">
            Hoje
          </span>
        )}
        <span className={`flex-1 h-px ${today ? 'bg-gold/25' : 'bg-white/[0.08]'}`} />
        <span className="font-bracket font-bold text-[10px] tracking-[0.14em] text-arena-muted uppercase">
          {venue.name} · {EVENT_HOURS.start}—{EVENT_HOURS.end}
        </span>
      </div>

      {/* Espaços do dia */}
      <div className={`flex flex-col gap-2 ${isPastDay(day.date) ? 'opacity-60' : ''}`}>
        {day.spaces.map((row) => (
          <div
            key={row.space}
            className="cut-tl bg-arena-panel border border-white/[0.07] px-3.5 py-2.5 flex items-start gap-3"
          >
            {/* Espaço em voz discreta (Rajdhani muted) — só o JOGO fala alto */}
            <span className="w-[78px] shrink-0 pt-[3px] font-bracket font-bold text-[10px] tracking-[0.14em] text-arena-muted uppercase leading-tight">
              {row.space}
            </span>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              {row.slots.map((slot, i) => (
                <span key={`${slot.name}-${i}`} className="flex items-center justify-between gap-2">
                  <span className="font-bracket font-bold text-[15px] text-arena-text tracking-[0.04em] truncate">
                    {slot.name}
                  </span>
                  {slot.category && <CategoryTag category={slot.category} />}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Tags de categoria com cor própria: MASC azul, FEM dourado, MISTO neutro.
function CategoryTag({ category }) {
  const skins = {
    masc: 'bg-accent/[0.18] text-accent border-accent/40',
    fem: 'bg-gold/[0.14] text-gold border-gold/40',
    misto: 'bg-white/10 text-arena-text border-white/30',
    ambos: 'bg-white/10 text-arena-text border-white/30',
  }
  return (
    <span className={`font-bracket font-bold text-[10px] tracking-[0.1em] border px-2 py-0.5 ${skins[category]}`}>
      {CATEGORY[category].short}
    </span>
  )
}
