import { collection, orderBy, query } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useLiveQuery } from './useLiveQuery'

// Pódios lançados (um doc por modalidade) e punições aplicadas. Duas coleções
// pequenas: juntas não passam de algumas dezenas de documentos.
export function usePodiums() {
  const { docs, loading } = useLiveQuery('podiums', () => collection(db, 'podiums'), { permanent: true })
  return { podiums: docs, loading }
}

export function usePenalties() {
  const { docs, loading } = useLiveQuery(
    'penalties',
    () => query(collection(db, 'penalties'), orderBy('createdAt', 'desc')),
    { permanent: true }
  )
  return { penalties: docs, loading }
}
