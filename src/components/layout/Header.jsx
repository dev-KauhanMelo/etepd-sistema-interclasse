export default function Header({ title, subtitle }) {
  return (
    <header className="px-4 pt-6 pb-4 bg-white border-b border-slate-100">
      <h1 className="text-xl font-display font-extrabold text-slate-900">{title}</h1>
      {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
    </header>
  )
}
