import { useState } from 'react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import FilterBar from '../../components/common/FilterBar'
import { useModalities } from '../../hooks/useModalities'
import { useClasses } from '../../hooks/useClasses'
import { usePodiums, usePenalties } from '../../hooks/useMedals'
import { useAuth } from '../../context/AuthContext'
import { savePodium, clearPodium, addPenalty, removePenalty } from '../../services/medalsService'
import { buildMedalRanking, MEDALHAS, PONTOS_POR_COLOCACAO } from '../../utils/medals'

// Painel do ranking geral: onde a comissão diz quem subiu no pódio de cada
// modalidade e aplica punições. É o único lugar que alimenta a tabela geral —
// resultado de jogo isolado não vale ponto geral, só colocação final.
export default function ManageGeneral() {
  const [aba, setAba] = useState('podios')

  return (
    <div className="pb-8">
      <div className="flex gap-2 mb-4">
        <Aba ativa={aba === 'podios'} onClick={() => setAba('podios')}>Pódios</Aba>
        <Aba ativa={aba === 'punicoes'} onClick={() => setAba('punicoes')}>Punições</Aba>
        <Aba ativa={aba === 'previa'} onClick={() => setAba('previa')}>Como está</Aba>
      </div>

      {aba === 'podios' && <Podios />}
      {aba === 'punicoes' && <Punicoes />}
      {aba === 'previa' && <Previa />}
    </div>
  )
}

