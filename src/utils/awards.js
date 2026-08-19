// PONTUAÇÕES QUE NÃO VÊM DE JOGO (edital §9)
//
// Performance da abertura, Torcida e Ranking das Camisas somam ao placar geral
// junto com as medalhas (§9.5) — e pesam: a Performance sozinha vale 900 pontos
// no 1º lugar, mais que dois ouros de esporte. Sem elas o ranking geral está
// incompleto, por mais bem lançadas que estejam as medalhas.
//
// Aqui a colocação é de 1º a 9º (todas as turmas pontuam), e não pódio de três.

export const EXTRAS = [
  {
    key: 'performance',
    label: 'Performance',
    hint: 'Abertura do JIPD, avaliada por jurados externos (§9.2)',
    pontos: [900, 800, 700, 600, 500, 400, 300, 200, 100],
  },
  {
    key: 'torcida',
    label: 'Torcida',
    hint: 'Participação, organização e hino (§9.3)',
    pontos: [500, 450, 400, 350, 300, 250, 200, 150, 100],
  },
  {
    key: 'camisas',
    label: 'Camisas',
    hint: 'Design da camisa oficial da turma (§9.4)',
    pontos: [500, 450, 400, 350, 300, 250, 200, 150, 100],
  },
]

export const extraPorChave = (key) => EXTRAS.find((e) => e.key === key)

// Quanto cada turma fez nos extras. `awards` = [{ id, places: [classId...] }],
// onde a posição no array É a colocação (índice 0 = 1º lugar).
export function pontosDosExtras(awards = []) {
  const total = {}
  for (const a of awards) {
    const def = extraPorChave(a.id)
    if (!def) continue
    const places = Array.isArray(a.places) ? a.places : []
    places.forEach((classId, i) => {
      if (!classId) return
      total[classId] = (total[classId] || 0) + (def.pontos[i] || 0)
    })
  }
  return total
}
