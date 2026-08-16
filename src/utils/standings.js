// Ordenação da classificação — o critério muda conforme o formato da modalidade.
//
// 'pontos' (Free Fire / LBFF): soma de pontos manda. Empatou? Quem tem mais
// booyah sobe; persistindo, mais abates. É o mesmo desempate da LBFF.
// 'classico': pontos, depois saldo (gols pró − contra), depois vitórias.
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

export const fieldsFor = (format) => (format === 'pontos' ? POINTS_FIELDS : CLASSIC_FIELDS)