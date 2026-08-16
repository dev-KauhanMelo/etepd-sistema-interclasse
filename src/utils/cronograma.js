// ===== Cronograma oficial do JIPD 2026 =====
// Fonte: grade divulgada pela Comissão JIPD (Dia 1 a Dia 5) + datas do edital.
// Os jogos acontecem em DOIS lugares: a própria escola (ETE Porto Digital,
// dias 1 e 2) e a UNIBRA (dias 3 a 5, as modalidades de quadra).
//
// Esta grade é a "programação" do evento: que modalidade rola em qual espaço,
// em qual dia. Não são confrontos (turma × turma) — esses ficam na coleção
// `matches`, cadastrados no admin conforme a Comissão sorteia.

export const VENUES = {
  pd: {
    id: 'pd',
    name: 'ETE Porto Digital',
    short: 'ETE PD',
    hint: 'Na escola',
    spaces: ['Sala 1', 'Sala 2', 'Sala 3', 'Sala 4', 'Quadra', 'Área externa', 'Janelão 1º andar', 'Janelão 2º andar', 'Auditório'],
  },
  unibra: {
    id: 'unibra',
    name: 'UNIBRA',
    short: 'UNIBRA',
    hint: 'Fora da escola',
    spaces: ['Quadra 1', 'Quadra 2', 'Ginásio'],
  },
}

export const VENUE_LIST = Object.values(VENUES)

// Horário oficial do evento (edital, item 1.2)
export const EVENT_HOURS = { start: '08h00', end: '16h40' }

// Categoria de cada disputa — vira a etiqueta colorida na grade.
export const CATEGORY = {
  masc: { label: 'Masculino', short: 'MASC' },
  fem: { label: 'Feminino', short: 'FEM' },
  misto: { label: 'Misto', short: 'MISTO' },
  ambos: { label: 'Fem + Masc', short: 'FEM/MASC' },
}

// A grade. `slots` é a ordem em que as modalidades ocupam aquele espaço no dia.
export const CRONOGRAMA = [
  {
    day: 1,
    date: '2026-08-17',
    venue: 'pd',
    spaces: [
      { space: 'Sala 1', slots: [{ name: 'Uno' }, { name: 'Dama' }] },
      { space: 'Sala 2', slots: [{ name: 'Mortal Kombat' }, { name: 'Free Fire' }] },
      { space: 'Sala 3', slots: [{ name: 'Clash Royale' }, { name: 'Brawl Stars' }] },
      { space: 'Sala 4', slots: [{ name: 'Xadrez' }, { name: 'Cubo Mágico' }] },
      { space: 'Quadra', slots: [{ name: 'Basquete', category: 'fem' }, { name: 'Basquete', category: 'masc' }] },
      { space: 'Área externa', slots: [{ name: 'Quadrado de Vôlei', category: 'fem' }] },
      { space: 'Janelão 1º andar', slots: [{ name: 'Tótó', category: 'masc' }] },
      { space: 'Janelão 2º andar', slots: [{ name: 'Ping Pong', category: 'masc' }] },
      { space: 'Auditório', slots: [{ name: 'Just Dance' }] },
    ],
  },
  {
    day: 2,
    date: '2026-08-18',
    venue: 'pd',
    spaces: [
      { space: 'Sala 1', slots: [{ name: 'FIFA' }, { name: 'E-football Mobile' }] },
      { space: 'Sala 2', slots: [{ name: 'Truco' }] },
      { space: 'Sala 3', slots: [{ name: 'Wild Rift' }, { name: 'Call of Duty' }] },
      { space: 'Sala 4', slots: [{ name: 'Dominó' }] },
      { space: 'Quadra', slots: [{ name: 'Futmesa', category: 'fem' }, { name: 'Futmesa', category: 'masc' }] },
      { space: 'Área externa', slots: [{ name: 'Quadrado de Vôlei', category: 'masc' }] },
      { space: 'Janelão 1º andar', slots: [{ name: 'Tótó', category: 'fem' }] },
      { space: 'Janelão 2º andar', slots: [{ name: 'Ping Pong', category: 'fem' }] },
      { space: 'Auditório', slots: [{ name: 'Barra Bandeira', category: 'misto' }] },
    ],
  },
  {
    day: 3,
    date: '2026-08-19',
    venue: 'unibra',
    spaces: [
      { space: 'Ginásio', slots: [{ name: 'Voleibol', category: 'ambos' }, { name: 'Queimado', category: 'misto' }] },
    ],
  },
  {
    day: 4,
    date: '2026-08-20',
    venue: 'unibra',
    spaces: [
      { space: 'Ginásio', slots: [{ name: 'Handebol', category: 'ambos' }, { name: 'Queimado', category: 'misto' }] },
    ],
  },
  {
    day: 5,
    date: '2026-08-21',
    venue: 'unibra',
    spaces: [
      { space: 'Ginásio', slots: [{ name: 'Futsal', category: 'ambos' }] },
    ],
  },
]

// Nome do dia da semana + data, do jeito que o aluno lê ("Seg · 17/08")
export function dayLabel(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`)
  const week = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
  return `${week.charAt(0).toUpperCase()}${week.slice(1)} · ${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
}

export const isPastDay = (dateStr) => new Date(`${dateStr}T23:59:59`) < new Date()
export const isCurrentDay = (dateStr) => new Date(`${dateStr}T12:00:00`).toDateString() === new Date().toDateString()

// ===== Chaveamento feminino de Esportes: FASE DE GRUPOS =====
// Edital 3.3: as modalidades femininas de Esportes (menos Handebol, Queimado
// e Barra Bandeira, que são mata-mata) são disputadas em fase de grupos, e as
// DUAS melhores vão para a final.
// Edital 5.1: por causa da baixa adesão, turmas da mesma série podem se unir —
// por isso as equipes aqui são "Primeirão", "Terceirão", "2ºA" e "2ºB/2ºC".
export const FEMININO_TEAMS = [
  { id: 'primeirao', name: 'Primeirão', hint: '1º ano (turmas unidas)' },
  { id: 'terceirao', name: 'Terceirão', hint: '3º ano (turmas unidas)' },
  { id: '2a', name: '2ºA', hint: '2º ano A' },
  { id: '2bc', name: '2ºB/2ºC', hint: '2ºB + 2ºC (turmas unidas)' },
]

export const FEMININO_RODADAS = [
  { round: 1, label: '1ª Rodada', games: [['primeirao', 'terceirao'], ['2a', '2bc']] },
  { round: 2, label: '2ª Rodada', games: [['2bc', 'primeirao'], ['terceirao', '2a']] },
  { round: 3, label: '3ª Rodada', games: [['terceirao', '2bc'], ['primeirao', '2a']] },
]

export const femininoTeam = (id) => FEMININO_TEAMS.find((t) => t.id === id)
