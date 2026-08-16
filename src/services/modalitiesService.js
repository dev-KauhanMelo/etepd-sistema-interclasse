import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

export async function createModality(data) {
  return addDoc(collection(db, 'modalities'), { ...data, active: true, createdAt: serverTimestamp() })
}

export async function updateModality(id, data) {
  return updateDoc(doc(db, 'modalities', id), data)
}
