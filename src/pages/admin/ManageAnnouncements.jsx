import { useState } from 'react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { useAnnouncements } from '../../hooks/useAnnouncements'
import { createAnnouncement, deactivateAnnouncement } from '../../services/announcementsService'

export default function ManageAnnouncements() {
  const { announcements } = useAnnouncements()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    await createAnnouncement({ title, message, type: 'info' })
    setTitle('')
    setMessage('')
  }

  return (
    <div>
      <h1 className="text-lg font-display font-bold mb-4">Avisos</h1>
      <Card className="mb-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" required
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <textarea
            value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Mensagem" required rows={3}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <Button type="submit">Publicar</Button>
        </form>
      </Card>

      {announcements.map((a) => (
        <Card key={a.id} className="mb-2">
          <p className="text-sm font-semibold">{a.title}</p>
          <p className="text-sm text-slate-500">{a.message}</p>
          <button onClick={() => deactivateAnnouncement(a.id)} className="text-xs text-red-500 mt-2">Remover</button>
        </Card>
      ))}
    </div>
  )
}
