import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../services/firebase'

export function useModalities() {
  const [modalities, setModalities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'modalities'), orderBy('name'))
    const unsub = onSnapshot(q, (snap) => {
      setModalities(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  return { modalities, loading }
}
