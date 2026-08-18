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

  // Avançar no desenho da chave não basta: a semifinal precisa existir como
  // PARTIDA pro juiz poder abrir e apitar.
  const criados = await criarJogosLiberados(modalityId, games, match)

  return { ok: true, gameId, criados }
}

// JOGOS QUE NASCEM SOZINHOS
//
// Só os jogos 1 a 4 foram cadastrados — as semifinais, a disputa de 3º e a
// final dependiam de resultados que ainda não existiam. Em vez de criar 72
// partidas vazias no começo (que poluiriam o cronograma e custariam leitura
// em toda visita), cada uma nasce no instante em que as DUAS vagas ficam
// definidas. Antes disso ela não é um jogo — é uma incógnita.
//
// Local e dia vêm do confronto que classificou; hora fica "a definir" e se
// resolve sozinha quando alguém apertar COMEÇAR JOGO.
async function criarJogosLiberados(modalityId, games, origem) {
  const { collection, getDocs, query, where, addDoc, updateDoc, doc: docRef, serverTimestamp: ts } =
    await import('firebase/firestore')
  const { BRACKET_GAMES } = await import('../utils/bracket')

  const snap = await getDocs(query(collection(db, 'matches'), where('modalityId', '==', modalityId)))
  const existentes = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

  const time = (slot) =>
    slot?.classId
      ? { classId: slot.classId, name: slot.name || null, color: slot.color || null, logoUrl: slot.logoUrl || null }
      : null

  const criados = []
  for (const g of BRACKET_GAMES) {
    const jogo = games[g.id]
    const a = time(jogo?.slots?.[0])
    const b = time(jogo?.slots?.[1])
    if (!a || !b) continue // ainda falta alguém: não é jogo, é incógnita

    const atual = existentes.find((m) => m.bracketGame === g.id)

    if (!atual) {
      await addDoc(collection(db, 'matches'), {
        modalityId, bracketGame: g.id, phase: 'mata-mata', roundLabel: g.label,
        teamA: a, teamB: b,
        scoreA: 0, scoreB: 0, status: 'scheduled',
        location: origem?.location || '', venue: origem?.venue || null, space: origem?.space || null,
        // Data de agora, não a do jogo que classificou: se a fase anterior foi
        // ontem, herdar aquela data esconderia a semifinal do filtro "Hoje".
        scheduledAt: ts(),
        timeTBD: true,
        periodScores: [], currentPeriod: 1, matchNotes: [],
        createdAt: ts(), lastUpdatedAt: ts(),
      })
      criados.push(g.label)
      continue
    }

    // Jogo já existe: só corrige as turmas se ele ainda não rolou. Depois de
    // começar, mexer nos times apagaria o que o juiz marcou.
    if (atual.status !== 'scheduled') continue
    const mudou = atual.teamA?.classId !== a.classId || atual.teamB?.classId !== b.classId
    if (mudou) await updateDoc(docRef(db, 'matches', atual.id), { teamA: a, teamB: b, lastUpdatedAt: ts() })
  }

  return criados
}
