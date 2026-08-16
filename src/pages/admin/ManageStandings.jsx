import { useEffect, useRef, useState } from 'react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import FilterBar from '../../components/common/FilterBar'
import { useModalities } from '../../hooks/useModalities'
import { useClasses } from '../../hooks/useClasses'
import { useStandings } from '../../hooks/useStandings'
import { upsertStanding } from '../../services/standingsService'
import { updateModality } from '../../services/modalitiesService'
import { STANDINGS_FORMAT } from '../../utils/constants'
import { fieldsFor, sortStandings, hasTable, roundAverage, formatTime } from '../../utils/standings'

// Painel da classificação. Duas caras conforme o formato da modalidade:
// - clássico: pontos, vitórias, empates, derrotas (futsal, vôlei…)
// - pontos (LBFF): pontos, booyah, abates (Free Fire)
// Em ambos, a colocação é calculada sozinha — o juiz só digita os números.
export default function ManageStandings() {
  const { modalities } = useModalities()
  const { classes } = useClasses()

  const [modalityId, setModalityId] = useState('')
  const activeModality = modalityId || modalities[0]?.id
  const modality = modalities.find((m) => m.id === activeModality)
  const format = modality?.standingsFormat || 'mata-mata'
  const fields = fieldsFor(format)

  const { standings, loading, loadedFor } = useStandings(activeModality, format)

  const [draft, setDraft] = useState({})
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)
  const hydratedFor = useRef(null)

  // Monta o rascunho a partir do banco. Mesma trava do chaveamento: só hidrata
  // quando os dados são realmente da modalidade selecionada, senão o rascunho
  // nasce com os números da modalidade anterior.
  useEffect(() => {
    if (!activeModality || loading) return
    if (loadedFor !== activeModality) return
    if (hydratedFor.current === activeModality) return
    hydratedFor.current = activeModality
    const next = {}
    for (const c of classes) {
      const row = standings.find((s) => s.classId === c.id)
      next[c.id] = Object.fromEntries(fields.map((f) => [f.key, row?.[f.key] ?? 0]))
    }
    setDraft(next)
    setDirty(false)
  }, [activeModality, loading, loadedFor, standings, classes, fields])

  function switchModality(id) {
    if (id === activeModality) return
    if (dirty && !confirm('Você tem números não salvos. Trocar de modalidade vai descartá-los. Continuar?')) return
    hydratedFor.current = null
    setDraft({})
    setDirty(false)
    setModalityId(id)
  }

  function setValue(classId, key, raw) {
    // tempo do cubo vem com centésimos ("45,28" ou "45.28")
    const parsed = Number(String(raw).replace(',', '.'))
    const value = Math.max(0, Number.isFinite(parsed) ? parsed : 0)
    setDraft((d) => ({ ...d, [classId]: { ...d[classId], [key]: value } }))
    setDirty(true)
  }

  function bump(classId, key, delta) {
    const atual = draft[classId]?.[key] || 0
    // no formato por tempo o passo é 1 segundo, e o valor mantém os decimais
    setValue(classId, key, Math.max(0, Number((atual + delta).toFixed(2))))
  }

  async function handleSaveAll() {
    if (!activeModality) return
    setSaving(true)
    try {
      await Promise.all(
        classes.map((c) =>
          upsertStanding(activeModality, c.id, { className: c.name, ...draft[c.id] })
        )
      )
      setDirty(false)
      setSavedAt(new Date())
    } catch (error) {
      console.error('Erro ao salvar classificação:', error)
      alert('Não deu pra salvar. Confere a conexão e tenta de novo.')
    } finally {
      setSaving(false)
    }
  }

  async function handleFormatChange(nextFormat) {
    if (!modality) return
    if (dirty && !confirm('Trocar o formato agora descarta os números não salvos. Continuar?')) return
    await updateModality(modality.id, { standingsFormat: nextFormat })
    hydratedFor.current = null
    setDirty(false)
  }

  // Prévia já ordenada, do jeito que o aluno vai ver
  const preview = sortStandings(
    classes.map((c) => ({ id: c.id, classId: c.id, className: c.name, ...draft[c.id] })),
    format
  )

  if (modalities.length === 0) {
    return (
      <div>
        <h1 className="text-lg font-display font-bold mb-2">Classificação</h1>
        <Card className="text-sm text-slate-500">
          Cadastre uma modalidade primeiro em <strong>Turmas/Modalidades</strong>.
        </Card>
      </div>
    )
  }

  return (
    <div className="pb-24">
      <h1 className="text-lg font-display font-bold mb-1">Classificação</h1>
      <p className="text-sm text-slate-400 mb-3">
        Digite os números de cada turma. A colocação é calculada sozinha e aparece pros alunos na hora que você salvar.
      </p>

      {/* Seletor de modalidade: painel com todas visíveis, sem rolagem
          lateral — no computador a fileira antiga não rolava com o mouse. */}
      <div className="mb-4">
        <FilterBar
          light
          groups={[{
            key: 'mod',
            label: 'Escolha a modalidade',
            value: activeModality,
            onChange: switchModality,
            options: modalities.map((m) => ({ value: m.id, label: m.name })),
          }]}
        />
      </div>

      <Card className="mb-4">
        <p className="text-sm font-semibold mb-2">Formato desta modalidade</p>
        <div className="space-y-2">
          {Object.entries(STANDINGS_FORMAT).map(([key, cfg]) => (
            <label
              key={key}
              className={`flex items-start gap-2 rounded-xl border p-2.5 cursor-pointer transition ${
                format === key ? 'border-brand bg-brand/5' : 'border-slate-200'
              }`}
            >
              <input
                type="radio"
                name="format"
                checked={format === key}
                onChange={() => handleFormatChange(key)}
                className="mt-0.5"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium">{cfg.label}</span>
                <span className="block text-xs text-slate-400">{cfg.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </Card>

      {!hasTable(format) ? (
        <Card className="text-sm text-slate-600">
          <p className="font-semibold mb-1">Esta modalidade é mata-mata.</p>
          <p className="text-slate-500">
            Quem perde está fora, então não existe tabela de classificação para preencher —
            o que vale é o <strong>chaveamento</strong>. Use a aba Chaveamento para marcar os vencedores.
          </p>
        </Card>
      ) : classes.length === 0 ? (
        <Card className="text-sm text-slate-500">
          Cadastre as turmas primeiro em <strong>Turmas/Modalidades</strong>.
        </Card>
      ) : (
        <>
          {/* Prévia na ordem que o aluno vê */}
          <Card className="mb-4 p-0 overflow-hidden">
            <p className="text-sm font-semibold px-4 pt-3 pb-2">Como vai ficar pro aluno</p>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 bg-slate-50">
                  <th className="py-2 pl-4 text-left w-8">#</th>
                  <th className="py-2 text-left">Turma</th>
                  {fields.map((f) => (
                    <th key={f.key} className="py-2 text-center w-12">{f.short}</th>
                  ))}
                  {format === 'tempo' && <th className="py-2 text-center w-14">MÉDIA</th>}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className={`py-1.5 pl-4 font-bold ${i === 0 ? 'text-amber-500' : 'text-slate-500'}`}>{i + 1}</td>
                    <td className="py-1.5 font-medium text-slate-700">{row.className}</td>
                    {fields.map((f) => (
                      <td key={f.key} className="py-1.5 text-center text-slate-500">
                        {format === 'tempo' ? formatTime(row[f.key]) : (row[f.key] || 0)}
                      </td>
                    ))}
                    {format === 'tempo' && (
                      <td className="py-1.5 text-center font-bold text-brand">
                        {roundAverage(row) === null ? '—' : formatTime(roundAverage(row))}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="space-y-2">
            {classes.map((c) => (
              <Card key={c.id}>
                <div className="flex items-center gap-2 mb-2.5">
                  {c.logoUrl
                    ? <img src={c.logoUrl} alt="" className="w-6 h-6 rounded-full object-cover bg-white" />
                    : <span className="w-6 h-6 rounded-full" style={{ backgroundColor: c.color }} />}
                  <p className="text-sm font-semibold">{c.name}</p>
                </div>
                <div className={`grid gap-2 ${fields.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                  {fields.map((f) => (
                    <div key={f.key}>
                      <label className="text-[11px] text-slate-400 block mb-1">{f.label}</label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => bump(c.id, f.key, -1)}
                          className="w-7 h-8 shrink-0 rounded-lg border border-slate-200 text-slate-500 font-bold"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          inputMode="decimal"
                          step={format === 'tempo' ? '0.01' : '1'}
                          min="0"
                          value={draft[c.id]?.[f.key] ?? 0}
                          onChange={(e) => setValue(c.id, f.key, e.target.value)}
                          onFocus={(e) => e.target.select()}
                          className="w-full min-w-0 rounded-lg border border-slate-200 px-1 py-1.5 text-center text-sm font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => bump(c.id, f.key, 1)}
                          className="w-7 h-8 shrink-0 rounded-lg border border-slate-200 text-slate-500 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 flex items-center gap-3 z-30">
            <p className="flex-1 min-w-0 text-xs text-slate-500 truncate">
              {dirty
                ? 'Alterações não salvas'
                : savedAt
                  ? `Salvo às ${savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                  : 'Tudo salvo'}
            </p>
            <Button disabled={saving || !dirty} onClick={handleSaveAll}>
              {saving ? 'Salvando…' : 'Salvar tudo'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
