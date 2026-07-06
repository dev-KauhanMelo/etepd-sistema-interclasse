export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-card border border-brand-mist/25 p-4 ${className}`}>
      {children}
    </div>
  )
}
