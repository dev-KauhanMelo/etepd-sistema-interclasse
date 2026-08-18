import { addDoc, collection, deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'

// Pódio de uma modalidade: um documento por modalidade, com o classId de cada
// colocação. Regravar substitui — a comissão pode corrigir sem duplicar.
export async function savePodium(modalityId, { gold = null, silver = null, bronze = null }) {
  return setDoc(doc(db, 'podiums', modalityId), {
    modalityId, gold, silver, bronze, updatedAt: serverTimestamp(),
  })
}

export async function clearPodium(modalityId) {
  return deleteDoc(doc(db, 'podiums', modalityId))
}

// Punição: desconto de pontos no ranking geral. Fica registrada uma a uma (e
// não como um total por turma) pra comissão poder revisar e desfazer só uma.
export async function addPenalty({ classId, points, reason }, uid) {
  return addDoc(collection(db, 'penalties'), {
    classId,
    points: Math.abs(Number(points) || 0),
    reason: reason || '',
    createdAt: serverTimestamp(),
    createdBy: uid || null,
  })
}

export async function removePenalty(id) {
  return deleteDoc(doc(db, 'penalties', id))
}
