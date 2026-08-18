import { useState } from 'react'
import MedalTableEditor from '../../components/admin/MedalTableEditor'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { useModalities } from '../../hooks/useModalities'
import { useClasses } from '../../hooks/useClasses'
import { usePodiums, usePenalties } from '../../hooks/useMedals'
import { useAuth } from '../../context/AuthContext'
import { savePodium, clearPodium, addPenalty, removePenalty } from '../../services/medalsService'
import { MEDALHAS, CATEGORIAS, podiumId, pontosDe, tipoDaModalidade } from '../../utils/medals'

// Painel do ranking geral: onde a comissão diz quem subiu no pódio de cada
// modalidade e aplica punições. É o único lugar que alimenta a tabela geral —
// resultado de jogo isolado não vale ponto geral, só colocação final.
export default function ManageGeneral() {
  // A tabela é a tela principal: é como a comissão pensa o ranking. O
  // formulário por modalidade continua, porque lançar um pódio inteiro de uma
  // vez é mais rápido no momento em que a modalidade acaba.
  const [aba, setAba] = useState('tabela')

  return (
    <div className="pb-8">
      <div className="flex gap-2 mb-4">
        <Aba ativa={aba === 'tabela'} onClick={() => setAba('tabela')}>Tabela</Aba>
        <Aba ativa={aba === 'podios'} onClick={() => setAba('podios')}>Por modalidade</Aba>
        <Aba ativa={aba === 'punicoes'} onClick={() => setAba('punicoes')}>Punições</Aba>
      </div>

      {aba === 'tabela' && <MedalTableEditor />}
      {aba === 'podios' && <Podios />}
      {aba === 'punicoes' && <Punicoes />}
    </div>
  )
}

