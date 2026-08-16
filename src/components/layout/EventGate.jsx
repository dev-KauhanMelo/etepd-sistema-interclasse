import { useEffect, useState } from 'react'
import { FireIcon } from '../common/Icons'
import { useEventSettings } from '../../hooks/useEventSettings'
import { useAuth } from '../../context/AuthContext'
import { formatShortDate } from '../../utils/formatDate'

// A "tela-bloqueio" sugerida pela professora: se o estudante acessar
// antes do período dos jogos, vê a logo do JIPD + as datas + contagem
// regressiva, em vez das páginas do site. Admins passam direto.
export default function EventGate({ children }) {
  const { settings, loading } = useEventSettings()
  const { isAdmin } = useAuth()

  const startDate = settings?.startAt?.toDate ? settings.startAt.toDate() : null
  const gateActive = !isAdmin && startDate && Date.now() < startDate.getTime()

  if (loading) return <SplashScreen />
  if (gateActive) return <GateScreen start={startDate} end={settings?.endAt} />
  return children
}

function SplashScreen() {
  return (
    <div className="splash-stage relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="logo-plate splash-plate relative z-10 px-8 py-6">
        <img src="/jipd-logo.png" alt="JIPD 2026 — Jogos Internos Porto Digital" className="w-44 block" />
      </div>

      {/* Indicador de que algo está acontecendo — antes não havia nenhum */}
      <div className="splash-bar relative z-10 mt-8 w-32 h-[3px]" role="progressbar" aria-label="Carregando">
        <i />
      </div>
      <p className="relative z-10 mt-4 font-bracket font-bold text-[11px] tracking-[0.24em] text-white/65 uppercase">
        Jogos Internos 2026
      </p>
    </div>
  )
}

function GateScreen({ start, end }) {
  return (
    <div className="min-h-screen jipd-hero flex flex-col items-center justify-center px-6 text-center">
      <div className="animate-pop-in flex flex-col items-center">
        <span className="logo-plate inline-flex px-6 py-4">
          <img src="/jipd-logo.png" alt="JIPD 2026 — Jogos Internos Porto Digital" className="w-48 block" />
        </span>
        <p className="mt-8 text-brand-mist text-sm font-medium uppercase tracking-widest">Os jogos vêm aí</p>
        <p className="mt-2 text-white font-display font-extrabold text-2xl">
          Jogos de {formatShortDate(start)}{end ? ` a ${formatShortDate(end)}` : ''}
        </p>
        <Countdown target={start} />
        <p className="mt-10 text-brand-mist/70 text-xs inline-flex items-center gap-1.5">
          ETE Porto Digital · Volte no dia dos jogos!
          <FireIcon className="w-3.5 h-3.5 text-amber-400" />
        </p>
      </div>
    </div>
  )
}

function Countdown({ target }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const diff = Math.max(0, target.getTime() - now)
  const d = Math.floor(diff / 86400000)
  const h = Math.floor(diff / 3600000) % 24
  const m = Math.floor(diff / 60000) % 60
  const s = Math.floor(diff / 1000) % 60

  return (
    <div className="mt-6 flex gap-3">
      {[[d, 'dias'], [h, 'horas'], [m, 'min'], [s, 'seg']].map(([value, label]) => (
        <div key={label} className="bg-white/10 border border-white/15 rounded-2xl px-3 py-2 min-w-[64px]">
          <p className="score-number text-3xl text-white">{String(value).padStart(2, '0')}</p>
          <p className="text-[10px] uppercase tracking-wider text-brand-mist mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  )
}
