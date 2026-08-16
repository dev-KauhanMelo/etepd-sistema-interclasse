import { ListIcon } from './Icons'

// "Ver mais" das listas longas. Com vários jogos rolando ao mesmo tempo, a
// tela virava uma rolagem sem fim — a lista mostra as primeiras e o resto
// fica atrás de um toque, com o total à mostra pra ninguém achar que sumiu.
export default function ShowMore({ hidden, onClick, label = 'Ver todos' }) {
  if (hidden <= 0) return null
  return (
    <button
      onClick={onClick}
      className="w-full cut-corner-sm bg-arena-panel border border-white/10 py-2.5 mt-1 flex items-center justify-center gap-2 font-bracket font-bold text-xs tracking-[0.1em] uppercase text-arena-muted hover:text-white hover:border-gold/40 transition"
    >
      <ListIcon className="w-4 h-4" />
      {label} · +{hidden}
    </button>
  )
}