function Podios() {
  const { modalities } = useModalities()
  const { classes } = useClasses()
  const { podiums } = usePodiums()
  const [modalityId, setModalityId] = useState('')
  const [categoria, setCategoria] = useState('unico')
  const [salvo, setSalvo] = useState(false)
  const [draft, setDraft] = useState(null)

  const ativa = modalityId || modalities[0]?.id
  const modality = modalities.find((m) => m.id === ativa)
  const docId = ativa ? podiumId(ativa, categoria) : null
  const atual = podiums.find((p) => p.id === docId) || {}
  const valores = pontosDe(modality?.name)

  const lista = (key) => {
    if (draft?.docId === docId) return draft[key] || []
    return Array.isArray(atual[key]) ? atual[key] : atual[key] ? [atual[key]] : []
  }

  const toggle = (key, classId) => {
    const atualLista = lista(key)
    const nova = atualLista.includes(classId)
      ? atualLista.filter((id) => id !== classId)
      : [...atualLista, classId]
    setDraft({
      docId,
      gold: key === 'gold' ? nova : lista('gold'),
      silver: key === 'silver' ? nova : lista('silver'),
      bronze: key === 'bronze' ? nova : lista('bronze'),
    })
    setSalvo(false)
  }

  // A mesma turma em duas colocações da mesma disputa é engano de digitação
  const todas = MEDALHAS.flatMap((m) => lista(m.key))
  const repetida = todas.some((v, i) => todas.indexOf(v) !== i)

  const salvar = async () => {
    if (!ativa) return
    await savePodium(ativa, categoria, {
      gold: lista('gold'), silver: lista('silver'), bronze: lista('bronze'),
    })
    setDraft(null)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2500)
  }

  const jaLancada = (modId) => podiums.some((p) => p.modalityId === modId && (p.gold || []).length > 0)

  return (
    <>
      <Card className="mb-4">
        <p className="text-sm font-semibold mb-1">Resultado final da modalidade</p>
        <p className="text-xs text-slate-400 mb-3">
          Preencha só quando a modalidade <strong>terminar</strong>. Pode marcar mais de uma turma
          por colocação (times unidos do feminino, tipo 2ºB/2ºC) — cada turma marcada leva os pontos.
        </p>

        <select
          value={ativa || ''}
          onChange={(e) => { setModalityId(e.target.value); setDraft(null) }}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white"
        >
          {modalities.map((m) => (
            <option key={m.id} value={m.id}>{jaLancada(m.id) ? `✓ ${m.name}` : m.name}</option>
          ))}
        </select>

        <div className="flex gap-2 mt-3">
          {CATEGORIAS.map((c) => (
            <button
              key={c.key}
              onClick={() => { setCategoria(c.key); setDraft(null) }}
              className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                categoria === c.key ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Use <strong>Masculino</strong> e <strong>Feminino</strong> só quando a modalidade tiver as
          duas disputas com pódios diferentes. Senão, deixe em Único.
        </p>

        <p className="text-xs text-slate-500 mt-3 border-t border-slate-100 pt-3">
          {modality?.name} conta como <strong>{tipoDaModalidade(modality?.name) === 'esporte' ? 'esporte' : 'e-sport / jogo de mesa'}</strong>:
          {' '}ouro {valores.gold}, prata {valores.silver}, bronze {valores.bronze} pontos.
        </p>
      </Card>

      <Card className="mb-4">
        <div className="flex flex-col gap-4">
          {MEDALHAS.map((m) => (
            <div key={m.key}>
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <span
                  className="w-4 h-4 rounded-full border border-black/20"
                  style={{ background: m.color }}
                  aria-hidden="true"
                />
                {m.label} · {valores[m.key]} pts
              </p>
              <div className="flex flex-wrap gap-1.5">
                {classes.map((c) => {
                  const on = lista(m.key).includes(c.id)
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggle(m.key, c.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                        on ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {c.name}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {repetida && (
          <p className="text-xs text-red-600 mt-3">
            A mesma turma está em duas colocações — confere antes de salvar.
          </p>
        )}

        <div className="flex items-center gap-3 mt-4">
          <Button onClick={salvar} disabled={repetida}>Salvar resultado</Button>
          {(atual.gold?.length || atual.silver?.length || atual.bronze?.length) && (
            <button
              onClick={async () => {
                if (!confirm(`Apagar o resultado de ${modality?.name}?`)) return
                await clearPodium(ativa, categoria)
                setDraft(null)
              }}
              className="text-xs text-slate-500 underline"
            >
              Apagar
            </button>
          )}
          {salvo && <span className="text-xs text-emerald-700">Salvo.</span>}
        </div>
      </Card>
    </>
  )
}

function Punicoes() {
  const { classes } = useClasses()
  const { penalties } = usePenalties()
  const { user } = useAuth()
  const [classId, setClassId] = useState('')
  const [points, setPoints] = useState('')
  const [reason, setReason] = useState('')
  const [erro, setErro] = useState('')
  const [ok, setOk] = useState('')

  const aplicar = async () => {
    const valor = Number(points)
    if (!classId) return setErro('Escolha a turma.')
    if (!valor || valor <= 0) return setErro('Digite quantos pontos descontar.')
    setErro('')
    const nome = classes.find((c) => c.id === classId)?.name
    await addPenalty({ classId, points: valor, reason }, user?.uid)
    setPoints('')
    setReason('')
    setOk(`−${valor} pontos aplicados em ${nome}.`)
    setTimeout(() => setOk(''), 3500)
  }

  const nomeDa = (id) => classes.find((c) => c.id === id)?.name || id

  return (
    <>
      {/* Punição é ação séria e pouco frequente: fica em cartão vermelho e com
          as turmas em botões grandes, pra não ser escolhida por engano nem
          ficar escondida quando a comissão precisar dela na correria. */}
      <Card className="mb-4 border-2 border-red-200 bg-red-50/40">
        <p className="text-base font-bold text-red-700 mb-1">Aplicar punição</p>
        <p className="text-xs text-slate-500 mb-4">
          Desconta pontos do ranking geral. A turma pode ficar com saldo negativo.
        </p>

        <p className="text-xs font-semibold text-slate-600 mb-2">1. Qual turma?</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {classes.map((c) => (
            <button
              key={c.id}
              onClick={() => { setClassId(c.id); setErro('') }}
              className={`px-3.5 py-2 rounded-full text-sm font-bold transition ${
                classId === c.id ? 'bg-red-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <p className="text-xs font-semibold text-slate-600 mb-2">2. Quantos pontos descontar?</p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {[50, 100, 150, 250, 350].map((v) => (
            <button
              key={v}
              onClick={() => { setPoints(String(v)); setErro('') }}
              className={`px-3.5 py-2 rounded-full text-sm font-bold transition ${
                String(v) === points ? 'bg-red-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              −{v}
            </button>
          ))}
        </div>
        <input
          type="number" inputMode="numeric" min="1"
          value={points}
          onChange={(e) => { setPoints(e.target.value); setErro('') }}
          placeholder="ou digite outro valor"
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm mb-4"
        />

        <p className="text-xs font-semibold text-slate-600 mb-2">3. Motivo (opcional)</p>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ex.: atraso no futsal"
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
        />

        {erro && <p className="text-xs text-red-600 mt-3">{erro}</p>}
        {ok && <p className="text-xs text-emerald-700 mt-3">{ok}</p>}

        <button
          onClick={aplicar}
          className="w-full mt-4 rounded-xl bg-red-600 text-white py-3.5 font-bold active:scale-[0.98] transition"
        >
          APLICAR PUNIÇÃO
        </button>
      </Card>

      <Card>
        <p className="text-sm font-semibold mb-2">Punições aplicadas</p>
        {penalties.length === 0 ? (
          <p className="text-xs text-slate-400">Nenhuma punição até agora.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {penalties.map((p) => (
              <div key={p.id} className="flex items-center gap-3 border-b border-slate-100 pb-2 last:border-0">
                <span className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-slate-700">{nomeDa(p.classId)}</span>
                  {p.reason && <span className="block text-xs text-slate-400 truncate">{p.reason}</span>}
                </span>
                <span className="text-sm font-bold text-red-600 shrink-0">−{p.points}</span>
                <button
                  onClick={() => { if (confirm('Desfazer esta punição?')) removePenalty(p.id) }}
                  className="text-xs text-slate-400 underline shrink-0"
                >
                  desfazer
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  )
}

function Aba({ ativa, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
        ativa ? 'bg-brand text-white' : 'bg-white border border-slate-200 text-slate-600'
      }`}
    >
      {children}
    </button>
  )
}
