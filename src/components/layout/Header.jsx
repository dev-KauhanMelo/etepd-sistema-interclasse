import BackButton from '../common/BackButton'

export default function Header({ title, subtitle, back = true }) {
  return (
    <header className="px-4 pt-5 pb-2 flex items-center gap-3">
      {back && <BackButton />}
      <div className="min-w-0">
        <h1 className="headline text-2xl text-brand-navy">{title}</h1>
        {subtitle && <p className="text-sm text-brand-steel mt-0.5">{subtitle}</p>}
      </div>
    </header>
  )
}
