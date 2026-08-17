import { collection, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useLiveQuery } from './useLiveQuery'
import { sortStandings } from '../utils/standings'

// Classificação da modalidade, ao vivo. `format` decide o critério de
// desempate ('classico' = saldo; 'pontos' = booyah e abates, estilo LBFF).
export function useStandings(modalityId, format = 'classico') {
  const { docs, loading } = useLiveQuery(
    modalityId ? `standings:${modalityId}` : null,
    () => query(collection(db, 'standings'), where('modalityId', '==', modalityId)),
    { enabled: !!modalityId }
  )

  // Reordena sem novo fetch quando o formato muda.
  const standings = sortStandings(docs, format)

  // Qual modalidade os dados em mãos representam — a tela usa isso pra não
  // pintar a tabela de uma modalidade com os dados da anterior.
  const loadedFor = loading ? null : modalityId

  return { standings, loading, loadedFor }
}

// TODOS os standings de uma vez — usado pela classificação GERAL, que soma a
// campanha de cada turma em todas as modalidades.
export function useAllStandings() {
  const { docs, loading } = useLiveQuery('standings', () => collection(db, 'standings'))
  return { rows: docs, loading }
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
