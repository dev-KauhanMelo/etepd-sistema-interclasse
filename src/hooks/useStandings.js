import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'
import { sortStandings } from '../utils/standings'

// Classificação da modalidade, ao vivo. `format` decide o critério de
// desempate ('classico' = saldo; 'pontos' = booyah e abates, estilo LBFF).
export function useStandings(modalityId, format = 'classico') {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadedFor, setLoadedFor] = useState(null)

  useEffect(() => {
    if (!modalityId) { setRows([]); setLoading(false); setLoadedFor(null); return }
    setLoading(true)
    setLoadedFor(null)
    const q = query(collection(db, 'standings'), where('modalityId', '==', modalityId))
    const unsub = onSnapshot(q, (snap) => {
      setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
      setLoadedFor(modalityId)
    }, (error) => {
      console.error('Erro ao carregar classificação:', error)
      setLoading(false)
      setLoadedFor(modalityId)
    })
    return unsub
  }, [modalityId])

  // Reordena sem novo fetch quando o formato muda.
  const standings = sortStandings(rows, format)

  return { standings, loading, loadedFor }
}