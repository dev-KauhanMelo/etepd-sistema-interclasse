import { useState } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'
import { useClasses } from '../../hooks/useClasses'
import { useModalities } from '../../hooks/useModalities'
import { createMatch, updateMatch } from '../../services/matchesService'
import { useAuth } from '../../context/AuthContext'

function toInputDate(ts) {
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

export default function MatchForm({ match, onClose }) {
  const { classes } = useClasses()
  const { modalities } = useModalities()
  const { user } = useAuth()

  const [form, setForm] = useState({
    modalityId: match?.modalityId || '',
    phase: match?.phase || 'grupos',
    group: match?.group || '',
    teamAId: match?.teamA?.classId || '',
    teamBId: match?.teamB?.classId || '',
    location: match?.location || '',
    scheduledAt: match?.scheduledAt ? toInputDate(match.scheduledAt) : '',
  })

  async function handleSubmit(e) {
    e.preventDefault()
    const teamA = classes.find((c) => c.id === form.teamAId)
    const teamB = classes.find((c) => c.id === form.teamBId)
    if (!teamA || !teamB) return

    const data = {
      modalityId: form.modalityId,
      phase: form.phase,
      group: form.group,
      teamA: { classId: teamA.id, name: teamA.name, color: teamA.color, logoUrl: teamA.logoUrl || null },
      teamB: { classId: teamB.id, name: teamB.name, color: teamB.color, logoUrl: teamB.logoUrl || null },
      location: form.location,
      scheduledAt: new Date(form.scheduledAt),
    }

    if (match) {
      await updateMatch(match.id, data, user?.uid)
    } else {
      await createMatch(data)
    }
    onClose()
  }

  return (
    <Card className="mb-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Select label="Modalidade" value={form.modalityId} onChange={(v) => setForm({ ...form, modalityId: v })}
          options={modalities.map((m) => ({ value: m.id, label: m.name }))} />
        <Select label="Fase" value={form.phase} onChange={(v) => setForm({ ...form, phase: v })}
          options={['grupos', 'oitavas', 'quartas', 'semifinal', 'final'].map((p) => ({ value: p, label: p }))} />
        <Select label="Turma A" value={form.teamAId} onChange={(v) => setForm({ ...form, teamAId: v })}
          options={classes.map((c) => ({ value: c.id, label: c.name }))} />
        <Select label="Turma B" value={form.teamBId} onChange={(v) => setForm({ ...form, teamBId: v })}
          options={classes.map((c) => ({ value: c.id, label: c.name }))} />
        <Input label="Local" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
        <Input label="Data e hora" type="datetime-local" value={form.scheduledAt} onChange={(v) => setForm({ ...form, scheduledAt: v })} />

        <div className="flex gap-2 pt-2">
          <Button type="submit">Salvar</Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
        </div>
      </form>
    </Card>
  )
}

function Input({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1">{label}</label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} required
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
      />
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} required
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
        <option value="">Selecione</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
