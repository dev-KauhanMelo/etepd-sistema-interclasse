import { NavLink } from 'react-router-dom'
import { HomeIcon, BarsIcon, NodesIcon, ClockIcon, TrophyIcon } from '../common/Icons'

const items = [
  { to: '/', label: 'Início', Icon: HomeIcon },
  { to: '/placar', label: 'Placar', Icon: BarsIcon },
  { to: '/bolao', label: 'Bolão', Icon: NodesIcon },
  { to: '/horarios', label: 'Horários', Icon: ClockIcon },
  { to: '/ranking', label: 'Ranking', Icon: TrophyIcon },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-brand-mist/30 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-lg mx-auto flex justify-around py-1.5">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl text-[11px] font-semibold transition ${
                isActive ? 'text-brand' : 'text-brand-steel/70 hover:text-brand-steel'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`px-3 py-0.5 rounded-full transition ${isActive ? 'bg-brand/10' : ''}`}>
                  <Icon className="w-5 h-5" />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
