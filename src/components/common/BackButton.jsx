import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from './Icons'

// Setinha de voltar pra tela anterior. Se a pessoa chegou por link
// direto (sem histórico), volta pra Home em vez de sair do site.
export default function BackButton({ className = '' }) {
  const navigate = useNavigate()
  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate('/'))

  return (
    <button
      onClick={goBack}
      aria-label="Voltar"
      className={`shrink-0 w-9 h-9 cut-corner-sm bg-arena-panel border border-white/10 flex items-center justify-center text-gold active:scale-90 transition ${className}`}
    >
      <ArrowLeftIcon className="w-5 h-5" />
    </button>
  )
}
