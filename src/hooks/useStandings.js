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
// TODOS os standings de uma vez — usado pela classificação GERAL, que soma a
// campanha de cada turma em todas as modalidades.
export function useAllStandings() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'standings'), (snap) => {
      setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, (error) => { console.error('Erro ao carregar classificação geral:', error); setLoading(false) })
    return unsub
  }, [])

  return { rows, loading }
}

// Agrega por turma: soma pontos, V/E/D e saldo de todas as modalidades.
export function aggregateGeneral(rows) {
  const byClass = {}
  for (const r of rows) {
    const c = byClass[r.classId] || {
      id: r.classId, classId: r.classId, className: r.className,
      points: 0, wins: 0, draws: 0, losses: 0, scoredFor: 0, scoredAgainst: 0,
    }
    c.className = c.className || r.className
    c.points += r.points || 0
    c.wins += r.wins || 0
    c.draws += r.draws || 0
    c.losses += r.losses || 0
    c.scoredFor += r.scoredFor || 0
    c.scoredAgainst += r.scoredAgainst || 0
    byClass[r.classId] = c
  }
  return sortStandings(Object.values(byClass), 'classico')
}
