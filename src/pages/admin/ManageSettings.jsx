import { useEffect, useState } from 'react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { useEventSettings } from '../../hooks/useEventSettings'
import { saveEventSettings } from '../../services/settingsService'

// Converte Date -> valor aceito pelo input datetime-local (fuso local)
function toInputValue(date) {
  if (!date) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function ManageSettings() {
  const { settings, loading } = useEventSettings()
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    if (!loading) {
      setStart(toInputValue(settings?.startAt?.toDate ? settings.startAt.toDate() : null))
      setEnd(toInputValue(settings?.endAt?.toDate ? settings.endAt.toDate() : null))
    }
  }, [loading]) // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFeedback('')
    try {
      await saveEventSettings({
        startAt: start ? new Date(start) : null,
        endAt: end ? new Date(end) : null,
      })
      setFeedback('Salvo! ✅')
    } catch (err) {
      setFeedback(`Erro ao salvar: ${err.message}`)
    }
    setSaving(false)
  }

  return (
    <div className="max-w-md">
      <h1 className="text-lg font-display font-bold mb-1">Configurações do evento</h1>
      <p className="text-sm text-slate-400 mb-4">
        Antes da data de início, os estudantes veem a tela de abertura do JIPD com contagem
        regressiva no lugar do site. Deixe em branco pra liberar o acesso sempre.
      </p>

      <Card>
        <form onSubmit={save} className="space-y-4">
          <label className="block text-sm">
            <span className="font-medium text-slate-600">Início dos jogos</span>
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-600">Fim dos jogos</span>
            <input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <Button type="submit" disabled={saving || loading}>
            {saving ? 'Salvando...' : 'Salvar período'}
          </Button>
          {feedback && <p className="text-sm text-slate-500">{feedback}</p>}
        </form>
      </Card>
    </div>
  )
}
