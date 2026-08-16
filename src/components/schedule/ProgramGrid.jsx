import { useState } from 'react'
import {
  CRONOGRAMA, VENUES, CATEGORY, EVENT_HOURS,
  dayLabel, isPastDay, isCurrentDay,
} from '../../utils/cronograma'

// Grade oficial: rail de dias no topo e, para o dia escolhido, um CARD POR
// LOCAL — o nome do local corre na vertical numa faixa dourada à esquerda,
// e cada modalidade daquele local é uma linha própria. Antes o nome do local
// disputava espaço com os jogos na horizontal e tudo lia como zigue-zague.
export default function ProgramGrid() {
  const initial =
    CRONOGRAMA.find((d) => isCurrentDay(d.date)) ||
    CRONOGRAMA.find((d) => !isPastDay(d.date)) ||
    CRONOGRAMA[0]
  const [selected, setSelected] = useState(initial.day)
  const day = CRONOGRAMA.find((d) => d.day === selected)
  const venue = VENUES[day.venue]
  const today = isCurrentDay(day.date)

  return (
    <div>
      {/* Rail de dias */}
      <div className="flex gap-1.5" role="tablist" aria-label="Dias do evento">
        {CRONOGRAMA.map((d) => {
          const active = d.day === selected
          const past = isPastDay(d.date)
          const [week, date] = dayLabel(d.date).split(' · ')
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
              }`}
            >
              <span className={`block font-varsity text-[19px] leading-none ${active ? 'text-brand-ink' : 'text-arena-dim'}`}>
                {week.toUpperCase()}
              </span>
              <span className={`block font-bracket font-bold text-[9px] tracking-[0.08em] mt-1 ${active ? 'text-brand-ink/70' : 'text-arena-dim'}`}>
                {date.split('/')[0]} · {VENUES[d.venue].short}
              </span>
            </button>
          )
        })}
      </div>

      {/* Cabeçalho do dia */}
      <div className="flex items-center gap-2.5 mt-4 mb-2.5">
        <span className="font-varsity text-base text-gold tracking-wide">
          {dayLabel(day.date).toUpperCase()}
        </span>
        {today && (
          <span className="font-bracket font-bold text-[9px] tracking-[0.14em] text-brand-ink bg-gold px-1.5 py-0.5 uppercase">
            Hoje
          </span>
        )}
        <span className="flex-1 h-px bg-[linear-gradient(90deg,rgba(245,234,21,0.35),transparent)]" />
        <span className="font-bracket font-bold text-[10px] tracking-[0.12em] text-arena-muted uppercase text-right">
          {venue.short} · {EVENT_HOURS.start}—{EVENT_HOURS.end}
        </span>
      </div>

      {/* Um card por local */}
      <div className={`flex flex-col gap-2.5 ${isPastDay(day.date) ? 'opacity-60' : ''}`}>
        {day.spaces.map((row) => (
          <div
            key={row.space}
            className="cut-corner flex bg-arena-panel border border-white/[0.07] overflow-hidden"
          >
            {/* Nome do local na vertical: sai da frente das modalidades */}
            <div className="w-11 shrink-0 bg-gold/[0.09] border-r border-gold/25 flex items-center justify-center py-2.5">
              <span
                className="font-varsity text-[12px] tracking-[0.16em] text-gold whitespace-nowrap"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                {row.space.toUpperCase()}
              </span>
            </div>

            {/* Uma linha por modalidade */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              {row.slots.map((slot, i) => (
                <div
                  key={`${slot.name}-${i}`}
                  className={`flex items-center gap-2.5 px-3.5 py-[11px] ${
                    i < row.slots.length - 1 ? 'border-b border-white/[0.06]' : ''
                  }`}
                >
                  <span className="w-[7px] h-[7px] rotate-45 bg-gold shrink-0" aria-hidden="true" />
                  <span className="flex-1 min-w-0 font-body font-bold text-[15px] text-arena-text truncate">
                    {slot.name}
                  </span>
                  <CategoryTag category={slot.category} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Tags de categoria: largura fixa pra todas ficarem alinhadas na coluna.
// MASC azul, FEM dourado, MISTO/AMBOS neutro.
function CategoryTag({ category }) {
  const key = category || 'misto'
  const skins = {
    masc: 'bg-accent/[0.16] text-accent border-accent/40',
    fem: 'bg-gold/[0.14] text-gold border-gold/40',
    misto: 'bg-white/[0.08] text-[#B9C4D8] border-white/25',
    ambos: 'bg-white/[0.08] text-[#B9C4D8] border-white/25',
  }
  return (
    <span
      className={`w-[54px] shrink-0 text-center font-bracket font-bold text-[10px] tracking-[0.06em] border py-0.5 ${skins[key]}`}
    >
      {CATEGORY[key].short}
    </span>
  )
}
