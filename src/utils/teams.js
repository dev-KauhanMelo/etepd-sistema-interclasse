// Cada jogo guarda uma cópia dos dados da turma (nome, cor, escudo) do momento
// em que foi cadastrado. Isso é bom para o histórico, mas significa que mudar
// a cor ou a foto de uma turma no admin NÃO reflete nos jogos já criados —
// foi assim que os cards ao vivo continuaram com o azul antigo depois que as
// turmas ganharam as cores das bandeiras.
//
// Aqui a cópia é reidratada com o cadastro atual na hora da leitura: o
// snapshot vira só um fallback para turma que não existe mais.
export function freshTeam(team, classes) {
  if (!team?.classId || !classes?.length) return team
  const cls = classes.find((c) => c.id === team.classId)
  if (!cls) return team
  return {
    ...team,
    name: cls.name || team.name,
    color: cls.color || team.color,
    logoUrl: cls.logoUrl ?? team.logoUrl,
  }
}

export function freshMatch(match, classes) {
  if (!match) return match
  return {
    ...match,
    teamA: freshTeam(match.teamA, classes),
    teamB: freshTeam(match.teamB, classes),
  }
}
