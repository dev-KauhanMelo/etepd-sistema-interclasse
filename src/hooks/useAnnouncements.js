import { collection, orderBy, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useLiveQuery } from './useLiveQuery'

// Sem o índice composto (active + createdAt) o Firestore rejeita a consulta —
// o liveStore registra o erro e devolve vazio em vez de carregar pra sempre.
export function useAnnouncements() {
  const { docs, loading } = useLiveQuery(
    'announcements',
    () => query(collection(db, 'announcements'), where('active', '==', true), orderBy('createdAt', 'desc')),
    { permanent: true }
  )
  return { announcements: docs, loading }
}
