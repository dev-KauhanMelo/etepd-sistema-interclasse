import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'

export function useStandings(modalityId) {
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!modalityId) { setStandings([]); setLoading(false); return }
    const q = query(collection(db, 'standings'), where('modalityId', '==', modalityId))
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      rows.sort((a, b) => (b.points - a.points) || (((b.scoredFor || 0) - (b.scoredAgainst || 0)) - ((a.scoredFor || 0) - (a.scoredAgainst || 0))))
      setStandings(rows)
      setLoading(false)
    })
    return unsub
  }, [modalityId])

  return { standings, loading }
}
