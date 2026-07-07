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
      className={`shrink-0 w-9 h-9 rounded-xl bg-white border border-brand-mist/40 shadow-card flex items-center justify-center text-brand-deep active:scale-90 transition ${className}`}
    >
      <ArrowLeftIcon className="w-5 h-5" />
    </button>
  )
}
