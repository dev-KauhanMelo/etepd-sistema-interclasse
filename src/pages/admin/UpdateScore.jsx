import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useMatch } from '../../hooks/useMatch'
import { useModalities } from '../../hooks/useModalities'
import { useAuth } from '../../context/AuthContext'
import { adjustScore, addMatchNote, updateMatch } from '../../services/matchesService'
import { advanceWinnerInBracket } from '../../services/bracketsService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import TeamCrest from '../../components/match/TeamCrest'
import { scoringOf } from '../../utils/scoring'
import { TrophyIcon } from '../../components/common/Icons'

// Tela que o juiz usa durante o jogo. Feita para ser óbvia às 8h da manhã,
// por alguém que nunca viu o sistema:
//
//   1. COMEÇAR JOGO   2. (marcar, se a modalidade tiver placar)   3. ENCERRAR
//
// O que a modalidade pede muda a tela: Call of Duty e Wild Rift não mostram
// placar nenhum, porque "3 a 0" não significa nada nesses jogos — só importa
// quem passou. Ao encerrar, o vencedor entra sozinho na próxima chave.
export default function UpdateScore() {
  const { id } = useParams()
  const { match, loading } = useMatch(id)
  const { modalities } = useModalities()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [note, setNote] = useState('')
  const [encerrando, setEncerrando] = useState(false)
  const [aviso, setAviso] = useState(null)

  if (loading || !match) return <p className="text-sm text-slate-400">Carregando...</p>

  const modName = modalities.find((m) => m.id === match.modalityId)?.name || ''
  const scoring = scoringOf(modName)
  const mostraPlacar = scoring.tipo === 'placar' || scoring.tipo === 'sets'

  const live = match.status === 'live'
  const finished = match.status === 'finished'

  const comecar = () => updateMatch(match.id, { status: 'live' }, user?.uid)

  // Encerra e, se houver chaveamento, já passa o vencedor para a próxima fase
  const encerrar = async (side) => {
    const vencedor = side === 'A' ? match.teamA?.name : match.teamB?.name
    if (!confirm(`Encerrar o jogo com ${vencedor} como vencedor?`)) return
    setEncerrando(true)
    setAviso(null)
    try {
      await updateMatch(match.id, { status: 'finished', winnerSide: side }, user?.uid)
      const r = await advanceWinnerInBracket(match.modalityId, match, side)
      setAviso(
        r.ok
          ? { tipo: 'ok', texto: `${vencedor} venceu. Já avançou no chaveamento.` }
          : { tipo: 'info', texto: `${vencedor} venceu. Esta modalidade não tem chaveamento montado — nada mais a fazer.` }
      )
    } catch (e) {
      console.error(e)
      setAviso({ tipo: 'erro', texto: 'Não deu pra salvar. Confere a internet e tenta de novo.' })
    } finally {
      setEncerrando(false)
    }
  }

  const reabrir = () => updateMatch(match.id, { status: 'live', winnerSide: null }, user?.uid)

  return (
    <div className="pb-8">
      <button onClick={() => navigate('/admin/jogos')} className="text-sm text-slate-500 mb-3">← Voltar para os jogos</button>

      {/* Quem joga, onde e como se marca */}
      <Card className="mb-4">
        <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">
          {modName} · {match.location}
        </p>
        <div className="flex items-center justify-around mt-4">
          <TeamFace team={match.teamA} winner={match.winnerSide === 'A'} />
          <span className="text-slate-300 font-bold text-xl">×</span>
          <TeamFace team={match.teamB} winner={match.winnerSide === 'B'} />
        </div>
        {!mostraPlacar && (
          <p className="text-center text-xs text-slate-400 mt-4">
            {scoring.tipo === 'nenhum'
              ? 'Esta modalidade não é decidida em confronto direto — lance os resultados na aba Classificação.'
              : 'Nesta modalidade não se marca placar: no fim, escolha quem passou.'}
          </p>
        )}
      </Card>

      {/* PASSO 1 */}
      {!live && !finished && (
        <button
          onClick={comecar}
          className="w-full rounded-2xl bg-brand text-white py-5 text-lg font-bold shadow-card active:scale-[0.98] transition mb-4"
        >
          COMEÇAR JOGO
        </button>
      )}

      {/* PASSO 2 — só quem tem placar */}
      {live && mostraPlacar && (
        <Card className="mb-4">
          <p className="text-sm font-semibold mb-1">
            {scoring.tipo === 'sets' ? `${scoring.unidade} ganhas` : `Marcar ${scoring.unidade}`}
          </p>
          <p className="text-xs text-slate-400 mb-3">Toque no + de quem marcou.</p>
          <div className="flex items-center justify-around">
            <ScoreControl team={match.teamA} score={match.scoreA} onAdjust={(d) => adjustScore(match, 'A', d, user?.uid)} />
            <span className="text-slate-300 font-bold text-2xl">×</span>
            <ScoreControl team={match.teamB} score={match.scoreB} onAdjust={(d) => adjustScore(match, 'B', d, user?.uid)} />
          </div>
        </Card>
      )}

      {/* PASSO 3 */}
      {live && (
        <Card className="mb-4">
          <p className="text-sm font-semibold mb-1">Encerrar o jogo</p>
          <p className="text-xs text-slate-400 mb-3">Toque na turma que <strong>venceu</strong>. O vencedor avança sozinho no chaveamento.</p>
          <div className="grid grid-cols-2 gap-3">
            <WinnerButton team={match.teamA} disabled={encerrando} onClick={() => encerrar('A')} />
            <WinnerButton team={match.teamB} disabled={encerrando} onClick={() => encerrar('B')} />
          </div>
        </Card>
      )}

      {finished && (
        <Card className="mb-4 border-2 border-emerald-500/40 bg-emerald-50/60">
          <p className="text-sm font-bold text-emerald-800">
            Jogo encerrado{match.winnerSide ? ` — venceu ${match.winnerSide === 'A' ? match.teamA?.name : match.teamB?.name}` : ''}
          </p>
          <button onClick={reabrir} className="text-xs text-slate-500 underline mt-2">
            Marquei errado, reabrir o jogo
          </button>
        </Card>
      )}

      {aviso && (
        <Card className={`mb-4 text-sm ${aviso.tipo === 'erro' ? 'text-red-600' : 'text-slate-600'}`}>
          {aviso.texto}
        </Card>
      )}

      {/* Aviso da partida — opcional, fica por último de propósito */}
      <Card>
        <p className="text-sm font-semibold mb-1">Aviso rápido (opcional)</p>
        <p className="text-xs text-slate-400 mb-2">Aparece na tela do jogo pros alunos.</p>
        <div className="flex gap-2">
          <input
            value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Ex.: atraso de 10 minutos"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <Button onClick={async () => { if (note) { await addMatchNote(match, note, user?.uid); setNote('') } }}>
            Enviar
          </Button>
        </div>
        {match.matchNotes?.slice().reverse().map((n, i) => (
          <p key={i} className="text-sm text-slate-500 mt-2">• {n}</p>
        ))}
      </Card>
    </div>
  )
}

function TeamFace({ team, winner }) {
  return (
    <div className="text-center">
      <TeamCrest team={team} size="lg" />
      <p className={`text-sm font-bold mt-2 inline-flex items-center gap-1 ${winner ? 'text-emerald-700' : 'text-slate-700'}`}>
        {team?.name}
        {winner && <TrophyIcon className="w-4 h-4" />}
      </p>
    </div>
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
      <p className="text-5xl font-black mb-3" style={{ color: team?.color }}>{score ?? 0}</p>
      <div className="flex gap-2 justify-center">
        <button onClick={() => onAdjust(-1)} className="w-14 h-14 rounded-full bg-slate-100 text-xl font-bold active:scale-90 transition">−</button>
        <button onClick={() => onAdjust(1)} className="w-16 h-16 rounded-full bg-brand text-white text-2xl font-bold shadow-md active:scale-90 transition">+</button>
      </div>
    </div>
  )
}
