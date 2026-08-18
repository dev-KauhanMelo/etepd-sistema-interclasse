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

// Alguns jogos entram no sistema com o dia e o local certos, mas sem hora:
// a Comissão divulga a ordem das modalidades, não o horário de cada partida.
// Nesses casos o jogo carrega `timeTBD: true` e a tela diz "a definir" em vez
// de mostrar um horário inventado — o aluno se organiza pelo dia e pelo local.
// Jogo sem hora marcada deixa de ser "a definir" no instante em que a bola
// rola: quem aperta COMEÇAR JOGO grava a hora do toque em `startedAt`, e ela
// passa a ser a hora do jogo. É mais honesto que um horário combinado que
// ninguém cumpriu, e resolve sozinho — a comissão não digita nada.
export const isTimeTBD = (match) => !!match?.timeTBD && !match?.startedAt

export function matchTime(match) {
  if (match?.startedAt) return formatTime(match.startedAt)
  if (isTimeTBD(match)) return 'a def.'
  return formatTime(match?.scheduledAt)
}

export function matchDateTime(match) {
  const base = match?.startedAt || match?.scheduledAt
  if (!base) return '-'
  const date = base.toDate ? base.toDate() : new Date(base)
  const dia = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
  if (match?.startedAt) return `${dia} · começou ${formatTime(match.startedAt)}`
  return isTimeTBD(match) ? `${dia} · horário a definir` : formatDateTime(match.scheduledAt)
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
