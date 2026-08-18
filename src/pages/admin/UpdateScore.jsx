import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useMatch } from '../../hooks/useMatch'
import { useModalities } from '../../hooks/useModalities'
import { useAuth } from '../../context/AuthContext'
import { addMatchNote, updateMatch } from '../../services/matchesService'
import { advanceWinnerInBracket } from '../../services/bracketsService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import MatchStatusBadge from '../../components/match/MatchStatusBadge'
import { scoringOf } from '../../utils/scoring'
import { usePendingScore } from '../../hooks/usePendingScore'

// Tela do juiz. A partida tem um ciclo — começa, roda, acaba — e a tela mostra
// só o que faz sentido em cada ponto dele: antes de começar não há placar pra
// marcar, e depois de encerrar não há o que pausar. Os desvios (pausar, adiar,
// suspender, cancelar) ficam sempre à mão, mas discretos, porque são exceção.
//
// Finalizar sempre pergunta quem venceu, mesmo com o placar na tela: é o único
// dado que o chaveamento consome, e uma pergunta a mais custa menos que uma
// chave errada. Escolhido o vencedor, ele avança sozinho até a final.
export default function UpdateScore() {
  const { id } = useParams()
  const { match, loading } = useMatch(id)
  const { modalities } = useModalities()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [note, setNote] = useState('')
  const [aviso, setAviso] = useState(null)
  const [encerrando, setEncerrando] = useState(false)

  // Toques no +/- viram UMA gravação (ver hooks/usePendingScore)
  const { placar, ajustar, salvando, gravarAgora } = usePendingScore(
    match,
    (campos) => updateMatch(match.id, campos, user?.uid)
  )

  if (loading || !match) return <p className="text-sm text-slate-400">Carregando...</p>

  const modName = modalities.find((m) => m.id === match.modalityId)?.name || ''
  const scoring = scoringOf(modName)
  const mostraPlacar = scoring.tipo === 'placar' || scoring.tipo === 'sets'

  const status = match.status
  const emJogo = status === 'live' || status === 'paused'
  const acabou = status === 'finished'
  const parado = status === 'suspended' || status === 'cancelled' || status === 'postponed'

  const mudar = (novo) => {
    setAviso(null)
    return updateMatch(match.id, { status: novo }, user?.uid)
  }

  const confirmarE = (pergunta, novo) => () => {
    if (confirm(pergunta)) mudar(novo)
  }

  // Encerra e empurra o vencedor pra próxima chave
  const definirVencedor = async (side) => {
    const nome = side === 'A' ? match.teamA?.name : match.teamB?.name
    setEncerrando(true)
    setAviso(null)
    try {
      gravarAgora()
      await updateMatch(match.id, { status: 'finished', winnerSide: side }, user?.uid)
      const r = await advanceWinnerInBracket(match.modalityId, match, side)
      setAviso({
        erro: false,
        texto: r.ok
          ? `${nome} venceu — já avançou no chaveamento.`
          : `${nome} venceu. Esta modalidade não tem chaveamento montado.`,
      })
    } catch (e) {
      console.error(e)
      setAviso({ erro: true, texto: 'Não deu pra salvar. Confere a internet e tenta de novo.' })
    } finally {
      setEncerrando(false)
    }
  }

  return (
    <div className="pb-8">
      <button onClick={() => navigate('/admin/jogos')} className="text-sm text-slate-400 mb-3">← Voltar</button>

      {/* Quem joga, em que estado está */}
      <Card className="mb-4">
        <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">
          {modName} · {match.location}
        </p>
        <p className="text-center text-lg font-bold text-slate-700 mt-2">
          {match.teamA?.name} × {match.teamB?.name}
        </p>
        <div className="flex justify-center mt-3"><MatchStatusBadge status={status} /></div>
      </Card>

      {/* ANTES DE COMEÇAR */}
      {status === 'scheduled' && (
        <>
          <button
            onClick={() => mudar('live')}
            className="w-full rounded-2xl bg-brand text-white py-5 text-lg font-bold shadow-card active:scale-[0.98] transition"
          >
            COMEÇAR JOGO
          </button>
          <p className="text-center text-xs text-slate-400 mt-2 mb-4">
            A partir daí o jogo aparece como <strong>ao vivo</strong> pra todo mundo.
          </p>
          <SecondaryRow>
            <Secondary onClick={confirmarE('Adiar este jogo?', 'postponed')}>Adiar</Secondary>
            <Secondary danger onClick={confirmarE('Cancelar este jogo?', 'cancelled')}>Cancelar</Secondary>
          </SecondaryRow>
        </>
      )}

      {/* EM JOGO */}
      {emJogo && (
        <>
          {status === 'paused' && (
            <Card className="mb-4 bg-amber-50 border-2 border-amber-300">
              <p className="text-sm font-bold text-amber-900 mb-3">Jogo pausado</p>
              <button
                onClick={() => mudar('live')}
                className="w-full rounded-xl bg-brand text-white py-3 font-bold active:scale-[0.98] transition"
              >
                RETOMAR
              </button>
            </Card>
          )}

          {mostraPlacar ? (
            <Card className="mb-4">
              <p className="text-sm font-semibold mb-1">
                {scoring.tipo === 'sets' ? `${scoring.unidade} ganhas` : `Marcar ${scoring.unidade}`}
              </p>
              <p className="text-xs text-slate-400 mb-3">Toque no + de quem marcou.</p>
              <div className="flex items-center justify-around">
                <ScoreControl team={match.teamA} score={placar('A')} onAdjust={(d) => ajustar('A', d)} />
                <span className="text-slate-300 score-number text-2xl">×</span>
                <ScoreControl team={match.teamB} score={placar('B')} onAdjust={(d) => ajustar('B', d)} />
              </div>
              <p className="text-center text-[11px] text-slate-400 mt-2 h-4">{salvando ? 'salvando…' : ''}</p>
            </Card>
          ) : (
            <Card className="mb-4">
              <p className="text-center text-xs text-slate-400">
                {scoring.tipo === 'nenhum'
                  ? 'Esta modalidade não é decidida em confronto direto — lance os resultados na aba Classificação.'
                  : 'Nesta modalidade não se marca placar: ao finalizar, escolha quem passou.'}
              </p>
            </Card>
          )}

          <NoteBox match={match} note={note} setNote={setNote} uid={user?.uid} />

          {/* Fim do jogo — o passo que importa */}
          <FinishBox match={match} onPick={definirVencedor} disabled={encerrando} />

          <SecondaryRow className="mt-4">
            {status === 'live' && <Secondary onClick={() => mudar('paused')}>Pausar</Secondary>}
            <Secondary onClick={confirmarE('Suspender este jogo?', 'suspended')}>Suspender</Secondary>
            <Secondary danger onClick={confirmarE('Cancelar este jogo?', 'cancelled')}>Cancelar</Secondary>
          </SecondaryRow>
        </>
      )}

      {/* ENCERRADO */}
      {acabou && (
        <>
          <Card className="mb-4 border-2 border-emerald-500/40 bg-emerald-50/60">
            {match.winnerSide ? (
              <>
                <p className="text-sm font-bold text-emerald-800">
                  Venceu {match.winnerSide === 'A' ? match.teamA?.name : match.teamB?.name}
                  {mostraPlacar ? ` · ${placar('A')} × ${placar('B')}` : ''}
                </p>
                <button
                  onClick={() => updateMatch(match.id, { winnerSide: null }, user?.uid)}
                  className="text-xs text-slate-500 underline mt-2"
                >
                  Marquei errado, trocar o vencedor
                </button>
              </>
            ) : (
              <p className="text-sm font-bold text-slate-700">Jogo encerrado — falta dizer quem venceu</p>
            )}
          </Card>

          {!match.winnerSide && (
            <FinishBox match={match} onPick={definirVencedor} disabled={encerrando} aberto />
          )}

          <SecondaryRow className="mt-2">
            <Secondary onClick={() => mudar('live')}>Reabrir o jogo</Secondary>
          </SecondaryRow>
        </>
      )}

      {/* PARADO (suspenso, adiado, cancelado) */}
      {parado && (
        <SecondaryRow className="mb-4">
          <Secondary onClick={() => mudar('scheduled')}>Voltar pra agendado</Secondary>
          <Secondary onClick={() => mudar('live')}>Começar agora</Secondary>
        </SecondaryRow>
      )}

      {aviso && (
        <Card className={`mt-4 text-sm ${aviso.erro ? 'text-red-600' : 'text-slate-600'}`}>{aviso.texto}</Card>
      )}

      {!emJogo && <div className="mt-4"><NoteBox match={match} note={note} setNote={setNote} uid={user?.uid} /></div>}
    </div>
  )
}

