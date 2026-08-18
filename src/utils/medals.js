// RANKING GERAL POR MEDALHAS
//
// A campanha de uma turma no JIPD não é "quantos jogos ganhou" — é em quantas
// modalidades ela subiu no pódio. Vitória em fase de grupos não vale ponto
// geral; o que vale é terminar a modalidade em 1º, 2º ou 3º.
//
// Pontuação por colocação vem do edital (§10). Se a comissão mudar os valores,
// é aqui que se mexe — o resto do sistema lê daqui.
export const PONTOS_POR_COLOCACAO = {
  gold: 350,
  silver: 250,
  bronze: 150,
}

export const MEDALHAS = [
  { key: 'gold', label: 'Ouro', short: 'O', place: 1, color: '#F5C518' },
  { key: 'silver', label: 'Prata', short: 'P', place: 2, color: '#C5CEDB' },
  { key: 'bronze', label: 'Bronze', short: 'B', place: 3, color: '#CD7F32' },
]

// Monta o ranking geral a partir dos pódios lançados e das punições aplicadas.
//
// `podiums`: [{ id: modalityId, gold, silver, bronze }] — cada campo é um classId
// `penalties`: [{ classId, points }] — pontos a DESCONTAR (valor positivo desconta)
//
// Turma pode terminar com saldo negativo: uma punição grande sem medalha
// nenhuma deixa a turma abaixo de zero, e isso é resultado válido, não erro.
export function buildMedalRanking(podiums = [], penalties = [], classes = []) {
  const linhas = new Map()

  const linha = (classId) => {
    if (!classId) return null
    if (!linhas.has(classId)) {
      const cls = classes.find((c) => c.id === classId)
      linhas.set(classId, {
        id: classId,
        classId,
        className: cls?.name || classId,
        color: cls?.color,
        logoUrl: cls?.logoUrl,
        gold: 0, silver: 0, bronze: 0,
        earned: 0,      // pontos ganhos no pódio
        penalty: 0,     // pontos descontados
        points: 0,      // saldo final
      })
    }
    return linhas.get(classId)
  }

  // Toda turma cadastrada aparece, mesmo zerada — sumir da tabela por não ter
  // pontuado ainda faz parecer que a turma não está no evento.
  classes.forEach((c) => linha(c.id))

  for (const p of podiums) {
    for (const { key } of MEDALHAS) {
      const l = linha(p[key])
      if (!l) continue
      l[key] += 1
      l.earned += PONTOS_POR_COLOCACAO[key]
    }
  }

  for (const pen of penalties) {
    const l = linha(pen.classId)
    if (!l) continue
    l.penalty += Number(pen.points) || 0
  }

  const rows = [...linhas.values()]
  rows.forEach((l) => { l.points = l.earned - l.penalty })

  // Empate em pontos se desfaz por medalha mais valiosa, como em olimpíada.
  return rows.sort((a, b) =>
    b.points - a.points ||
    b.gold - a.gold ||
    b.silver - a.silver ||
    b.bronze - a.bronze ||
    String(a.className).localeCompare(String(b.className))
  )
}
