import { collection } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useLiveQuery } from './useLiveQuery'

// Três documentos no total (performance, torcida, camisas).
export function useAwards() {
  const { docs, loading } = useLiveQuery('awards', () => collection(db, 'awards'), { permanent: true })
  return { awards: docs, loading }
}