function Podios() {
  const { modalities } = useModalities()
  const { classes } = useClasses()
  const { podiums } = usePodiums()
  const [modalityId, setModalityId] = useState('')
  const [salvo, setSalvo] = useState(null)

  const ativa = modalityId || modalities[0]?.id
  const modality = modalities.find((m) => m.id === ativa)
  const atual = podiums.find((p) => p.id === ativa) || {}

  const [draft, setDraft] = useState(null)
  const valores = draft?.id === ativa ? draft : { id: ativa, gold: atual.gold || '', silver: atual.silver || '', bronze: atual.bronze || '' }

  const set = (key, value) => setDraft({ ...valores, id: ativa, [key]: value })

  // A mesma turma em duas colocações é sempre engano de digitação
  const repetida = MEDALHAS
    .map((m) => valores[m.key])
    .filter(Boolean)
    .some((v, i, arr) => arr.indexOf(v) !== i)

  const salvar = async () => {
    await savePodium(ativa, {
      gold: valores.gold || null,
      silver: valores.silver || null,
      bronze: valores.bronze || null,
    })
    setSalvo(ativa)
    setTimeout(() => setSalvo(null), 2500)
  }

  const lancadas = podiums.filter((p) => p.gold || p.silver || p.bronze).length

  return (
    <>
      <Card className="mb-4">
        <p className="text-sm font-semibold mb-1">Resultado final da modalidade</p>
        <p className="text-xs text-slate-400 mb-3">
          Preencha só quando a modalidade <strong>terminar</strong>. Ouro vale {PONTOS_POR_COLOCACAO.gold},
          prata {PONTOS_POR_COLOCACAO.silver} e bronze {PONTOS_POR_COLOCACAO.bronze} pontos no ranking geral.
        </p>
        <FilterBar
          light
          groups={[{
            key: 'mod', label: 'Modalidade', value: ativa, onChange: setModalityId,
            options: modalities.map((m) => ({
              value: m.id,
              // marca as que já foram lançadas, pra saber o que falta
              label: podiums.some((p) => p.id === m.id && p.gold) ? `✓ ${m.name}` : m.name,
            })),
          }]}
        />
        <p className="text-xs text-slate-400 mt-2">
          {lancadas} de {modalities.length} modalidades com resultado lançado
        </p>
      </Card>

      <Card className="mb-4">
        <p className="text-sm font-semibold mb-3">{modality?.name}</p>
        <div className="flex flex-col gap-3">
          {MEDALHAS.map((m) => (
            <label key={m.key} className="flex items-center gap-3">
              <span
                className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                style={{ background: m.color }}
                aria-hidden="true"
              />
              <span className="w-16 text-sm font-semibold text-slate-600">{m.label}</span>
              <select
                value={valores[m.key] || ''}
                onChange={(e) => set(m.key, e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white"
              >
                <option value="">— não definido —</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
          ))}
        </div>

        {repetida && (
          <p className="text-xs text-red-600 mt-3">
            A mesma turma está em duas colocações — confere antes de salvar.
          </p>
        )}

        <div className="flex gap-2 mt-4">
          <Button onClick={salvar} disabled={repetida}>Salvar resultado</Button>
          {(atual.gold || atual.silver || atual.bronze) && (
            <button
              onClick={async () => {
                if (!confirm(`Apagar o resultado de ${modality?.name}?`)) return
                await clearPodium(ativa)
                setDraft(null)
              }}
              className="text-xs text-slate-500 underline"
            >
              Apagar resultado
            </button>
          )}
        </div>
        {salvo === ativa && <p className="text-xs text-emerald-700 mt-2">Salvo — já está no ranking geral.</p>}
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

  const aplicar = async () => {
    const valor = Number(points)
    if (!classId) return setErro('Escolha a turma.')
    if (!valor || valor <= 0) return setErro('Digite quantos pontos descontar.')
    setErro('')
    await addPenalty({ classId, points: valor, reason }, user?.uid)
    setPoints('')
    setReason('')
  }

  const nomeDa = (id) => classes.find((c) => c.id === id)?.name || id

  return (
    <>
      <Card className="mb-4">
        <p className="text-sm font-semibold mb-1">Aplicar punição</p>
        <p className="text-xs text-slate-400 mb-3">
          Digite quantos pontos <strong>descontar</strong> (valor positivo). A turma pode ficar com saldo negativo.
        </p>

        <div className="flex flex-col gap-3">
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white"
          >
            <option value="">— escolha a turma —</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <input
            type="number" inputMode="numeric" min="1"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="Pontos a descontar (ex.: 50)"
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          />

          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motivo (opcional) — ex.: atraso no futsal"
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          />
        </div>

        {erro && <p className="text-xs text-red-600 mt-2">{erro}</p>}
        <div className="mt-3"><Button onClick={aplicar}>Aplicar punição</Button></div>
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

// A mesma conta que o público vê — pra comissão conferir antes de alguém
// reclamar do resultado.
function Previa() {
  const { classes } = useClasses()
  const { podiums } = usePodiums()
  const { penalties } = usePenalties()
  const rows = buildMedalRanking(podiums, penalties, classes)

  return (
    <Card>
      <p className="text-sm font-semibold mb-3">Ranking geral agora</p>
      <div className="flex items-center gap-2 px-1 pb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        <span className="w-5" />
        <span className="flex-1">Turma</span>
        <span className="w-12 text-center">Pts</span>
        {MEDALHAS.map((m) => <span key={m.key} className="w-6 text-center">{m.short}</span>)}
      </div>
      {rows.map((r, i) => (
        <div key={r.id} className="flex items-center gap-2 px-1 py-2 border-b border-slate-100 last:border-0">
          <span className="w-5 text-center text-xs text-slate-400">{i + 1}</span>
          <span className="flex-1 min-w-0 text-sm font-semibold text-slate-700 truncate">{r.className}</span>
          <span className={`w-12 text-center text-sm font-bold ${r.points < 0 ? 'text-red-600' : 'text-slate-800'}`}>
            {r.points}
          </span>
          {MEDALHAS.map((m) => (
            <span key={m.key} className="w-6 text-center text-sm text-slate-500">{r[m.key]}</span>
          ))}
        </div>
      ))}
      {rows.some((r) => r.penalty > 0) && (
        <p className="text-[11px] text-slate-400 mt-3">
          Pontos já com as punições descontadas.
        </p>
      )}
    </Card>
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
