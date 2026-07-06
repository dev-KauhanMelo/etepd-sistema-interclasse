import { Link } from 'react-router-dom'
import { useMatches } from '../../hooks/useMatches'

// Barra fixa do topo: logo JIPD no canto esquerdo (volta pra Home)
// e um aviso pulsante quando tem jogo rolando agora.
export default function TopBar() {
  const { matches } = useMatches()
  const liveCount = matches.filter((m) => m.status === 'live').length

  return (
    <div className="jipd-gradient sticky top-0 z-50 shadow-md">
      <div className="max-w-lg mx-auto px-4 py-2.5 flex items-center justify-between">
        <Link to="/" aria-label="Ir para o início" className="flex items-center gap-2.5">
          <span className="bg-white rounded-xl p-1 shadow-sm">
            <img src="/jipd-logo.jpeg" alt="Logo JIPD" className="h-9 w-9 object-contain rounded-lg" />
          </span>
          <span className="headline text-lg text-white leading-none">JIPD</span>
        </Link>
        <div className="flex items-center gap-2">
          {liveCount > 0 ? (
            <Link
              to="/placar"
              className="flex items-center gap-1.5 bg-live/15 border border-live/40 text-red-300 text-xs font-bold px-2.5 py-1 rounded-full"
            >
              <span className="w-2 h-2 bg-live rounded-full pulse-live" />
              {liveCount} AO VIVO
            </Link>
          ) : (
            <span className="text-brand-mist font-display font-bold italic text-sm tracking-wider">2026</span>
          )}
        </div>
      </div>
    </div>
  )
}
