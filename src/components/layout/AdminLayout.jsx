import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Button from '../common/Button'

const links = [
  { to: '/admin', label: 'Painel' },
  { to: '/admin/jogos', label: 'Jogos' },
  { to: '/admin/ranking', label: 'Ranking' },
  { to: '/admin/avisos', label: 'Avisos' },
  { to: '/admin/cadastro', label: 'Turmas/Modalidades' },
  { to: '/admin/config', label: 'Configurações' },
]

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <span className="font-display font-bold">Admin · Interclasse</span>
        <Button
          variant="ghost"
          className="text-white text-sm"
          onClick={async () => { await logout(); navigate('/admin/login') }}
        >
          Sair
        </Button>
      </header>
      <nav className="bg-white border-b border-slate-100 px-4 flex gap-4 overflow-x-auto text-sm">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="py-3 whitespace-nowrap text-slate-600 hover:text-brand font-medium">
            {l.label}
          </Link>
        ))}
      </nav>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  )
}
