import {
  CRONOGRAMA, VENUES, CATEGORY, EVENT_HOURS,
  dayLabel, isPastDay, isCurrentDay,
} from '../../utils/cronograma'

// Grade oficial do evento: que modalidade rola em qual espaço, em qual dia.
// É o que o aluno olha pra saber "onde eu tenho que estar hoje".
export default function ProgramGrid({ venueFilter = 'all' }) {
  const days = CRONOGRAMA.filter((d) => venueFilter === 'all' || d.venue === venueFilter)

  if (days.length === 0) {
    return <p className="text-sm text-brand-steel text-center py-6">Nenhum dia para esse local.</p>
  }

  return (
    <div className="space-y-4">
      {days.map((day) => {
        const venue = VENUES[day.venue]
        const today = isCurrentDay(day.date)
        const past = isPastDay(day.date)

        return (
          <div
            key={day.day}
            className={`bg-white rounded-2xl shadow-card border overflow-hidden transition ${
              today ? 'border-brand ring-2 ring-brand/20' : 'border-brand-mist/25'
            } ${past ? 'opacity-60' : ''}`}
          >
            <div className={`px-4 py-3 flex items-center gap-3 ${today ? 'jipd-gradient' : 'bg-brand-paper/70'}`}>
              <div className="min-w-0 flex-1">
                <p className={`headline text-base leading-none ${today ? 'text-white' : 'text-brand-navy'}`}>
                  Dia {day.day}
                </p>
                <p className={`text-xs mt-1 ${today ? 'text-white/80' : 'text-brand-steel'}`}>
                  {dayLabel(day.date)} · {EVENT_HOURS.start} às {EVENT_HOURS.end}
                </p>
              </div>
              <span
                className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                  today
                    ? 'bg-white/20 text-white'
                    : day.venue === 'unibra'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-brand/10 text-brand'
                }`}
              >
                {venue.short}
              </span>
              {today && (
                <span className="shrink-0 text-[10px] font-bold uppercase bg-white text-brand px-2 py-1 rounded-full">
                  Hoje
                </span>
              )}
            </div>

            <div className="divide-y divide-brand-paper">
              {day.spaces.map((row) => (
                <div key={row.space} className="flex items-stretch gap-2 px-3 py-2">
                  <span className="w-24 shrink-0 flex items-center text-[11px] font-bold text-brand-steel uppercase leading-tight">
                    {row.space}
                  </span>
                  <div className="flex-1 min-w-0 flex flex-wrap gap-1.5">
                    {row.slots.map((slot, i) => (
                      <span
                        key={`${slot.name}-${i}`}
                        className="inline-flex items-center gap-1.5 bg-brand-paper/80 border border-brand-mist/30 rounded-lg px-2.5 py-1.5 text-xs font-bold text-brand-deep"
                      >
                        {slot.name}
                        {slot.category && (
                          <span className="text-[9px] font-extrabold uppercase tracking-wide text-brand-steel bg-white rounded px-1 py-0.5">
                            {CATEGORY[slot.category].short}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
