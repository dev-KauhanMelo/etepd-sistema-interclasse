export default function Loader({ label = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-brand-steel">
      <div className="w-9 h-9 border-4 border-brand-mist/40 border-t-brand rounded-full animate-spin mb-3" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}
