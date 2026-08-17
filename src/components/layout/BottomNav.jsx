import { NavLink } from 'react-router-dom'
import { HomeIcon, BarsIcon, NodesIcon, ClockIcon, TrophyIcon } from '../common/Icons'

const items = [
  { to: '/', label: 'Início', Icon: HomeIcon },
  { to: '/placar', label: 'Placar', Icon: BarsIcon },
  { to: '/bolao', label: 'Bolão', Icon: NodesIcon },
  // "Tabela" fazia o pessoal procurar os jogos do dia no Bolão — em escola,
  // "tabela" é a classificação, não a lista de jogos.
  { to: '/horarios', label: 'Jogos', Icon: ClockIcon },
  { to: '/ranking', label: 'Ranking', Icon: TrophyIcon },
]

// Navegação de baixo (Modo Arena): fundo quase-preto, fio dourado no topo,
// item ativo em dourado com um losango aceso acima do ícone.
export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-arena-deep border-t border-gold/[0.18] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-lg mx-auto flex justify-around pt-2 pb-2.5">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-[3px] px-2 font-bracket font-bold text-[10px] tracking-[0.1em] uppercase transition ${
                isActive ? 'text-gold' : 'text-arena-dim hover:text-arena-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  aria-hidden="true"
                  className={`w-1.5 h-1.5 rotate-45 ${isActive ? 'bg-gold' : 'bg-transparent'}`}
                />
                <Icon className="w-5 h-5" />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
