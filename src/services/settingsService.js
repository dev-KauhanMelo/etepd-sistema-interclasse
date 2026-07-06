import { Timestamp, doc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

// Salva o período oficial dos jogos (usado pela tela-bloqueio pré-evento).
// Passar null em uma data remove o valor correspondente.
export async function saveEventSettings({ startAt, endAt }) {
  return setDoc(doc(db, 'settings', 'event'), {
    startAt: startAt ? Timestamp.fromDate(startAt) : null,
    endAt: endAt ? Timestamp.fromDate(endAt) : null,
  })
}
