import { useState } from 'react'
import Button from '../common/Button'
import { NodesIcon, FireIcon } from '../common/Icons'
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
    <div className="cut-corner bg-arena-panel border border-gold/25 p-4 animate-pop-in">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 cut-corner-sm bg-gold/15 flex items-center justify-center">
          <NodesIcon className="w-5 h-5 text-gold" />
        </div>
        <div>
          <p className="font-bracket-display text-base text-white tracking-wide">ENTRE NO BOLÃO JIPD</p>
          <p className="text-xs text-arena-muted">Diga quem é você pra começar a palpitar. Sem senha, sem enrolação.</p>
        </div>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome (ou apelido)"
          maxLength={40}
          required
          className="w-full cut-corner-sm border border-white/15 bg-white/5 text-arena-text placeholder:text-arena-muted/70 px-3 py-2.5 text-sm focus:outline-none focus:border-gold/60"
        />
        <select
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className="w-full cut-corner-sm border border-white/15 bg-white/5 text-arena-text placeholder:text-arena-muted/70 px-3 py-2.5 text-sm focus:outline-none focus:border-gold/60"
        >
          <option value="">Sua turma (opcional)</option>
          {classes.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <Button type="submit" variant="arena" className="w-full gap-1.5 py-3 text-[15px]">
          COMEÇAR A PALPITAR <FireIcon className="w-4 h-4 text-brand-ink" />
        </Button>
      </form>
    </div>
  )
}
