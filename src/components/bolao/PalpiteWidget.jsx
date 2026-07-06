import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../common/Button'
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
        <Link to="/bolao" className="block text-center text-sm bg-brand/5 border border-dashed border-brand/40 text-brand font-semibold rounded-xl px-3 py-3">
          🎯 Entre no Bolão pra dar seu palpite neste jogo →
        </Link>
      )
    }
    if (mine) {
      return (
        <div>
          <p className="text-center text-sm font-bold text-brand-deep bg-brand/5 border border-brand/20 rounded-xl px-3 py-2.5">
            ✅ Seu palpite: <span className="score-number">{mine.scoreA} × {mine.scoreB}</span>
          </p>
          <CrowdBar match={match} crowd={crowd} />
        </div>
      )
    }
    return (
      <div>
        <div className="flex items-center justify-center gap-3">
          <Stepper value={scoreA} onChange={setScoreA} label={match.teamA?.name} />
          <span className="text-brand-mist font-bold">×</span>
          <Stepper value={scoreB} onChange={setScoreB} label={match.teamB?.name} />
        </div>
        <Button onClick={save} disabled={saving} className="w-full mt-3 text-sm py-2">
          {saving ? 'Cravando...' : 'Cravar palpite 🎯'}
        </Button>
        {error && <p className="text-xs text-red-500 text-center mt-2">{error}</p>}
        <p className="text-[10px] text-brand-steel text-center mt-2">
          Placar exato vale {POINTS_EXACT} pts · vencedor certo vale 2 pts. Fecha quando a bola rola!
        </p>
      </div>
    )
  }

  // Jogo rolando ou encerrado
  const pts = mine && match.status === 'finished' ? predictionPoints(mine, match) : null

  return (
    <div>
      {mine && (
        <p className="text-center text-sm font-bold text-brand-deep mb-1">
          Seu palpite: <span className="score-number">{mine.scoreA} × {mine.scoreB}</span>
          {pts !== null && (
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${pts > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-paper text-brand-steel'}`}>
              {pts === POINTS_EXACT ? `CRAVOU! +${pts} pts` : pts > 0 ? `+${pts} pts` : 'errou :('}
            </span>
          )}
        </p>
      )}
      <CrowdBar match={match} crowd={crowd} />
    </div>
  )
}

function Stepper({ value, onChange, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-bold text-brand-steel uppercase truncate max-w-[80px]">{label || '-'}</span>
      <div className="flex items-center gap-1.5">
        <StepBtn onClick={() => onChange(Math.max(0, value - 1))}>−</StepBtn>
        <span className="score-number text-2xl text-brand-navy w-8 text-center">{value}</span>
        <StepBtn onClick={() => onChange(Math.min(99, value + 1))}>+</StepBtn>
      </div>
    </div>
  )
}

function StepBtn({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-8 h-8 rounded-full bg-brand-paper border border-brand-mist/50 text-brand-deep font-bold text-lg leading-none active:scale-90 transition"
    >
      {children}
    </button>
  )
}

function CrowdBar({ match, crowd }) {
  if (crowd.total === 0) return null
  return (
    <div className="mt-3">
      <div className="flex justify-between text-[10px] font-bold text-brand-steel mb-1">
        <span>{match.teamA?.name} {crowd.a}%</span>
        {crowd.draw > 0 && <span>Empate {crowd.draw}%</span>}
        <span>{crowd.b}% {match.teamB?.name}</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-brand-paper">
        <div style={{ width: `${crowd.a}%`, backgroundColor: match.teamA?.color || '#0552CB' }} />
        <div style={{ width: `${crowd.draw}%` }} className="bg-brand-mist/60" />
        <div style={{ width: `${crowd.b}%`, backgroundColor: match.teamB?.color || '#182750' }} />
      </div>
      <p className="text-[10px] text-brand-steel text-center mt-1">🔥 {crowd.total} {crowd.total === 1 ? 'palpite' : 'palpites'} da torcida</p>
    </div>
  )
}
