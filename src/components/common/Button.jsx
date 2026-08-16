import { cn } from '../../utils/cn'

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-xl font-semibold px-4 py-2.5 transition active:scale-95 disabled:opacity-50 disabled:active:scale-100'
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-dark shadow-sm',
    secondary: 'bg-brand-paper text-brand-deep border border-brand-mist/50 hover:bg-brand-mist/20',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'text-brand hover:bg-brand/10',
    // Modo Arena (site público): dourado, chanfrado, voz de display
    arena: 'bg-gold text-brand-ink font-varsity tracking-[0.06em] hover:brightness-95 !rounded-none cut-corner-sm',
  }
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  )
}
