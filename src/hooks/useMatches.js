import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useClasses } from './useClasses'
import { freshMatch } from '../utils/teams'

export function useMatches() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const { classes } = useClasses()

  useEffect(() => {
    const q = query(collection(db, 'matches'), orderBy('scheduledAt', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, (error) => { console.error('Erro ao carregar jogos:', error); setLoading(false) })
    return unsub
  }, [])

  // Reidrata os times com o cadastro atual das turmas (cor, escudo e nome),
  // senão os jogos ficam com a cópia congelada de quando foram criados.
  const matches = useMemo(() => rows.map((m) => freshMatch(m, classes)), [rows, classes])

  return { matches, loading }
}
