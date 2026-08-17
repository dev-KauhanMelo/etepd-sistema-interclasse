import { collection, orderBy, query } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useLiveQuery } from './useLiveQuery'

export function useModalities() {
  const { docs, loading } = useLiveQuery(
    'modalities',
    () => query(collection(db, 'modalities'), orderBy('name')),
    { permanent: true }
  )
  return { modalities: docs, loading }
}
