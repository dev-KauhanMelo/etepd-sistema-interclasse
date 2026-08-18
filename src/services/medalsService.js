import { addDoc, collection, deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import { podiumId } from '../utils/medals'

// Pódio de uma disputa: um documento por modalidade + categoria, porque
// Basquete masculino e feminino terminam com colocações diferentes. Cada
// colocação é uma LISTA de turmas — no feminino há times unidos (2ºB/2ºC).
// Regravar substitui, então a comissão corrige sem duplicar.
export async function savePodium(modalityId, categoria, { gold = [], silver = [], bronze = [] }) {
  return setDoc(doc(db, 'podiums', podiumId(modalityId, categoria)), {
    modalityId, categoria, gold, silver, bronze, updatedAt: serverTimestamp(),
  })
}

export async function clearPodium(modalityId, categoria) {
  return deleteDoc(doc(db, 'podiums', podiumId(modalityId, categoria)))
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
