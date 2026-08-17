import { collection, orderBy, query } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useLiveQuery } from './useLiveQuery'

// Turmas mudam uma vez por evento, mas são lidas em toda tela — listener
// permanente, compartilhado por todo mundo que pedir.
export function useClasses() {
  const { docs, loading } = useLiveQuery(
    'classes',
    () => query(collection(db, 'classes'), orderBy('name')),
    { permanent: true }
  )
  return { classes: docs, loading }
}
