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

// Põe ou tira UMA turma de UMA colocação, sem tocar no resto do pódio. É o que
// a tabela do ranking usa: ali a comissão pensa por turma ("o 3ºC ganhou mais
// um ouro"), não por pódio inteiro.
export async function toggleMedal({ modalityId, categoria = 'unico', key, classId, podium }) {
  const atual = (k) => {
    const v = podium?.[k]
    return Array.isArray(v) ? v : v ? [v] : []
  }
  const lista = atual(key)
  const nova = lista.includes(classId)
    ? lista.filter((id) => id !== classId)
    : [...lista, classId]

  return savePodium(modalityId, categoria, {
    gold: key === 'gold' ? nova : atual('gold'),
    silver: key === 'silver' ? nova : atual('silver'),
    bronze: key === 'bronze' ? nova : atual('bronze'),
  })
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

// Colocação de Performance, Torcida ou Camisas (edital §9). `places` é a lista
// de turmas na ordem da colocação — índice 0 é o 1º lugar.
export async function saveAward(key, places) {
  return setDoc(doc(db, 'awards', key), {
    places: places.filter(Boolean),
    updatedAt: serverTimestamp(),
  })
}
