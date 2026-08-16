import { useState } from 'react'
import { FireIcon } from '../common/Icons'
import { cheerFor } from '../../services/matchesService'

// Botão de torcida: um toque por dispositivo por jogo (localStorage).
// Incremento otimista — o contador sobe na hora e o Firestore confirma atrás.
export default function CheerButtons({ match }) {
  const storageKey = `cheer_${match.id}`
  const [chosen, setChosen] = useState(() => localStorage.getItem(storageKey))
  const [bump, setBump] = useState({ A: 0, B: 0 })

  const countA = (match.cheerCountA || 0) + bump.A
  const countB = (match.cheerCountB || 0) + bump.B
  const total = countA + countB
  const pctA = total > 0 ? Math.round((countA / total) * 100) : 50

  async function cheer(side) {
    if (chosen) return
    setChosen(side)
    localStorage.setItem(storageKey, side)
    setBump((b) => ({ ...b, [side]: b[side] + 1 }))
    try {
      await cheerFor(match.id, side)
    } catch {
      // Falhou (offline?): desfaz o otimismo e devolve o voto
      setBump((b) => ({ ...b, [side]: b[side] - 1 }))
      setChosen(null)
      localStorage.removeItem(storageKey)
    }
  }

  return (
    <div>
      <div className="flex gap-2.5">
        <CheerSide
          team={match.teamA}
          count={countA}
          onClick={() => cheer('A')}
          picked={chosen === 'A'}
          disabled={!!chosen}
        />
        <CheerSide
          team={match.teamB}
          count={countB}
          onClick={() => cheer('B')}
          picked={chosen === 'B'}
          disabled={!!chosen}
        />
      </div>
      {total > 0 && (
        <div
          className="flex h-1.5 mt-3 rounded-full overflow-hidden bg-white/10"
          role="img"
          aria-label={`Torcida: ${pctA}% para ${match.teamA?.name}, ${100 - pctA}% para ${match.teamB?.name}`}
        >
          <span style={{ width: `${pctA}%`, backgroundColor: match.teamA?.color || '#5A6C8C' }} />
          <span style={{ width: `${100 - pctA}%`, backgroundColor: match.teamB?.color || '#5A6C8C' }} />
        </div>
      )}
    </div>
  )
}

function CheerSide({ team, count, onClick, picked, disabled }) {
  const color = team?.color || '#5A6C8C'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={picked}
      className={`cut-corner-sm flex-1 flex items-center justify-center gap-2 py-[11px] font-bracket font-bold text-sm tracking-[0.08em] text-white uppercase transition active:scale-95 disabled:active:scale-100 ${
        picked ? 'ring-1 ring-gold' : ''
      } ${disabled && !picked ? 'opacity-50' : ''}`}
      style={{ border: `1.5px solid ${color}`, background: `${color}24` }}
    >
      <FireIcon className="w-4 h-4 text-gold" />
      <span className="truncate">
        {picked ? 'Torcendo!' : `Torcer ${team?.name}`} · {count}
      </span>
    </button>
  )
}
