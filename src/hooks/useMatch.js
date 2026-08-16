import { useEffect, useMemo, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useClasses } from './useClasses'
import { freshMatch } from '../utils/teams'

export function useMatch(id) {
  const [row, setRow] = useState(null)
  const [loading, setLoading] = useState(true)
  const { classes } = useClasses()

  useEffect(() => {
    if (!id) return
    const unsub = onSnapshot(doc(db, 'matches', id), (snap) => {
      setRow(snap.exists() ? { id: snap.id, ...snap.data() } : null)
      setLoading(false)
    })
    return unsub
  }, [id])

  // Mesma reidratação do useMatches: a cor/escudo vêm do cadastro atual.
  const match = useMemo(() => freshMatch(row, classes), [row, classes])

  return { match, loading }
}
