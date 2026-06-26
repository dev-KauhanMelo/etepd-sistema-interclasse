import { useState } from 'react'
import Card from '../../components/common/Card'
import { useModalities } from '../../hooks/useModalities'
import { useClasses } from '../../hooks/useClasses'
import { useStandings } from '../../hooks/useStandings'
import { upsertStanding } from '../../services/standingsService'

export default function ManageStandings() {
  const { modalities } = useModalities()
  const { classes } = useClasses()
  const [modalityId, setModalityId] = useState('')
  const activeModality = modalityId || modalities[0]?.id
  const { standings } = useStandings(activeModality)

  function getRow(classId) {
    return standings.find((s) => s.classId === classId) || {
      points: 0, wins: 0, draws: 0, losses: 0, scoredFor: 0, scoredAgainst: 0,
    }
  }

  async function handleSave(classId, field, value) {
    const row = getRow(classId)
    const cls = classes.find((c) => c.id === classId)
    await upsertStanding(activeModality, classId, { ...row, className: cls?.name, [field]: Number(value) })
  }

  return (
    <div>
      <h1 className="text-lg font-display font-bold mb-4">Ranking</h1>
      <select
        value={activeModality || ''}
        onChange={(e) => setModalityId(e.target.value)}
        className="w-full mb-4 rounded-xl border border-slate-200 px-3 py-2 text-sm"
      >
        {modalities.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>

      {classes.map((c) => {
        const row = getRow(c.id)
        return (
          <Card key={c.id} className="mb-2">
            <p className="text-sm font-medium mb-2">{c.name}</p>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {['points', 'wins', 'draws', 'losses'].map((field) => (
                <div key={field}>
                  <label className="text-slate-400 block mb-1 capitalize">{field}</label>
                  <input
                    type="number" defaultValue={row[field]}
                    onBlur={(e) => handleSave(c.id, field, e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1"
                  />
                </div>
              ))}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
