import { formatDayHeader } from './formatDate'

// Busca "sem frescura": ignora acentos e maiúsculas, e casa qualquer pedaço
// do texto. Digitar "3b", "quadra" ou "futsal" tem que achar o jogo.
function normalize(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

// Tudo que é pesquisável num jogo: as duas turmas, o local, a fase e o nome
// da modalidade (passado de fora, porque o jogo só guarda o id).
function haystack(match, modalityName) {
  return normalize([
    match.teamA?.name,
    match.teamB?.name,
    match.location,
    match.phase,
    match.group,
    modalityName,
  ].filter(Boolean).join(' '))
}

// Cada palavra digitada precisa aparecer em algum lugar do jogo — assim
// "3b quadra" acha o jogo do 3º B na quadra, em qualquer ordem.
export function matchesQuery(match, queryText, modalityName) {
  const q = normalize(queryText)
  if (!q) return true
  const hay = haystack(match, modalityName)
  return q.split(' ').every((term) => hay.includes(term))
}

// Filtro completo: texto + modalidade + status, na mesma passada.
export function filterMatches(matches, { query = '', modalityId = 'all', status = 'all', modalities = [] } = {}) {
  const nameById = Object.fromEntries(modalities.map((m) => [m.id, m.name]))
  return matches.filter((m) => {
    if (modalityId !== 'all' && m.modalityId !== modalityId) return false
    if (status !== 'all' && m.status !== status) return false
    return matchesQuery(m, query, nameById[m.modalityId])
  })
}

// Agrupa por dia mantendo a ordem cronológica que veio do banco.
export function groupByDay(matches) {
  const groups = []
  for (const m of matches) {
    const key = formatDayHeader(m.scheduledAt)
    const last = groups[groups.length - 1]
    if (last && last.key === key) last.items.push(m)
    else groups.push({ key, items: [m] })
  }
  return groups
}

// EM ANDAMENTO = ao vivo OU pausado
//
// Pausa é intervalo, troca de set, discussão de regra — a partida não acabou e
// o time continua na quadra. Sumir da tela de ao vivo nesse momento é
// justamente quando o aluno abre o site pra saber o que está acontecendo.
// Tudo que decide "este jogo está rolando" passa por aqui, pra não voltar a
// divergir de tela pra tela.
export const EM_ANDAMENTO = ['live', 'paused']

export const emAndamento = (match) => EM_ANDAMENTO.includes(match?.status)
export const estaPausado = (match) => match?.status === 'paused'
