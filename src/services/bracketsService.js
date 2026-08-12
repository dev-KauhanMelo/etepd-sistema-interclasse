import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'

// Um chaveamento por modalidade: o id do documento É o id da modalidade.
// Assim /ranking só precisa ler brackets/{modalityId} pra montar a tela.
export async function saveBracket(modalityId, data, uid) {
  return setDoc(
    doc(db, 'brackets', modalityId),
    {
      ...sanitize(data),
      modalityId,
      lastUpdatedAt: serverTimestamp(),
      lastUpdatedBy: uid || null,
    },
    { merge: true },
  )
}

// O Firestore recusa `undefined` — como os slots vazios têm vários campos
// opcionais, troca tudo que for undefined por null antes de gravar.
function sanitize(value) {
  if (Array.isArray(value)) return value.map(sanitize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, v === undefined ? null : sanitize(v)]))
  }
  return value === undefined ? null : value
}
