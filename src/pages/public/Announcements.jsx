import Header from '../../components/layout/Header'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import { useAnnouncements } from '../../hooks/useAnnouncements'
import { formatDateTime } from '../../utils/formatDate'

export default function Announcements() {
  const { announcements, loading } = useAnnouncements()
  if (loading) return <Loader />

  return (
    <div>
      <Header title="AVISOS" subtitle="Comunicados da comissão JIPD" />
      <div className="p-4 pt-2">
        {announcements.length === 0 ? (
          <EmptyState title="Nenhum aviso por aqui" subtitle="Quando a comissão publicar algo, aparece aqui" />
        ) : (
          announcements.map((a, i) => (
            <div
              key={a.id}
              className={`cut-corner bg-arena-panel border p-4 mb-3 animate-pop-in ${
                i === 0 ? 'border-gold/40' : 'border-white/[0.07]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-bracket font-bold text-sm text-white">{a.title}</p>
                {i === 0 && (
                  <span className="shrink-0 bg-gold text-brand-ink font-bracket font-bold text-[10px] tracking-[0.08em] px-2 py-0.5 uppercase">
                    Novo
                  </span>
                )}
              </div>
              <p className="text-sm text-arena-muted mt-1 leading-snug">{a.message}</p>
              <p className="font-bracket font-semibold text-xs text-arena-dim mt-2 uppercase tracking-wide">{formatDateTime(a.createdAt)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