// Finalizar em dois toques: o segundo é escolher o vencedor, que é o dado que
// o chaveamento consome. Placar empatado ou modalidade sem placar cai aqui
// igual — por isso a escolha é sempre explícita.
function FinishBox({ match, onPick, disabled, aberto = false }) {
  const [abrindo, setAbrindo] = useState(aberto)

  if (!abrindo) {
    return (
      <button
        onClick={() => setAbrindo(true)}
        className="w-full rounded-2xl bg-emerald-600 text-white py-4 font-bold shadow-card active:scale-[0.98] transition"
      >
        FINALIZAR JOGO
      </button>
    )
  }

  return (
    <Card className="border-2 border-emerald-500/40">
      <p className="text-sm font-semibold mb-1">Quem venceu?</p>
      <p className="text-xs text-slate-400 mb-3">O vencedor avança sozinho no chaveamento.</p>
      <div className="grid grid-cols-2 gap-3">
        <WinnerButton team={match.teamA} disabled={disabled} onClick={() => onPick('A')} />
        <WinnerButton team={match.teamB} disabled={disabled} onClick={() => onPick('B')} />
      </div>
      {!aberto && (
        <button onClick={() => setAbrindo(false)} className="text-xs text-slate-500 underline mt-3">
          Ainda não acabou, voltar
        </button>
      )}
    </Card>
  )
}

