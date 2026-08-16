import { Link } from 'react-router-dom'
import { MegaphoneIcon } from '../common/Icons'
import { useMatches } from '../../hooks/useMatches'
import { useModalities } from '../../hooks/useModalities'
import { useAnnouncements } from '../../hooks/useAnnouncements'

// Barra fixa do topo (Modo Arena): logo branca + wordmark inclinada, megafone
// de avisos e — quando tem jogo rolando — o ticker dourado correndo embaixo.
export default function TopBar() {
  const { matches } = useMatches()
  const { modalities } = useModalities()
  const { announcements } = useAnnouncements()

  const live = matches.filter((m) => m.status === 'live')
  const modName = (id) => modalities.find((m) => m.id === id)?.name || ''

  // Uma frase por jogo ao vivo; o marquee repete o conjunto.
  const tickerItems = live.map(
    (m) =>
      `⚡ AO VIVO — ${modName(m.modalityId)}: ${m.teamA?.name} ${m.scoreA ?? 0} × ${m.scoreB ?? 0} ${m.teamB?.name} · ${m.location}`
  )

  return (
    <div className="sticky top-0 z-50 bg-arena-deep shadow-md">
      <div className="max-w-lg mx-auto px-4 py-2.5 flex items-center justify-between">
        <Link to="/" aria-label="Ir para o início" className="flex items-center gap-2.5">
          <img src="/jipd-logo-white.png" alt="Logo JIPD" className="h-9 w-auto block" />
          <span className="font-bracket-display text-[17px] text-white tracking-[0.05em] -skew-x-6">
            JIPD 2026
          </span>
        </Link>
        <Link
          to="/avisos"
          aria-label="Ver avisos"
          className="relative p-2 rounded-xl text-arena-muted hover:text-white hover:bg-white/10 transition"
        >
          <MegaphoneIcon className="w-5 h-5" />
          {announcements.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full" />
          )}
        </Link>
      </div>

      {/* Ticker AO VIVO: faixa dourada full-width, conteúdo duplicado pro
          marquee CSS fechar o loop. Clique leva ao Placar. */}
      {tickerItems.length > 0 && (
        <Link to="/placar" className="block bg-gold overflow-hidden" aria-label="Jogos ao vivo — abrir placar">
          <div className="ticker-track py-[5px]">
            {[0, 1].map((dup) => (
              <span
                key={dup}
                aria-hidden={dup === 1}
                className="font-bracket font-bold text-[11px] tracking-[0.1em] uppercase text-brand-ink px-4"
              >
                {tickerItems.join('   ·   ')}
              </span>
            ))}
          </div>
        </Link>
      )}
    </div>
  )
}
