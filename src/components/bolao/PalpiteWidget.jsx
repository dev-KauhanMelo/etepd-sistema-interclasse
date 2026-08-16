import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SoccerBallIcon, CheckCircleIcon, FireIcon } from '../common/Icons'
import { usePredictions } from '../../hooks/usePredictions'
import { submitPrediction } from '../../services/predictionsService'
import { crowdSplit, predictionPoints, POINTS_EXACT } from '../../utils/bolao'

// O coração do Bolão. Muda de cara conforme o momento do jogo:
//  - agendado: dá pra cravar o placar
//  - ao vivo / encerrado: mostra a torcida e o resultado do seu palpite
export default function PalpiteWidget({ match, profile }) {
  const { predictions } = usePredictions(match.id)
  const [scoreA, setScoreA] = useState(0)
  const [scoreB, setScoreB] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const mine = profile ? predictions.find((p) => p.userId === profile.id) : null
  const crowd = crowdSplit(predictions)

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      await submitPrediction(match, profile, scoreA, scoreB)
    } catch {
      setError('Não deu pra salvar. O jogo pode já ter começado!')
    }
    setSaving(false)
  }

  if (match.status === 'scheduled') {
    if (!profile) {
      return (
        <Link to="/bolao" className="flex items-center justify-center gap-2 text-sm bg-white/5 border border-dashed border-gold/40 text-gold font-bracket font-bold px-3 py-3 cut-corner-sm">
          <SoccerBallIcon className="w-4 h-4" />
          Entre no Bolão pra dar seu palpite neste jogo →
        </Link>
      )
    }
    if (mine) {
      return (
        <div>
          <p className="flex items-center justify-center gap-1.5 text-sm font-bold text-white bg-white/5 border border-gold/25 px-3 py-2.5 cut-corner-sm">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
            Seu palpite: <span className="score-number">{mine.scoreA} × {mine.scoreB}</span>
          </p>
          <CrowdBar match={match} crowd={crowd} />
        </div>
      )
    }
    return (
      <div>
        <div className="grid grid-cols-[1fr_48px_1fr] items-center mt-3">
          <Stepper value={scoreA} onChange={setScoreA} />
          <span aria-hidden="true" />
          <Stepper value={scoreB} onChange={setScoreB} />
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="w-full mt-4 cut-corner-sm bg-gold py-3 font-varsity text-[15px] text-brand-ink tracking-[0.06em] active:scale-[0.98] transition disabled:opacity-60"
        >
          {saving ? 'CRAVANDO…' : 'CRAVAR PALPITE →'}
        </button>
        {error && <p className="text-xs text-red-500 text-center mt-2">{error}</p>}
        <p className="text-center font-body font-medium text-xs text-arena-dim mt-2.5">
          Placar exato vale {POINTS_EXACT} pts · vencedor certo vale 2 pts
        </p>
      </div>
    )
  }

  // Jogo rolando ou encerrado
  const pts = mine && match.status === 'finished' ? predictionPoints(mine, match) : null

  return (
    <div>
      {mine && (
        <p className="text-center text-sm font-bold text-white mb-1">
          Seu palpite: <span className="score-number">{mine.scoreA} × {mine.scoreB}</span>
          {pts !== null && (
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${pts > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-white/10 text-arena-muted'}`}>
              {pts === POINTS_EXACT ? `CRAVOU! +${pts} pts` : pts > 0 ? `+${pts} pts` : 'errou :('}
            </span>
          )}
        </p>
      )}
      <CrowdBar match={match} crowd={crowd} />
    </div>
  )
}

function Stepper({ value, onChange }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <StepBtn onClick={() => onChange(Math.max(0, value - 1))} aria-label="Menos um">−</StepBtn>
      <span className="font-jersey text-[28px] leading-none text-white min-w-[22px] text-center">{value}</span>
      <StepBtn onClick={() => onChange(Math.min(99, value + 1))} primary aria-label="Mais um">+</StepBtn>
    </div>
  )
}

// O "+" é o botão dominante: é o que a pessoa aperta o tempo todo.
function StepBtn({ children, onClick, primary = false, ...rest }) {
  return (
    <button
      type="button"
      onClick={onClick}
      {...rest}
      className={`w-[34px] h-[34px] cut-corner-sm flex items-center justify-center font-bracket font-bold text-lg leading-none active:scale-90 transition border ${
        primary
          ? 'bg-gold/10 border-gold/45 text-gold'
          : 'bg-white/[0.06] border-white/[0.16] text-arena-text'
      }`}
    >
      {children}
    </button>
  )
}

function CrowdBar({ match, crowd }) {
  if (crowd.total === 0) return null
  return (
    <div className="mt-3">
      <div className="flex justify-between text-[10px] font-bold text-arena-muted mb-1 font-bracket tracking-wide">
        <span>{match.teamA?.name} {crowd.a}%</span>
        {crowd.draw > 0 && <span>Empate {crowd.draw}%</span>}
        <span>{crowd.b}% {match.teamB?.name}</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-white/10">
        <div style={{ width: `${crowd.a}%`, backgroundColor: match.teamA?.color || '#0552CB' }} />
        <div style={{ width: `${crowd.draw}%` }} className="bg-white/25" />
        <div style={{ width: `${crowd.b}%`, backgroundColor: match.teamB?.color || '#182750' }} />
      </div>
      <p className="text-[10px] text-arena-muted text-center mt-1 inline-flex items-center gap-1 w-full justify-center font-bracket font-semibold">
        <FireIcon className="w-3 h-3 text-amber-500" />
        {crowd.total} {crowd.total === 1 ? 'palpite' : 'palpites'} da torcida
      </p>
    </div>
  )
}
