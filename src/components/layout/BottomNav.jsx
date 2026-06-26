import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Início', icon: '🏠' },
  { to: '/placar', label: 'Placar', icon: '🔴' },
  { to: '/horarios', label: 'Horários', icon: '🗓️' },
  { to: '/ranking', label: 'Ranking', icon: '🏆' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around py-2 z-40">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium ${
              isActive ? 'text-brand' : 'text-slate-400'
            }`
          }
        >
          <span className="text-lg">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
