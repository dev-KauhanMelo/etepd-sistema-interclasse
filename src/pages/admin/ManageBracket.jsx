import { useEffect, useRef, useState } from 'react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import DragScroll from '../../components/common/DragScroll'
import BracketBoard from '../../components/bracket/BracketBoard'
import { useAuth } from '../../context/AuthContext'
import { useClasses } from '../../hooks/useClasses'
import { useModalities } from '../../hooks/useModalities'
import { useBracket } from '../../hooks/useBracket'
import { saveBracket } from '../../services/bracketsService'
import {
  BRACKET_ORDER,
  applyWinner,
  emptySlot,
  gameById,
  mergeBracket,
  resolveSlot,
  slotIsSeeded,
  slotPlaceholder,
} from '../../utils/bracket'

// Painel do chaveamento: escolhe a modalidade, monta as chaves (turma por
// turma), marca os vencedores e publica. O que é salvo aqui aparece na hora
// na aba "Chaveamento" do Ranking.
export default function ManageBracket() {
  const { user } = useAuth()
  const { modalities } = useModalities()
  const { classes } = useClasses()

  const [modalityId, setModalityId] = useState('')
  const activeModality = modalityId || modalities[0]?.id
  const modality = modalities.find((m) => m.id === activeModality)

  const { bracket, loading, loadedFor } = useBracket(activeModality)
  const [draft, setDraft] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)
  const [selected, setSelected] = useState(null)

  const hydratedFor = useRef(null)
  const cardRefs = useRef({})

  // Carrega o rascunho quando troca de modalidade. Depois disso o rascunho é
  // só nosso — snapshots do banco não sobrescrevem o que está sendo editado.
  //
  // `loadedFor === activeModality` é essencial: sem essa checagem o rascunho
  // era montado com o chaveamento da modalidade anterior (ou vazio), e como
  // `hydratedFor` já ficava marcado, a chegada dos dados certos era ignorada —
  // dava a impressão de que o que tinha sido salvo havia sumido.
  useEffect(() => {
    if (!activeModality || loading) return
    if (loadedFor !== activeModality) return
    if (hydratedFor.current === activeModality) return
    hydratedFor.current = activeModality
    setDraft(mergeBracket(bracket))
    setDirty(false)
    setSelected(null)
  }, [activeModality, loading, loadedFor, bracket])

  // Troca de modalidade: avisa se tem coisa não salva e limpa o rascunho, pra
  // não piscar o chaveamento da modalidade anterior enquanto o novo carrega.
  function switchModality(id) {
    if (id === activeModality) return
    if (dirty && !confirm('Você tem alterações não salvas neste chaveamento. Trocar de modalidade vai descartá-las. Continuar?')) return
    setDraft(null)
    setDirty(false)
    setSelected(null)
    setModalityId(id)
  }

  function patchGames(updater) {
    setDraft((d) => ({ ...d, games: updater(d.games) }))
    setDirty(true)
  }

  function setGame(gameId, patch) {
    patchGames((games) => ({ ...games, [gameId]: { ...games[gameId], ...patch } }))
  }

  function setSlot(gameId, index, patch) {
    patchGames((games) => {
      const slots = games[gameId].slots.map((s, i) => (i === index ? { ...s, ...patch } : s))
      return { ...games, [gameId]: { ...games[gameId], slots } }
    })
  }

  function chooseTeam(gameId, index, classId) {
    if (!classId) {
      setSlot(gameId, index, emptySlot())
      return
    }
    const cls = classes.find((c) => c.id === classId)
    setSlot(gameId, index, {
      classId: cls.id,
      name: cls.name,
      color: cls.color || null,
      logoUrl: cls.logoUrl || null,
      label: null,
    })
  }

  function toggleWinner(gameId, index) {
    patchGames((games) => applyWinner(games, gameId, index))
  }

  function clearGame(gameId) {
    patchGames((games) => ({ ...games, [gameId]: { ...games[gameId], winner: null, slots: [emptySlot(), emptySlot()] } }))
  }

  async function handleSave(publishedOverride) {
    if (!activeModality || !draft) return
    const payload = publishedOverride === undefined ? draft : { ...draft, published: publishedOverride }
    setSaving(true)
    try {
      await saveBracket(activeModality, payload, user?.uid)
      setDraft(payload)
      setDirty(false)
      setSavedAt(new Date())
    } catch (error) {
      console.error('Erro ao salvar chaveamento:', error)
      alert('Não deu pra salvar o chaveamento. Confere a conexão e tenta de novo.')
    } finally {
      setSaving(false)
    }
  }

  function selectGame(gameId) {
    setSelected(gameId)
    cardRefs.current[gameId]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  if (modalities.length === 0) {
    return (
      <div>
        <h1 className="text-lg font-display font-bold mb-2">Chaveamento</h1>
        <Card className="text-sm text-slate-500">
          Cadastre uma modalidade primeiro (aba <strong>Turmas/Modalidades</strong>) — o chaveamento é montado por modalidade.
        </Card>
      </div>
    )
  }

  return (
    <div className="pb-24">
      <h1 className="text-lg font-display font-bold mb-1">Chaveamento</h1>
      <p className="text-sm text-slate-400 mb-3">
        Monte o mata-mata da modalidade. Marcou o vencedor de um jogo? A turma já entra sozinha na chave seguinte.
      </p>

      <DragScroll className="pb-3">
        <div className="flex gap-2 w-max">
          {modalities.map((m) => (
            <button
              key={m.id}
              onClick={() => switchModality(m.id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition ${
                activeModality === m.id ? 'bg-brand text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </DragScroll>

      {!draft ? (
        <Loader />
      ) : (
        <>
          <BracketBoard
            title={modality?.name}
            subtitle={draft.subtitle || `${modality?.name || 'Modalidade'} · Mata-mata`}
            games={draft.games}
            classes={classes}
            selectedGameId={selected}
            onSlotClick={(gameId) => selectGame(gameId)}
          />
          <p className="text-xs text-slate-400 mt-2 mb-4">
            Toque em qualquer vaga da prévia pra pular direto pra edição daquele jogo.
          </p>

          <Card className="mb-4">
            <label className="text-sm font-medium block mb-1">Subtítulo do banner</label>
            <input
              value={draft.subtitle}
              onChange={(e) => { setDraft({ ...draft, subtitle: e.target.value }); setDirty(true) }}
              placeholder={`${modality?.name || 'Futsal'} · Mata-mata`}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-400 mt-1">Aparece embaixo da palavra CHAVEAMENTO, em amarelo.</p>
          </Card>

          <div className="space-y-3">
            {BRACKET_ORDER.map((gameId) => (
              <div key={gameId} ref={(el) => { cardRefs.current[gameId] = el }}>
                <GameEditor
                gameId={gameId}
                draft={draft}
                classes={classes}
                selected={selected === gameId}
                onSelect={() => setSelected(gameId)}
                onLabelChange={(label) => setGame(gameId, { label: label.toUpperCase() })}
                onChooseTeam={(index, classId) => chooseTeam(gameId, index, classId)}
                onLabelSlot={(index, label) => setSlot(gameId, index, { label: label || null })}
                onWinner={(index) => toggleWinner(gameId, index)}
                onClear={() => clearGame(gameId)}
                />
              </div>
            ))}
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 flex items-center gap-3 z-30">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-600">
                {draft.published ? '✅ Publicado — os alunos estão vendo' : '🚧 Rascunho — ninguém vê ainda'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {dirty
                  ? 'Alterações não salvas'
                  : savedAt
                    ? `Salvo às ${savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                    : 'Tudo salvo'}
              </p>
            </div>
            {draft.published ? (
              <Button variant="secondary" disabled={saving} onClick={() => handleSave(false)}>Despublicar</Button>
            ) : (
              <Button variant="secondary" disabled={saving} onClick={() => handleSave(true)}>Publicar</Button>
            )}
            <Button disabled={saving || !dirty} onClick={() => handleSave()}>
              {saving ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

// Um jogo do chaveamento: rótulo, as duas vagas e quem venceu.
function GameEditor({
  gameId, draft, classes, selected, onSelect, onLabelChange, onChooseTeam, onLabelSlot, onWinner, onClear,
}) {
  const spec = gameById(gameId)
  const game = draft.games[gameId]
  const destination = spec.to ? draft.games[spec.to.game]?.label || gameById(spec.to.game)?.label : null

  return (
    <div onClick={onSelect}>
      <Card className={selected ? 'ring-2 ring-brand' : ''}>
        <div className="flex items-center gap-2 mb-3">
          <input
            value={game.label}
            onChange={(e) => onLabelChange(e.target.value)}
            className="w-32 rounded-lg border border-slate-200 px-2 py-1 text-sm font-bold uppercase"
          />
          {spec.isFinal && <span className="text-xs font-bold text-amber-500">🏆 decide o título</span>}
          <button onClick={onClear} className="ml-auto text-xs text-red-500 font-medium">Limpar</button>
        </div>

        <div className="space-y-2">
          {[0, 1].map((index) => (
            <SlotEditor
              key={index}
              gameId={gameId}
              index={index}
              draft={draft}
              classes={classes}
              onChooseTeam={onChooseTeam}
              onLabelSlot={onLabelSlot}
              onWinner={onWinner}
            />
          ))}
        </div>

        {destination && (
          <p className="text-[11px] text-slate-400 mt-2">
            Vencedor vai para <strong>{destination}</strong>{game.winner !== null ? ' — já enviado' : ''}.
          </p>
        )}
      </Card>
    </div>
  )
}

function SlotEditor({ gameId, index, draft, classes, onChooseTeam, onLabelSlot, onWinner }) {
  const game = draft.games[gameId]
  const slot = game.slots[index]
  const team = resolveSlot(slot, classes)
  const isWinner = game.winner === index
  const isLoser = game.winner !== null && !isWinner
  const fedBy = gameById(gameId)?.slots?.[index]?.from
  // Dá pra marcar vencedor com turma escolhida ou com a vaga rotulada ("3º B")
  const canWin = !!team || slotIsSeeded(gameId, index, draft.games)

  return (
    <div className={`rounded-xl border p-2 ${isWinner ? 'border-amber-400 bg-amber-50' : isLoser ? 'border-slate-200 bg-slate-50 opacity-70' : 'border-slate-200'}`}>
      <div className="flex items-center gap-2">
        <select
          value={slot.classId || ''}
          onChange={(e) => onChooseTeam(index, e.target.value)}
          className="flex-1 min-w-0 rounded-lg border border-slate-200 px-2 py-2 text-sm"
        >
          <option value="">— vaga em aberto —</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          onClick={() => onWinner(index)}
          disabled={!canWin}
          title={canWin ? 'Marcar como vencedor' : 'Escolha a turma dessa vaga primeiro'}
          className={`shrink-0 px-3 py-2 rounded-lg text-xs font-bold border transition disabled:opacity-40 ${
            isWinner ? 'bg-amber-400 text-white border-amber-400' : 'bg-white text-slate-500 border-slate-200'
          }`}
        >
          {isWinner ? '🏆 Venceu' : 'Venceu'}
        </button>
      </div>

      {!team && (
        <input
          value={slot.label || ''}
          onChange={(e) => onLabelSlot(index, e.target.value)}
          placeholder={`Rótulo da vaga (ex.: ${slotPlaceholder(gameId, index, draft.games)})`}
          className="w-full mt-2 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
        />
      )}

      {team ? (
        <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
          {team.logoUrl
            ? <img src={team.logoUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
            : <span className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: team.color }} />}
          Aparece como <strong>{team.name}</strong> com a foto do cadastro.
        </p>
      ) : fedBy ? (
        <p className="text-[11px] text-slate-400 mt-1.5">
          Preenchida sozinha quando você marcar o vencedor do <strong>{draft.games[fedBy]?.label || fedBy}</strong>.
        </p>
      ) : null}
    </div>
  )
}
