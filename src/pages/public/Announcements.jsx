import Header from '../../components/layout/Header'
import Card from '../../components/common/Card'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import { useAnnouncements } from '../../hooks/useAnnouncements'
import { formatDateTime } from '../../utils/formatDate'

export default function Announcements() {
  const { announcements, loading } = useAnnouncements()
  if (loading) return <Loader />

  return (
    <div>
      <Header title="Avisos" />
      <div className="p-4">
        {announcements.length === 0 ? (
          <EmptyState title="Nenhum aviso por aqui" />
        ) : (
          announcements.map((a) => (
            <Card key={a.id} className="mb-3">
              <p className="font-semibold text-sm">{a.title}</p>
              <p className="text-sm text-slate-500 mt-1">{a.message}</p>
              <p className="text-xs text-slate-300 mt-2">{formatDateTime(a.createdAt)}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}