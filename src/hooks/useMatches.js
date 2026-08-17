import { useMemo } from 'react'
import { collection, orderBy, query } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useLiveQuery } from './useLiveQuery'
import { useClasses } from './useClasses'
import { freshMatch } from '../utils/teams'

export function useMatches() {
  const { docs, loading } = useLiveQuery(
    'matches',
    () => query(collection(db, 'matches'), orderBy('scheduledAt', 'asc')),
    { permanent: true }
  )
  const { classes } = useClasses()

  // Reidrata os times com o cadastro atual das turmas (cor, escudo e nome),
  // senão os jogos ficam com a cópia congelada de quando foram criados.
  const matches = useMemo(() => docs.map((m) => freshMatch(m, classes)), [docs, classes])

  return { matches, loading }
}
