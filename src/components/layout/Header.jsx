import BackButton from '../common/BackButton'

// Cabeçalho das telas públicas (Modo Arena): título Anton, sub Rajdhani.
export default function Header({ title, subtitle, back = true }) {
  return (
    <header className="px-4 pt-5 pb-2 flex items-center gap-3">
      {back && <BackButton />}
      <div className="min-w-0">
        <h1 className="font-varsity text-[30px] text-white tracking-[0.03em] leading-none">{title}</h1>
        {subtitle && (
          <p className="font-body font-medium text-[13px] text-arena-muted mt-1 tracking-[0.06em]">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  )
}
