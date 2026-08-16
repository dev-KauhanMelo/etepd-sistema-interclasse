// Cada modalidade decide COMO é classificada. São quatro formatos:
//
// 'classico'  — pontos corridos (V/E/D + saldo). Fase de grupos.
// 'pontos'    — Free Fire / LBFF: pontos, booyah e abates.
// 'tempo'     — Cubo Mágico: 3 tentativas cronometradas; vence a MENOR média.
// 'mata-mata' — não tem tabela nenhuma; quem manda é o chaveamento.

// ===== Tempo (Cubo Mágico) =====
// Edital 7.8: cada participante tem 3 tentativas e, ao final, vale a MÉDIA
// dos tempos já com as penalidades (+2s por estourar os 15s de análise, +2s
// por parar o cronômetro antes de concluir — cumulativas). Menor média vence;
// empate se decide pela menor tentativa individual.
export const ROUND_KEYS = ['round1', 'round2', 'round3']

export function roundAverage(row) {
  const times = ROUND_KEYS.map((k) => Number(row?.[k]) || 0).filter((t) => t > 0)
  if (times.length === 0) return null
  return times.reduce((a, b) => a + b, 0) / times.length
}

export function bestRound(row) {
  const times = ROUND_KEYS.map((k) => Number(row?.[k]) || 0).filter((t) => t > 0)
  return times.length ? Math.min(...times) : null
}

// 45.28 -> "45.28" · 83.4 -> "1:23.40" (o cubo é cronometrado em centésimos)
export function formatTime(sec) {
  const s = Number(sec)
  if (!s || s <= 0) return '—'
  if (s < 60) return s.toFixed(2)
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toFixed(2).padStart(5, '0')}`
}

export function sortStandings(rows, format = 'classico') {
  const list = [...rows]

  if (format === 'pontos') {
    list.sort((a, b) =>
      (b.points || 0) - (a.points || 0) ||
      (b.booyahs || 0) - (a.booyahs || 0) ||
      (b.kills || 0) - (a.kills || 0)
    )
    return list
  }

  if (format === 'tempo') {
    // Menor média primeiro. Quem ainda não tem tempo vai para o fim da lista
    // (não é "melhor" que ninguém, só não competiu ainda).
    list.sort((a, b) => {
      const ma = roundAverage(a)
      const mb = roundAverage(b)
      if (ma === null && mb === null) return 0
      if (ma === null) return 1
      if (mb === null) return -1
      if (ma !== mb) return ma - mb
      // desempate do edital: a melhor tentativa individual
      return (bestRound(a) ?? Infinity) - (bestRound(b) ?? Infinity)
    })
    return list
  }

  list.sort((a, b) =>
    (b.points || 0) - (a.points || 0) ||
    (((b.scoredFor || 0) - (b.scoredAgainst || 0)) - ((a.scoredFor || 0) - (a.scoredAgainst || 0))) ||
    (b.wins || 0) - (a.wins || 0)
  )
  return list
}

// Campos que o admin edita em cada formato. `key` é o nome do campo no
// Firestore; `short` é o cabeçalho da tabela do aluno.
export const POINTS_FIELDS = [
  { key: 'points', label: 'Pontos', short: 'P' },
  { key: 'booyahs', label: 'Booyah', short: 'B!' },
  { key: 'kills', label: 'Abates', short: 'A' },
]

export const CLASSIC_FIELDS = [
  { key: 'points', label: 'Pontos', short: 'P' },
  { key: 'wins', label: 'Vitórias', short: 'V' },
  { key: 'draws', label: 'Empates', short: 'E' },
  { key: 'losses', label: 'Derrotas', short: 'D' },
]

// Tempos em segundos, com centésimos (é o que o Twisty Timer mostra)
export const TIME_FIELDS = [
  { key: 'round1', label: 'Round 1', short: 'R1', decimal: true },
  { key: 'round2', label: 'Round 2', short: 'R2', decimal: true },
  { key: 'round3', label: 'Round 3', short: 'R3', decimal: true },
]

export function fieldsFor(format) {
  if (format === 'pontos') return POINTS_FIELDS
  if (format === 'tempo') return TIME_FIELDS
  return CLASSIC_FIELDS
}

// Modalidade de mata-mata puro não tem tabela — só chaveamento.
export const hasTable = (format) => format !== 'mata-mata'
