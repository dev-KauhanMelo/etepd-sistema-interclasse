export default function EmptyState({ title, subtitle, icon = null }) {
  return (
    <div className="text-center py-12 px-4 animate-pop-in">
      {icon && <div className="flex justify-center mb-3 text-arena-dim">{icon}</div>}
      <p className="font-bracket-display text-lg text-white tracking-wide">{title}</p>
      {subtitle && <p className="font-bracket font-semibold text-sm text-arena-muted mt-1">{subtitle}</p>}
    </div>
  )
}
