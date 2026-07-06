import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'

// Palpites de UM jogo específico (pra barra de torcida e o widget de palpite).
export function usePredictions(matchId) {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!matchId) { setPredictions([]); setLoading(false); return }
    const q = query(collection(db, 'predictions'), where('matchId', '==', matchId))
    const unsub = onSnapshot(q, (snap) => {
      setPredictions(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [matchId])

  return { predictions, loading }
}

// TODOS os palpites (pro ranking do bolão e pra saber o que você já palpitou).
export function useAllPredictions() {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'predictions'), (snap) => {
      setPredictions(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  return { predictions, loading }
}
