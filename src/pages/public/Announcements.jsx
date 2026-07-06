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
      <Header title="Avisos" subtitle="Comunicados da comissão JIPD" />
      <div className="p-4 pt-2">
        {announcements.length === 0 ? (
          <EmptyState title="Nenhum aviso por aqui" subtitle="Quando a comissão publicar algo, aparece aqui" />
        ) : (
          announcements.map((a, i) => (
            <Card key={a.id} className={`mb-3 border-l-4 animate-pop-in ${i === 0 ? 'border-l-brand' : 'border-l-brand-mist/60'}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-sm text-brand-deep">{a.title}</p>
                {i === 0 && (
                  <span className="shrink-0 bg-brand/10 text-brand text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Novo</span>
                )}
              </div>
              <p className="text-sm text-brand-steel mt-1">{a.message}</p>
              <p className="text-xs text-brand-mist mt-2">{formatDateTime(a.createdAt)}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
