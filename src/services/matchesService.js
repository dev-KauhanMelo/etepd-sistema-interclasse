import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
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
