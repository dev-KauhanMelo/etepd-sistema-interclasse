import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

export async function createAnnouncement(data) {
  return addDoc(collection(db, 'announcements'), {
    ...data,
    active: true,
    createdAt: serverTimestamp(),
  })
}

export async function deactivateAnnouncement(id) {
  return updateDoc(doc(db, 'announcements', id), { active: false })
}

export async function deleteAnnouncement(id) {
  return deleteDoc(doc(db, 'announcements', id))
}
