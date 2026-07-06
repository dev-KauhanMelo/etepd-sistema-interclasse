// Regras de pontuação do Bolão JIPD:
//   Cravou o placar exato  -> 5 pontos
//   Acertou o vencedor/empate -> 2 pontos
export const POINTS_EXACT = 5
export const POINTS_WINNER = 2

export function predictionPoints(pred, match) {
  const a = match.scoreA ?? 0
  const b = match.scoreB ?? 0
  if (pred.scoreA === a && pred.scoreB === b) return POINTS_EXACT
  const outcome = Math.sign(a - b)
  const predicted = Math.sign(pred.scoreA - pred.scoreB)
  return outcome === predicted ? POINTS_WINNER : 0
}

// Monta o ranking somando os pontos de todos os jogos já finalizados.
export function buildBolaoRanking(predictions, matches) {
  const finished = new Map(matches.filter((m) => m.status === 'finished').map((m) => [m.id, m]))
  const byUser = new Map()

  for (const pred of predictions) {
    const match = finished.get(pred.matchId)
    if (!byUser.has(pred.userId)) {
      byUser.set(pred.userId, {
        userId: pred.userId,
        name: pred.userName,
        className: pred.userClass,
        points: 0,
        exact: 0,
        hits: 0,
        total: 0,
      })
    }
    const row = byUser.get(pred.userId)
    if (!match) continue
    const pts = predictionPoints(pred, match)
    row.total += 1
    row.points += pts
    if (pts === POINTS_EXACT) row.exact += 1
    if (pts > 0) row.hits += 1
  }

  return [...byUser.values()].sort(
    (x, y) => (y.points - x.points) || (y.exact - x.exact) || (y.hits - x.hits)
  )
}

// Divide a torcida de um jogo: % apostando na turma A, empate e turma B.
export function crowdSplit(predictions) {
  const total = predictions.length
  const a = predictions.filter((p) => p.scoreA > p.scoreB).length
  const b = predictions.filter((p) => p.scoreB > p.scoreA).length
  const draw = total - a - b
  const pct = (n) => (total === 0 ? 0 : Math.round((n / total) * 100))
  return { total, a: pct(a), draw: pct(draw), b: pct(b) }
}
