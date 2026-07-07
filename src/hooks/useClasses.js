import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../services/firebase'

export function useClasses() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'classes'), orderBy('name'))
    const unsub = onSnapshot(q, (snap) => {
      setClasses(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, (error) => { console.error('Erro ao carregar turmas:', error); setLoading(false) })
    return unsub
  }, [])

  return { classes, loading }
}
