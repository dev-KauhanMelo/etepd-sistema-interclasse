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

export async function adjustScore(match, side, delta, uid) {
  const field = side === 'A' ? 'scoreA' : 'scoreB'
  const newValue = Math.max(0, (match[field] || 0) + delta)
  return updateMatch(match.id, { [field]: newValue }, uid)
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
