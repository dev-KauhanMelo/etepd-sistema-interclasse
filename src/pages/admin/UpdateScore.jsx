import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { serverTimestamp } from 'firebase/firestore'
import { useMatch } from '../../hooks/useMatch'
import { useModalities } from '../../hooks/useModalities'
import { useAuth } from '../../context/AuthContext'
import { addMatchNote, updateMatch, closeSet, reopenLastSet, resetSetPoints } from '../../services/matchesService'
import { advanceWinnerInBracket } from '../../services/bracketsService'
import { recalcGroupStandings } from '../../services/groupStageService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import MatchStatusBadge from '../../components/match/MatchStatusBadge'
import { scoringOf } from '../../utils/scoring'
import { usePendingScore } from '../../hooks/usePendingScore'
import { useBracket } from '../../hooks/useBracket'
import ClosePodium from '../../components/admin/ClosePodium'
import { mergeBracket } from '../../utils/bracket'

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
  const { bracket } = useBracket(match?.modalityId)
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

  const modality = modalities.find((m) => m.id === match.modalityId)
  const modName = modality?.name || ''
  const scoring = scoringOf(modName, modality)
  // O placar aparece sempre que a modalidade for turma × turma. Antes ele só
  // aparecia numa lista fechada de nomes, e uma modalidade nova ("Vôlei
  // Feminino") abria a tela SEM como marcar ponto — com o jogo já rolando.
  // Nunca mais: só some quando a disputa não é confronto direto.
  const mostraPlacar = scoring.tipo !== 'nenhum'
  const placarIncomum = scoring.tipo === 'vencedor'
  // Vôlei: o placar que vale é sets, mas cada set tem pontos próprios. Duas
  // contagens ao mesmo tempo, e uma some quando o set acaba.
  const porSet = scoring.tipo === 'sets' && !!scoring.pontosPorSet

  // Fase de grupos (feminino): todos contra todos, sem chave. O resultado
  // alimenta a tabela da modalidade, não um próximo confronto.
  const ehGrupos = match.phase === 'grupos' || modality?.standingsFormat === 'classico'

  // Final da modalidade: aqui o pódio inteiro pode ser fechado de uma vez.
  const ehFinal = match.bracketGame === 'final' && !ehGrupos
  const perdedoresDeSemi = (() => {
    if (!ehFinal || !bracket) return []
    const games = mergeBracket(bracket).games
    // jogo7 e jogo6 alimentam a final: quem perdeu ali ficou em 3º
    return ['jogo7', 'jogo6']
      .map((g) => {
        const j = games[g]
        if (!j || j.winner === null) return null
        return j.slots[j.winner === 0 ? 1 : 0]?.classId || null
      })
      .filter(Boolean)
  })()

  const status = match.status
  const emJogo = status === 'live' || status === 'paused'
  const acabou = status === 'finished'
  const parado = status === 'suspended' || status === 'cancelled' || status === 'postponed'

  const mudar = (novo) => {
    setAviso(null)
    // Começar o jogo carimba a hora: é ela que substitui o "a definir" nas
    // telas dos alunos. Só na PRIMEIRA vez — retomar depois de uma pausa não
    // reescreve a hora em que a partida começou de verdade.
    const extra = novo === 'live' && !match.startedAt ? { startedAt: serverTimestamp() } : {}
    return updateMatch(match.id, { status: novo, ...extra }, user?.uid)
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

      // Fase de grupos não tem chave pra avançar: o que anda é a tabela.
      if (ehGrupos) {
        const g = await recalcGroupStandings(match.modalityId)
        setAviso({
          erro: false,
          texto: g.ok
            ? `${nome} venceu. Tabela do grupo atualizada (${g.jogos} jogo${g.jogos === 1 ? '' : 's'} contabilizado${g.jogos === 1 ? '' : 's'}).`
            : `${nome} venceu.`,
        })
        return
      }

      const r = await advanceWinnerInBracket(match.modalityId, match, side)
      setAviso({
        erro: false,
        texto: !r.ok
          ? `${nome} venceu. Esta modalidade não tem chaveamento montado.`
          : r.criados?.length
            ? `${nome} venceu. Já avançou na chave e liberou: ${r.criados.join(', ')}.`
            : `${nome} venceu — já avançou no chaveamento.`,
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

          {porSet ? (
            <SetBoard
              match={match}
              scoring={scoring}
              uid={user?.uid}
              placarSets={placar}
              ajustarSets={ajustar}
              salvandoSets={salvando}
            />
          ) : mostraPlacar ? (
            <Card className="mb-4">
              <p className="text-sm font-semibold mb-1">
                {scoring.tipo === 'sets' ? `${scoring.unidade} ganhas` : `Marcar ${scoring.unidade || 'pontos'}`}
              </p>
              <p className="text-xs text-slate-400 mb-3">
                {placarIncomum
                  ? 'Esta modalidade costuma ser só "quem passou" — marque se precisar.'
                  : 'Toque no + de quem marcou.'}
              </p>
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
                Esta modalidade não é decidida em confronto direto — lance os resultados na aba Classificação.
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

          {ehFinal && match.winnerSide && (
            <ClosePodium
              match={match}
              modalityId={match.modalityId}
              modalityName={modName}
              sugestao3={perdedoresDeSemi}
            />
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

// PLACAR DE VÔLEI: DOIS CONTADORES
//
// Sets ganhos é o placar oficial — é ele que aparece pro aluno e decide quem
// venceu. Pontos são de um set só: existem enquanto ele está em jogo e somem
// quando acaba. Antes tudo isso era um número só, e registrar um set exigia
// apagar 21 pontos no −1 antes de somar o set.
//
// ENCERRAR SET faz as três coisas de uma vez: dá o set a quem fez mais pontos,
// guarda o placar no histórico e zera os pontos pro próximo.
function SetBoard({ match, scoring, uid, placarSets, ajustarSets, salvandoSets }) {
  const [aviso, setAviso] = useState('')

  const { placar: pontos, ajustar: ajustarPontos, salvando: salvandoPontos, gravarAgora } =
    usePendingScore(match, (campos) => updateMatch(match.id, campos, uid), { A: 'pointsA', B: 'pointsB' })

  const setsA = placarSets('A')
  const setsB = placarSets('B')
  const pa = pontos('A')
  const pb = pontos('B')
  const setAtual = (match.periodScores?.length || 0) + 1
  const decidido = setsA >= scoring.setsParaVencer || setsB >= scoring.setsParaVencer

  const encerrarSet = async () => {
    if (pa === pb) return setAviso('Empatado — o set precisa de um vencedor.')
    setAviso('')
    gravarAgora()
    // dá tempo da gravação dos pontos chegar antes de lê-los pra fechar o set
    await new Promise((r) => setTimeout(r, 350))
    const r = await closeSet({ ...match, pointsA: pa, pointsB: pb }, uid)
    if (r.ok) setAviso(`Set ${setAtual} para ${r.vencedor === 'A' ? match.teamA?.name : match.teamB?.name} (${r.placar}).`)
  }

  return (
    <>
      {/* Placar oficial */}
      <Card className="mb-3">
        <p className="text-sm font-semibold mb-1">Sets ganhos</p>
        <p className="text-xs text-slate-400 mb-3">
          É este o placar que aparece pros alunos. Melhor de {scoring.setsParaVencer * 2 - 1}
          {' '}— vence quem fizer {scoring.setsParaVencer}.
        </p>
        <div className="flex items-center justify-around">
          <SetCount team={match.teamA} valor={setsA} onAdjust={(d) => ajustarSets('A', d)} />
          <span className="text-slate-300 score-number text-2xl">×</span>
          <SetCount team={match.teamB} valor={setsB} onAdjust={(d) => ajustarSets('B', d)} />
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-2 h-4">{salvandoSets ? 'salvando…' : ''}</p>

        {match.periodScores?.length > 0 && (
          <div className="border-t border-slate-100 mt-3 pt-2 flex items-center justify-between">
            <p className="text-[11px] text-slate-500">
              {match.periodScores.map((s, i) => `${i + 1}º set ${s.scoreA}×${s.scoreB}`).join(' · ')}
            </p>
            <button
              onClick={() => { if (confirm('Desfazer o último set?')) reopenLastSet(match, uid) }}
              className="text-[11px] text-slate-400 underline shrink-0 ml-2"
            >
              desfazer
            </button>
          </div>
        )}
      </Card>

      {/* Pontos do set em andamento */}
      {decidido ? (
        <Card className="mb-4 bg-emerald-50 border-2 border-emerald-300">
          <p className="text-sm font-bold text-emerald-800">
            {setsA > setsB ? match.teamA?.name : match.teamB?.name} fechou o jogo em sets.
          </p>
          <p className="text-xs text-slate-500 mt-1">Pode finalizar a partida abaixo.</p>
        </Card>
      ) : (
        <Card className="mb-4">
          <p className="text-sm font-semibold mb-1">{setAtual}º set · pontos</p>
          <p className="text-xs text-slate-400 mb-3">
            Set de {scoring.pontosPorSet} pontos. Toque no + de quem marcou.
          </p>
          <div className="flex items-center justify-around">
            <ScoreControl team={match.teamA} score={pa} onAdjust={(d) => ajustarPontos('A', d)} />
            <span className="text-slate-300 score-number text-2xl">×</span>
            <ScoreControl team={match.teamB} score={pb} onAdjust={(d) => ajustarPontos('B', d)} />
          </div>
          <p className="text-center text-[11px] text-slate-400 mt-2 h-4">{salvandoPontos ? 'salvando…' : ''}</p>

          <button
            onClick={encerrarSet}
            disabled={pa === pb}
            className="w-full mt-3 rounded-xl bg-brand text-white py-3.5 font-bold active:scale-[0.98] transition disabled:opacity-40"
          >
            ENCERRAR {setAtual}º SET
          </button>
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={() => { if (confirm('Zerar os pontos deste set?')) resetSetPoints(match, uid) }}
              className="text-xs text-slate-500 underline"
            >
              Zerar pontos do set
            </button>
            {aviso && <span className="text-xs text-emerald-700">{aviso}</span>}
          </div>
        </Card>
      )}
    </>
  )
}

// Contador de sets: menor que o de pontos, porque muda pouco e um toque errado
// aqui custa mais caro do que no placar do set.
function SetCount({ team, valor, onAdjust }) {
  return (
    <div className="text-center">
      <p className="text-xs font-medium text-slate-500 mb-1">{team?.name}</p>
      <p className="score-number text-4xl mb-2" style={{ color: team?.color }}>{valor}</p>
      <div className="flex gap-1.5 justify-center">
        <button onClick={() => onAdjust(-1)} className="w-9 h-9 rounded-full bg-slate-100 text-sm font-bold active:scale-90 transition">−</button>
        <button onClick={() => onAdjust(1)} className="w-9 h-9 rounded-full bg-slate-200 text-sm font-bold active:scale-90 transition">+</button>
      </div>
    </div>
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
