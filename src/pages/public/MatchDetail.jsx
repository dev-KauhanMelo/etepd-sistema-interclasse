import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import PalpiteWidget from '../../components/bolao/PalpiteWidget'
import { getFanProfile } from '../../utils/fanProfile'
import TeamCrest from '../../components/match/TeamCrest'
import ScoreBoard from '../../components/match/ScoreBoard'
import CheerButtons from '../../components/match/CheerButtons'
import Loader from '../../components/common/Loader'
import { ArrowLeftIcon } from '../../components/common/Icons'
import { useNavigate } from 'react-router-dom'
import { useMatch } from '../../hooks/useMatch'
import { useModalities } from '../../hooks/useModalities'
import { matchDateTime } from '../../utils/formatDate'
import { PHASE_LABELS } from '../../utils/constants'
import { MATCH_STATUS } from '../../utils/constants'

// Detalhe do jogo (Modo Arena): hero full-bleed nas cores das duas turmas,
// placar Anton gigante, torcida, palpite e períodos.
export default function MatchDetail() {
  const { id } = useParams()
  const { match, loading } = useMatch(id)
  const { modalities } = useModalities()
  const [profile] = useState(getFanProfile())
  const navigate = useNavigate()

  if (loading) return <Loader />
  if (!match) {
    return (
      <div className="p-4 text-arena-muted">
        Jogo não encontrado. <Link to="/placar" className="text-gold font-bold">Voltar</Link>
      </div>
    )
  }

  const isLive = match.status === 'live'
  const finished = match.status === 'finished'
  const modName = modalities.find((m) => m.id === match.modalityId)?.name || ''
  const a = match.teamA?.color || '#DC2626'
  const b = match.teamB?.color || '#2563EB'
  const statusLabel = isLive
    ? `Ao vivo${match.currentPeriod ? ` · ${match.currentPeriod}º tempo` : ''}`
    : (MATCH_STATUS[match.status]?.label || 'Agendado')

  return (
    <div className="pb-4">
      {/* Hero arena full-bleed */}
      <div
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(104deg, ${a} 0%, ${a} 46%, ${b} 54%, ${b} 100%)` }}
      >
        <div className="absolute inset-0 arena-mesh" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,15,25,0.35),rgba(11,15,25,0.92))]" />
        <div className="relative px-4 pt-3.5 pb-5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
              aria-label="Voltar"
              className="p-1 text-gold active:scale-90 transition"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <span
              className={`inline-flex items-center gap-1.5 font-bracket font-bold text-[11px] tracking-[0.1em] px-3 py-[3px] uppercase text-white [clip-path:polygon(8px_0,calc(100%-8px)_0,100%_50%,calc(100%-8px)_100%,8px_100%,0_50%)] ${
                isLive ? 'bg-live' : finished ? 'bg-arena-panel' : 'bg-brand'
              }`}
            >
              {isLive && <span className="w-1.5 h-1.5 rounded-full bg-white pulse-live" />}
              {statusLabel}
            </span>
            <span className="w-6" aria-hidden="true" />
          </div>

          <p className="text-center font-bracket font-bold text-[11px] tracking-[0.24em] text-white/75 uppercase mt-3">
            {PHASE_LABELS[match.phase] || match.roundLabel || 'Partida'} · {modName} · {match.location}
          </p>

          <div className="flex items-center justify-center gap-4 mt-3.5">
            <HeroSide team={match.teamA} />
            <div className="flex items-baseline gap-3">
              <span className="font-jersey text-[76px] leading-none text-white">{match.scoreA ?? 0}</span>
              <span className="font-bracket-display text-[26px] text-gold">×</span>
              <span className="font-jersey text-[76px] leading-none text-white">{match.scoreB ?? 0}</span>
            </div>
            <HeroSide team={match.teamB} />
          </div>

          <p className="text-center font-bracket font-semibold text-xs text-white/60 mt-3 uppercase tracking-wide">
            {matchDateTime(match)}
          </p>
        </div>
      </div>

      <div className="px-4">
        {/* Torcida */}
        <SectionTitle className="mt-4">Torcida</SectionTitle>
        <CheerButtons match={match} />

        {/* Bolão do jogo */}
        {['scheduled', 'live', 'finished'].includes(match.status) && (
          <>
            <SectionTitle className="mt-5">Bolão JIPD</SectionTitle>
            <div className="cut-corner bg-arena-panel border border-white/[0.07] p-4">
              <PalpiteWidget match={match} profile={profile} />
            </div>
          </>
        )}

        {/* Placar de mesa como "carimbo" do resultado — só nos encerrados */}
        {finished && (
          <>
            <SectionTitle className="mt-5">Resultado oficial</SectionTitle>
            <div className="cut-corner bg-arena-panel border border-white/[0.07] p-4 flex justify-center">
              <ScoreBoard scoreA={match.scoreA} scoreB={match.scoreB} />
            </div>
          </>
        )}

        {/* Por período */}
        {match.periodScores?.length > 0 && (
          <>
            <SectionTitle className="mt-5">Por período</SectionTitle>
            <div className="flex flex-col gap-1.5">
              {match.periodScores.map((p, i) => {
                const current = isLive && p.period === match.currentPeriod
                return (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-arena-panel border border-white/[0.06] px-3.5 py-[9px]"
                  >
                    <span className="font-bracket font-semibold text-[13px] text-arena-muted uppercase tracking-wide">
                      {p.period}º tempo
                    </span>
                    <span className={`font-bracket-display text-[15px] ${current ? 'text-gold' : 'text-white'}`}>
                      {p.scoreA} × {p.scoreB}
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Avisos da partida */}
        {match.matchNotes?.length > 0 && (
          <>
            <SectionTitle className="mt-5">Avisos da partida</SectionTitle>
            <div className="cut-corner bg-arena-panel border border-gold/25 p-4">
              {match.matchNotes.slice().reverse().map((n, i) => (
                <p key={i} className="text-sm text-arena-muted py-1 leading-snug">• {n}</p>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function HeroSide({ team }) {
  return (
    <div className="flex flex-col items-center gap-2 w-[90px] min-w-0">
      <TeamCrest team={team} size="lg" />
      <p className="font-bracket font-bold text-sm text-white tracking-[0.06em] truncate max-w-full">
        {team?.name || '-'}
      </p>
    </div>
  )
}

function SectionTitle({ children, className = '' }) {
  return (
    <h2 className={`flex items-center gap-2.5 mb-2.5 ${className}`}>
      <span className="section-slash !h-4" aria-hidden="true" />
      <span className="font-bracket-display text-[15px] text-white tracking-[0.05em] uppercase">{children}</span>
    </h2>
  )
}
