import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando...</div>
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />

  return children
}
