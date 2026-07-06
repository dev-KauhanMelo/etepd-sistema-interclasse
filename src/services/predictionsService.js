import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'

// Um palpite por pessoa por jogo: o id do documento é matchId_userId,
// então tentar palpitar duas vezes no mesmo jogo falha nas regras.
export async function submitPrediction(match, profile, scoreA, scoreB) {
  const id = `${match.id}_${profile.id}`
  return setDoc(doc(db, 'predictions', id), {
    matchId: match.id,
    userId: profile.id,
    userName: profile.name,
    userClass: profile.className || '',
    scoreA,
    scoreB,
    createdAt: serverTimestamp(),
  })
}