function NoteBox({ match, note, setNote, uid }) {
  return (
    <Card className="mb-4">
      <p className="text-sm font-semibold mb-1">Aviso deste jogo</p>
      <p className="text-xs text-slate-400 mb-2">Aparece na tela do jogo pros alunos.</p>
      <div className="flex gap-2">
        <input
          value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="Ex.: atraso de 10 minutos"
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <Button onClick={async () => { if (note) { await addMatchNote(match, note, uid); setNote('') } }}>
          Enviar
        </Button>
      </div>
      {match.matchNotes?.slice().reverse().map((n, i) => (
        <p key={i} className="text-sm text-slate-500 mt-2">• {n}</p>
      ))}
    </Card>
  )
}

// Os desvios do jogo: existem, mas não competem com o botão principal.
function SecondaryRow({ children, className = '' }) {
  return <div className={`flex flex-wrap gap-2 ${className}`}>{children}</div>
}

function Secondary({ children, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 min-w-[96px] rounded-xl border py-2.5 text-xs font-bold transition active:scale-95 ${
        danger ? 'border-red-200 text-red-600 bg-red-50/60' : 'border-slate-200 text-slate-600 bg-white'
      }`}
    >
      {children}
    </button>
  )
}

function WinnerButton({ team, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-2xl border-2 py-4 px-2 font-bold text-sm active:scale-95 transition disabled:opacity-50"
      style={{ borderColor: team?.color || '#cbd5e1', color: '#0E141D' }}
    >
      Venceu<br />
      <span className="text-base">{team?.name}</span>
    </button>
  )
}

function ScoreControl({ team, score, onAdjust }) {
  return (
    <div className="text-center">
      <p className="text-xs font-medium text-slate-500 mb-2">{team?.name}</p>
      <p className="score-number text-5xl mb-3" style={{ color: team?.color }}>{score ?? 0}</p>
      <div className="flex gap-2 justify-center">
        <button onClick={() => onAdjust(-1)} className="w-14 h-14 rounded-full bg-slate-100 text-xl font-bold active:scale-90 transition">−</button>
        <button onClick={() => onAdjust(1)} className="w-16 h-16 rounded-full bg-brand text-white text-2xl font-bold shadow-md active:scale-90 transition">+</button>
      </div>
    </div>
  )
}
