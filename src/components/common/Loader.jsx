export default function Loader({ label = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-arena-muted">
      <div className="w-9 h-9 border-4 border-arena-muted/30 border-t-gold rounded-full animate-spin mb-3" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}
