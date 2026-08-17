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
import { MATCH_STATUS } from '../../utils/constants'
import { scoringOf } from '../../utils/scoring'
import { usePendingScore } from '../../hooks/usePendingScore'

const STATUSES = ['scheduled', 'live', 'paused', 'finished', 'suspended', 'cancelled']

// Tela que o juiz usa durante o jogo: placar em cima, status embaixo.
//
// O placar só aparece se a modalidade tiver placar — marcar "3 a 0" num Call of
// Duty não quer dizer nada, e Free Fire e Cubo Mágico nem são turma contra turma
// (ver utils/scoring.js). Ao marcar Encerrado, o vencedor entra sozinho na
// próxima chave: quando o placar decide, é automático; quando não decide
// (empate, ou modalidade sem placar), a tela pergunta quem passou.
export default function UpdateScore() {
  const { id } = useParams()
  const { match, loading } = useMatch(id)
  const { modalities } = useModalities()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [note, setNote] = useState('')
  const [aviso, setAviso] = useState(null)

  // Toques no +/- viram UMA gravação (ver hooks/usePendingScore)
  const { placar, ajustar, salvando, gravarAgora } = usePendingScore(
    match,
    (campos) => updateMatch(match.id, campos, user?.uid)
  )

  if (loading || !match) return <p className="text-sm text-slate-400">Carregando...</p>

  const modName = modalities.find((m) => m.id === match.modalityId)?.name || ''
  const scoring = scoringOf(modName)
  const mostraPlacar = scoring.tipo === 'placar' || scoring.tipo === 'sets'

  // Encerrado sem vencedor definido: precisa perguntar quem passou
  const perguntaVencedor = match.status === 'finished' && !match.winnerSide

  // Marca o vencedor e empurra pro chaveamento
  const definirVencedor = async (side) => {
    const nome = side === 'A' ? match.teamA?.name : match.teamB?.name
    setAviso(null)
    try {
      await updateMatch(match.id, { status: 'finished', winnerSide: side }, user?.uid)
      const r = await advanceWinnerInBracket(match.modalityId, match, side)
      setAviso(
        r.ok
          ? { erro: false, texto: `${nome} venceu — já avançou no chaveamento.` }
          : { erro: false, texto: `${nome} venceu. Esta modalidade não tem chaveamento montado.` }
      )
    } catch (e) {
      console.error(e)
      setAviso({ erro: true, texto: 'Não deu pra salvar. Confere a internet e tenta de novo.' })
    }
  }

  const mudarStatus = async (s) => {
    // Grava o que estava pendente antes de olhar o placar — senão o vencedor
    // sairia de um número desatualizado.
    gravarAgora()
    if (s === 'finished' && mostraPlacar && placar('A') !== placar('B')) {
      return definirVencedor(placar('A') > placar('B') ? 'A' : 'B')
    }
    setAviso(null)
    await updateMatch(match.id, { status: s }, user?.uid)
  }

  return (
    <div className="pb-8">
      <button onClick={() => navigate('/admin/jogos')} className="text-sm text-slate-400 mb-3">← Voltar</button>

      <Card className="mb-4">
        <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          {modName} · {match.location}
        </p>
        {mostraPlacar ? (
          <>
            <div className="flex items-center justify-around">
              <ScoreControl team={match.teamA} score={placar('A')} onAdjust={(d) => ajustar('A', d)} />
              <span className="text-slate-300 score-number text-2xl">×</span>
              <ScoreControl team={match.teamB} score={placar('B')} onAdjust={(d) => ajustar('B', d)} />
            </div>
            <p className="text-center text-[11px] text-slate-400 mt-2 h-4">
              {salvando ? 'salvando…' : ''}
            </p>
            {scoring.tipo === 'sets' && (
              <p className="text-center text-xs text-slate-400 mt-3">
                Marque as {scoring.unidade} que cada lado venceu.
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-center text-lg font-bold text-slate-700">
              {match.teamA?.name} × {match.teamB?.name}
            </p>
            <p className="text-center text-xs text-slate-400 mt-2">
              {scoring.tipo === 'nenhum'
                ? 'Esta modalidade não é decidida em confronto direto — lance os resultados na aba Classificação.'
                : 'Nesta modalidade não se marca placar: ao encerrar, escolha quem passou.'}
            </p>
          </>
        )}
      </Card>

      <Card className="mb-4">
        <p className="text-sm font-semibold mb-2">Status da partida</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => mudarStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${match.status === s ? 'ring-2 ring-brand bg-brand/10' : 'bg-slate-100'}`}
            >
              {MATCH_STATUS[s].label}
            </button>
          ))}
        </div>
        <div className="mt-3"><MatchStatusBadge status={match.status} /></div>
      </Card>

      {/* Só aparece quando o placar não resolve: empate ou modalidade sem placar */}
      {perguntaVencedor && (
        <Card className="mb-4 border-2 border-brand/30">
          <p className="text-sm font-semibold mb-1">Quem venceu?</p>
          <p className="text-xs text-slate-400 mb-3">O vencedor avança sozinho no chaveamento.</p>
          <div className="grid grid-cols-2 gap-3">
            <WinnerButton team={match.teamA} onClick={() => definirVencedor('A')} />
            <WinnerButton team={match.teamB} onClick={() => definirVencedor('B')} />
          </div>
        </Card>
      )}

      {match.status === 'finished' && match.winnerSide && (
        <Card className="mb-4 border-2 border-emerald-500/40 bg-emerald-50/60">
          <p className="text-sm font-bold text-emerald-800">
            Venceu {match.winnerSide === 'A' ? match.teamA?.name : match.teamB?.name}
          </p>
          <button
            onClick={() => updateMatch(match.id, { winnerSide: null }, user?.uid)}
            className="text-xs text-slate-500 underline mt-2"
          >
            Marquei errado, trocar o vencedor
          </button>
        </Card>
      )}

      {aviso && (
        <Card className={`mb-4 text-sm ${aviso.erro ? 'text-red-600' : 'text-slate-600'}`}>
          {aviso.texto}
        </Card>
      )}

      <Card>
        <p className="text-sm font-semibold mb-2">Aviso rápido da partida</p>
        <div className="flex gap-2">
          <input
            value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Ex.: Gol aos 12min"
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

function WinnerButton({ team, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border-2 py-4 px-2 font-bold text-sm active:scale-95 transition"
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
