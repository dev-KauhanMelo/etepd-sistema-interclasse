export default function EmptyState({ title, subtitle }) {
  return (
    <div className="text-center py-12 px-4">
      <p className="text-slate-700 font-semibold">{title}</p>
      {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
    </div>
  )
}
