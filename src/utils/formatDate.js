export function formatDateTime(timestamp) {
  if (!timestamp) return '-'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(timestamp) {
  if (!timestamp) return '-'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function formatShortDate(timestamp) {
  if (!timestamp) return '-'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function formatDayHeader(timestamp) {
  if (!timestamp) return 'Data a definir'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const text = date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function isToday(timestamp) {
  if (!timestamp) return false
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}
