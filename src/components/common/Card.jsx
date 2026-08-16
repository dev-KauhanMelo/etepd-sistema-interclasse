// Elevação declarada UMA vez: a sombra carrega a profundidade, então a borda
// fica só como um fio para separar o card do fundo claro sem virar contorno.
export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-card ring-1 ring-brand-mist/15 p-4 ${className}`}>
      {children}
    </div>
  )
}
