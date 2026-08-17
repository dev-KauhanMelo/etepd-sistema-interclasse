import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'

// Um chaveamento por modalidade: o id do documento É o id da modalidade.
// Assim /ranking só precisa ler brackets/{modalityId} pra montar a tela.
export async function saveBracket(modalityId, data, uid) {
  return setDoc(
    doc(db, 'brackets', modalityId),
    {
      ...sanitize(data),
      modalityId,
      lastUpdatedAt: serverTimestamp(),
      lastUpdatedBy: uid || null,
    },
    { merge: true },
  )
}

// O Firestore recusa `undefined` — como os slots vazios têm vários campos
// opcionais, troca tudo que for undefined por null antes de gravar.
function sanitize(value) {
  if (Array.isArray(value)) return value.map(sanitize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, v === undefined ? null : sanitize(v)]))
  }
  return value === undefined ? null : value
}

// ===== Encerrar um jogo já avança o vencedor no chaveamento =====
//
// Antes o juiz tinha que marcar o resultado na tela do jogo E depois abrir o
// Chaveamento pra marcar de novo quem passou. São dois lugares para a mesma
// informação, e no meio de um dia de competição alguém ia esquecer um deles.
// Agora a tela do jogo faz as duas coisas.
export async function advanceWinnerInBracket(modalityId, match, winnerSide) {
  const { doc: docRef, getDoc } = await import('firebase/firestore')
  const snap = await getDoc(docRef(db, 'brackets', modalityId))
  if (!snap.exists()) return { ok: false, reason: 'sem-chaveamento' }

  const { mergeBracket, applyWinner, BRACKET_ORDER } = await import('../utils/bracket')
  const model = mergeBracket(snap.data())

  const winnerId = winnerSide === 'A' ? match.teamA?.classId : match.teamB?.classId
  if (!winnerId) return { ok: false, reason: 'sem-turma' }

  // Acha em qual jogo do chaveamento este confronto está: as duas turmas
  // precisam bater com os dois slots (em qualquer ordem).
  const aId = match.teamA?.classId
  const bId = match.teamB?.classId
  const gameId =
    match.bracketGame && model.games[match.bracketGame]
      ? match.bracketGame
      : BRACKET_ORDER.find((g) => {
          const s = model.games[g]?.slots || []
          const ids = [s[0]?.classId, s[1]?.classId]
          return ids.includes(aId) && ids.includes(bId)
        })
  if (!gameId) return { ok: false, reason: 'jogo-nao-encontrado' }

  const slots = model.games[gameId].slots
  const winnerIndex = slots.findIndex((s) => s?.classId === winnerId)
  if (winnerIndex < 0) return { ok: false, reason: 'turma-fora-do-jogo' }
  // já estava marcado assim: não faz nada (evita desmarcar sem querer)
  if (model.games[gameId].winner === winnerIndex) return { ok: true, gameId, jaEstava: true }

  const games = applyWinner(model.games, gameId, winnerIndex)
  await saveBracket(modalityId, { ...model, games })
  return { ok: true, gameId }
}
