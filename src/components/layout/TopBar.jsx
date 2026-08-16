import { Link } from 'react-router-dom'
import { MegaphoneIcon } from '../common/Icons'
import { useMatches } from '../../hooks/useMatches'
import { useAnnouncements } from '../../hooks/useAnnouncements'

// Barra fixa do topo: logo JIPD no canto esquerdo (volta pra Home),
// botão de avisos sempre à mão e indicador pulsante de jogo ao vivo.
export default function TopBar() {
  const { matches } = useMatches()
  const { announcements } = useAnnouncements()
  const liveCount = matches.filter((m) => m.status === 'live').length

  return (
    <div className="jipd-gradient sticky top-0 z-50 shadow-md">
      <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-between">
        <Link to="/" aria-label="Ir para o início" className="flex items-center gap-2.5">
          {/* A logo é uma marca escura: sobre o gradiente azul ela sumia.
              O fundo claro devolve o contraste. */}
          <span className="bg-white rounded-lg px-1.5 py-1 flex items-center shrink-0">
            <img src="/jipd-logo.png" alt="Logo JIPD" className="h-8 w-auto block" />
          </span>
          <span className="headline text-lg text-white leading-none">JIPD</span>
        </Link>
        <div className="flex items-center gap-2">
          {liveCount > 0 && (
            <Link
              to="/placar"
              className="flex items-center gap-1.5 bg-live/15 border border-live/40 text-red-300 text-xs font-bold px-2.5 py-1 rounded-full"
            >
              <span className="w-2 h-2 bg-live rounded-full pulse-live" />
              {liveCount} AO VIVO
            </Link>
          )}
          <Link
            to="/avisos"
            aria-label="Ver avisos"
            className="relative p-2 rounded-xl text-brand-mist hover:text-white hover:bg-white/10 transition"
          >
            <MegaphoneIcon className="w-5 h-5" />
            {announcements.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full" />
            )}
          </Link>
        </div>
      </div>
    </div>
  )
}
