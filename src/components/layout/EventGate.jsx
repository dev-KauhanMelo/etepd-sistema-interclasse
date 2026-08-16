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

// Fundo do Modo Arena: quase-preto com foco de luz azul no alto — o "refletor"
// da arena. A logo usa a versão branca (knockout), que lê 15:1 aqui.
const arenaStage =
  'relative min-h-screen overflow-hidden bg-arena-bg arena-mesh ' +
  'bg-[radial-gradient(circle_at_50%_30%,#16244a_0%,#0B0F19_70%)]'

function SplashScreen() {
  return (
    <div className={`${arenaStage} flex flex-col items-center justify-center`}>
      <img
        src="/jipd-logo-white.png"
        alt="JIPD 2026 — Jogos Internos Porto Digital"
        className="relative z-10 w-52 animate-pop-in"
      />
      <p className="relative z-10 mt-6 font-bracket font-bold text-[11px] tracking-[0.24em] text-arena-muted uppercase">
        Jogos Internos 2026
      </p>

      {/* Barra de progresso na base da tela, trilho dourado full-width */}
      <div
        className="splash-bar absolute bottom-0 left-0 right-0 h-1"
        role="progressbar"
        aria-label="Carregando"
      >
        <i />
      </div>
    </div>
  )
}

function GateScreen({ start, end }) {
  return (
    <div className={`${arenaStage} flex flex-col items-center justify-center px-6 text-center`}>
      <div className="relative z-10 animate-pop-in flex flex-col items-center">
        <span className="font-bracket font-bold text-[11px] tracking-[0.3em] text-accent uppercase">
          ETE Porto Digital
        </span>
        <img
          src="/jipd-logo-white.png"
          alt="JIPD 2026 — Jogos Internos Porto Digital"
          className="w-56 mt-5"
        />
        <h1 className="font-bracket-display text-[44px] leading-none text-white mt-6 tracking-wide -skew-x-6">
          OS JOGOS VÊM AÍ
        </h1>
        <p className="font-bracket font-semibold text-sm text-arena-muted mt-2 tracking-[0.08em] uppercase">
          {formatShortDate(start)} — {end ? formatShortDate(end) : ''} · ETE PD + UNIBRA
        </p>
        <Countdown target={start} />
        <p className="mt-10 text-arena-muted text-xs inline-flex items-center gap-1.5 font-bracket font-semibold tracking-wide">
          Volte no dia dos jogos!
          <FireIcon className="w-3.5 h-3.5 text-gold" />
        </p>
      </div>
      <div className="splash-bar absolute bottom-0 left-0 right-0 h-1" aria-hidden="true"><i /></div>
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
    <div className="mt-7 flex gap-2.5">
      {[[d, 'dias'], [h, 'horas'], [m, 'min'], [s, 'seg']].map(([value, label], i) => (
        <div
          key={label}
          className="cut-corner-sm bg-white/5 border border-gold/25 px-2 py-2.5 min-w-[70px] text-center"
        >
          {/* Segundos em branco: o olho acompanha o movimento sem o dourado piscar */}
          <p className={`font-bracket-display text-[34px] leading-none ${i === 3 ? 'text-white' : 'text-gold'}`}>
            {String(value).padStart(2, '0')}
          </p>
          <p className="font-bracket font-bold text-[10px] uppercase tracking-[0.2em] text-arena-muted mt-1">
            {label}
          </p>
        </div>
      ))}
    </div>
  )
}
