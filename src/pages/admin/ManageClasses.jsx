import { useState } from 'react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { useClasses } from '../../hooks/useClasses'
import { useModalities } from '../../hooks/useModalities'
import { createClass } from '../../services/classesService'
import { createModality } from '../../services/modalitiesService'

export default function ManageClasses() {
  const { classes } = useClasses()
  const { modalities } = useModalities()
  const [className, setClassName] = useState('')
  const [classColor, setClassColor] = useState('#0552CB')
  const [classLogoUrl, setClassLogoUrl] = useState('')
  const [modName, setModName] = useState('')

  async function handleCreateClass(e) {
    e.preventDefault()
    await createClass({
      name: className,
      shortName: className,
      color: classColor,
      logoUrl: classLogoUrl.trim() || null,
    })
    setClassName('')
    setClassLogoUrl('')
  }

  async function handleCreateModality(e) {
    e.preventDefault()
    await createModality({
      name: modName,
      sport: modName,
      scoringType: 'periods',
      periodsConfig: { totalPeriods: 2, periodLabel: 'Tempo' },
    })
    setModName('')
  }

  return (
    <div>
      <h1 className="text-lg font-display font-bold mb-4">Turmas e modalidades</h1>

      <Card className="mb-4">
        <p className="text-sm font-semibold mb-2">Nova turma</p>
        <form onSubmit={handleCreateClass} className="space-y-2">
          <div className="flex gap-2">
            <input
              value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Ex.: 3º Info A" required
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              type="color" value={classColor} onChange={(e) => setClassColor(e.target.value)}
              className="w-12 rounded-xl border border-slate-200"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="url" value={classLogoUrl} onChange={(e) => setClassLogoUrl(e.target.value)}
              placeholder="URL da logo da turma (opcional — ex.: link do Imgur)"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <Button type="submit">+</Button>
          </div>
          <p className="text-xs text-slate-400">
            Sem logo? A turma aparece com o escudo padrão: círculo na cor escolhida + sigla.
          </p>
        </form>
        <div className="flex flex-wrap gap-2 mt-3">
          {classes.map((c) => (
            <span key={c.id} className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full text-white" style={{ backgroundColor: c.color }}>
              {c.logoUrl && <img src={c.logoUrl} alt="" className="w-4 h-4 rounded-full object-cover bg-white" />}
              {c.name}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-sm font-semibold mb-2">Nova modalidade</p>
        <form onSubmit={handleCreateModality} className="flex gap-2">
          <input
            value={modName} onChange={(e) => setModName(e.target.value)} placeholder="Ex.: Futsal Masculino" required
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <Button type="submit">+</Button>
        </form>
        <div className="flex flex-wrap gap-2 mt-3">
          {modalities.map((m) => (
            <span key={m.id} className="text-xs px-2 py-1 rounded-full bg-slate-100">{m.name}</span>
          ))}
        </div>
      </Card>
    </div>
  )
}
