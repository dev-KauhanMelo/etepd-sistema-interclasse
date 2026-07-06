export default function EmptyState({ title, subtitle, icon = null }) {
  return (
    <div className="text-center py-12 px-4 animate-pop-in">
      {icon && <div className="flex justify-center mb-3 text-brand-mist">{icon}</div>}
      <p className="text-brand-deep font-display font-bold">{title}</p>
      {subtitle && <p className="text-brand-steel text-sm mt-1">{subtitle}</p>}
    </div>
  )
}
