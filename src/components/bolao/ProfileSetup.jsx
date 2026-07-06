import { useState } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'
import { NodesIcon } from '../common/Icons'
import { useClasses } from '../../hooks/useClasses'
import { saveFanProfile } from '../../utils/fanProfile'

// Primeiro acesso ao Bolão: a pessoa diz o nome e a turma.
// Fica salvo no navegador, sem senha e sem cadastro chato.
export default function ProfileSetup({ onDone }) {
  const { classes } = useClasses()
  const [name, setName] = useState('')
  const [className, setClassName] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (name.trim().length < 2) return
    onDone(saveFanProfile({ name, className }))
  }

  return (
    <Card className="animate-pop-in">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center">
          <NodesIcon className="w-5 h-5 text-brand" />
        </div>
        <div>
          <p className="font-display font-extrabold text-brand-deep">Entre no Bolão JIPD</p>
          <p className="text-xs text-brand-steel">Diga quem é você pra começar a palpitar. Sem senha, sem enrolação.</p>
        </div>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome (ou apelido)"
          maxLength={40}
          required
          className="w-full rounded-xl border border-brand-mist/50 bg-brand-paper/50 px-3 py-2.5 text-sm focus:outline-none focus:border-brand"
        />
        <select
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className="w-full rounded-xl border border-brand-mist/50 bg-brand-paper/50 px-3 py-2.5 text-sm focus:outline-none focus:border-brand"
        >
          <option value="">Sua turma (opcional)</option>
          {classes.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <Button type="submit" className="w-full">Começar a palpitar 🔥</Button>
      </form>
    </Card>
  )
}
