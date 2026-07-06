export default function Header({ title, subtitle }) {
  return (
    <header className="px-4 pt-6 pb-2">
      <h1 className="headline text-2xl text-brand-navy">{title}</h1>
      {subtitle && <p className="text-sm text-brand-steel mt-1">{subtitle}</p>}
    </header>
  )
}
