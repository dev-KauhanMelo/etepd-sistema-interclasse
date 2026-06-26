import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

export async function createClass(data) {
  return addDoc(collection(db, 'classes'), { ...data, active: true, createdAt: serverTimestamp() })
}
