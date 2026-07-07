import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'announcements'),
      where('active', '==', true),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setAnnouncements(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, (error) => {
      // Sem o índice composto (active + createdAt) o Firestore rejeita a
      // consulta — melhor mostrar vazio do que carregar pra sempre.
      console.error('Erro ao carregar avisos:', error)
      setLoading(false)
    })
    return unsub
  }, [])

  return { announcements, loading }
}
