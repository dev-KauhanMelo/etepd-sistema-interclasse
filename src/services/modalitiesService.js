import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

export async function createModality(data) {
  return addDoc(collection(db, 'modalities'), { ...data, active: true, createdAt: serverTimestamp() })
}
