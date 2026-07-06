import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase'

// Lê o documento settings/event: { startAt, endAt } (datas do período de jogos).
// Se o documento não existir, o site funciona normalmente (sem bloqueio).
export function useEventSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'event'), (snap) => {
      setSettings(snap.exists() ? snap.data() : null)
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [])

  return { settings, loading }
}
