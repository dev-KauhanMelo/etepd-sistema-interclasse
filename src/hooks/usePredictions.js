import { collection, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useLiveQuery } from './useLiveQuery'

// Palpites de UM jogo (barra de torcida e widget de palpite). Varia por tela,
// então o listener fecha sozinho depois de ocioso.
export function usePredictions(matchId) {
  const { docs, loading } = useLiveQuery(
    matchId ? `predictions:${matchId}` : null,
    () => query(collection(db, 'predictions'), where('matchId', '==', matchId)),
    { enabled: !!matchId }
  )
  return { predictions: docs, loading }
}

// TODOS os palpites (ranking do bolão e o que você já palpitou).
export function useAllPredictions() {
  const { docs, loading } = useLiveQuery('predictions', () => collection(db, 'predictions'))
  return { predictions: docs, loading }
}
