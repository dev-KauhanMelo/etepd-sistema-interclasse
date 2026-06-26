export default function Loader({ label = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-brand rounded-full animate-spin mb-3" />
      <span className="text-sm">{label}</span>
    </div>
  )
}
