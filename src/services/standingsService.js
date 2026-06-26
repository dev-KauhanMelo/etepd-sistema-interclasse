import { doc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

export async function upsertStanding(modalityId, classId, data) {
  const id = `${modalityId}_${classId}`
  return setDoc(doc(db, 'standings', id), {
    modalityId,
    classId,
    ...data,
    updatedAt: new Date(),
  }, { merge: true })
}
