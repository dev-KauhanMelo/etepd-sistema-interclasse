import { addDoc, collection, deleteDoc, doc, increment, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

export async function createMatch(data) {
  return addDoc(collection(db, 'matches'), {
    ...data,
    scoreA: 0,
    scoreB: 0,
    periodScores: [],
    currentPeriod: 1,
    status: 'scheduled',
    matchNotes: [],
    createdAt: serverTimestamp(),
    lastUpdatedAt: serverTimestamp(),
  })
}

export async function updateMatch(id, data, uid) {
  return updateDoc(doc(db, 'matches', id), {
    ...data,
    lastUpdatedAt: serverTimestamp(),
    lastUpdatedBy: uid || null,
  })
}

export async function deleteMatch(id) {
  return deleteDoc(doc(db, 'matches', id))
}

export async function addMatchNote(match, note, uid) {
  const notes = [...(match.matchNotes || []), note]
  return updateMatch(match.id, { matchNotes: notes }, uid)
}

// Torcida: qualquer pessoa incrementa o contador do seu time (1 toque por
// dispositivo, controlado no componente via localStorage). As rules do
// Firestore só deixam passar updates que mexem APENAS nesses dois campos,
// somando no máximo +1 — o resto do documento continua só-admin.
export async function cheerFor(matchId, side) {
  const field = side === 'A' ? 'cheerCountA' : 'cheerCountB'
  return updateDoc(doc(db, 'matches', matchId), { [field]: increment(1) })
}

// ENCERRAR UM SET
//
// No vôlei o placar que vale é sets ganhos; os pontos são de um set só e
// morrem quando ele acaba. Antes o juiz tinha um contador só e, pra registrar
// um set, precisava apagar 21 pontos no −1 antes de somar o set. Agora um
// toque faz as três coisas: dá o set a quem fez mais pontos, guarda o placar
// do set no histórico e zera os pontos pro próximo.
export async function closeSet(match, uid) {
  const pa = Number(match.pointsA) || 0
  const pb = Number(match.pointsB) || 0
  if (pa === pb) return { ok: false, reason: 'empate' }

  const vencedor = pa > pb ? 'A' : 'B'
  // Mesmo formato que o resto do sistema já lê em periodScores
  const historico = [
    ...(match.periodScores || []),
    { period: (match.periodScores?.length || 0) + 1, scoreA: pa, scoreB: pb },
  ]

  await updateMatch(match.id, {
    scoreA: (Number(match.scoreA) || 0) + (vencedor === 'A' ? 1 : 0),
    scoreB: (Number(match.scoreB) || 0) + (vencedor === 'B' ? 1 : 0),
    pointsA: 0,
    pointsB: 0,
    periodScores: historico,
    currentPeriod: historico.length + 1,
  }, uid)

  return { ok: true, vencedor, placar: `${pa}×${pb}` }
}

// Desfaz o último set encerrado: devolve os pontos ao contador e tira o set de
// quem tinha ganhado. Marcar set errado no meio de um jogo é comum, e sem isso
// a única saída era refazer o placar inteiro na mão.
export async function reopenLastSet(match, uid) {
  const historico = [...(match.periodScores || [])]
  const ultimo = historico.pop()
  if (!ultimo) return { ok: false, reason: 'sem-set' }

  const venceuA = (Number(ultimo.scoreA) || 0) > (Number(ultimo.scoreB) || 0)
  await updateMatch(match.id, {
    scoreA: Math.max(0, (Number(match.scoreA) || 0) - (venceuA ? 1 : 0)),
    scoreB: Math.max(0, (Number(match.scoreB) || 0) - (venceuA ? 0 : 1)),
    pointsA: Number(ultimo.scoreA) || 0,
    pointsB: Number(ultimo.scoreB) || 0,
    periodScores: historico,
    currentPeriod: historico.length + 1,
  }, uid)

  return { ok: true }
}

// Zera só os pontos do set em andamento, sem mexer nos sets já ganhos.
export async function resetSetPoints(match, uid) {
  return updateMatch(match.id, { pointsA: 0, pointsB: 0 }, uid)
}
