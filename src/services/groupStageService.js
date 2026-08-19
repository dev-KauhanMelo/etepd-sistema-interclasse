import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from './firebase'
import { upsertStanding } from './standingsService'

// TABELA DA FASE DE GRUPOS, CALCULADA SOZINHA
//
// O feminino não é mata-mata: cada time joga contra todos os outros e a
// classificação sai da campanha (vitórias, saldo). Digitar essa tabela à mão
// depois de cada jogo é onde a conta erra — então ela é REFEITA do zero a
// partir dos jogos encerrados, toda vez que um jogo termina.
//
// Refazer do zero, e não somar em cima do que já estava, é de propósito: se a
// comissão corrigir o placar de um jogo antigo ou reabrir um jogo, a tabela
// se conserta sozinha em vez de acumular o erro.

// Edital: vitória 3, empate 1, derrota 0.
const PONTOS = { vitoria: 3, empate: 1, derrota: 0 }

export async function recalcGroupStandings(modalityId) {
  if (!modalityId) return { ok: false, reason: 'sem-modalidade' }

  const snap = await getDocs(query(collection(db, 'matches'), where('modalityId', '==', modalityId)))
  const jogos = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((m) => m.status === 'finished')

  const linhas = new Map()
  const linha = (team) => {
    if (!team?.classId) return null
    if (!linhas.has(team.classId)) {
      linhas.set(team.classId, {
        className: team.name || team.classId,
        points: 0, wins: 0, draws: 0, losses: 0, scoredFor: 0, scoredAgainst: 0, played: 0,
      })
    }
    return linhas.get(team.classId)
  }

  for (const m of jogos) {
    const a = linha(m.teamA)
    const b = linha(m.teamB)
    if (!a || !b) continue

    const ga = Number(m.scoreA) || 0
    const gb = Number(m.scoreB) || 0
    a.played += 1; b.played += 1
    a.scoredFor += ga; a.scoredAgainst += gb
    b.scoredFor += gb; b.scoredAgainst += ga

    // O vencedor marcado pelo juiz manda mais que o placar: em modalidade sem
    // placar (ou com placar esquecido) ele é a única informação confiável.
    const vencedor = m.winnerSide || (ga > gb ? 'A' : gb > ga ? 'B' : null)

    if (vencedor === 'A') { a.wins += 1; a.points += PONTOS.vitoria; b.losses += 1 }
    else if (vencedor === 'B') { b.wins += 1; b.points += PONTOS.vitoria; a.losses += 1 }
    else { a.draws += 1; b.draws += 1; a.points += PONTOS.empate; b.points += PONTOS.empate }
  }

  await Promise.all(
    [...linhas.entries()].map(([classId, dados]) => upsertStanding(modalityId, classId, dados))
  )

  return { ok: true, times: linhas.size, jogos: jogos.length }
}
