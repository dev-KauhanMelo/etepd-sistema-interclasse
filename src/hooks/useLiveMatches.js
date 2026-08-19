import { useMemo } from 'react'
import { collection, limit, orderBy, query, where, Timestamp } from 'firebase/firestore'
import { EM_ANDAMENTO } from '../utils/matchFilters'
import { db } from '../services/firebase'
import { useLiveQuery } from './useLiveQuery'
import { useClasses } from './useClasses'
import { freshMatch } from '../utils/teams'

// CONSULTAS ENXUTAS — a maior parte das pessoas abre o site, olha a Home e sai.
//
// A Home e o TopBar carregavam os 72 jogos pra usar dois ou três. O TopBar está
// em TODA página, então isso era a conta mais cara do site inteiro: 72
// documentos cobrados por pessoa, só pra descobrir o que está ao vivo. A lista
// completa continua existindo (useMatches), mas agora só quem entra no
// Cronograma, no Bolão ou no Placar paga por ela.

// Só o que está rolando agora — inclui os pausados, que continuam em jogo.
// Campo único: não depende de índice composto.
export function useLiveMatches() {
  const { docs, loading } = useLiveQuery(
    'matches:live',
    () => query(collection(db, 'matches'), where('status', 'in', EM_ANDAMENTO)),
    { permanent: true }
  )
  const { classes } = useClasses()
  const matches = useMemo(() => docs.map((m) => freshMatch(m, classes)), [docs, classes])
  return { matches, loading }
}

// Meia-noite de hoje. Ancorar no dia (e não em Date.now()) mantém a consulta
// estável: se a chave mudasse a cada render, o listener seria refeito e cada
// refação custa a consulta inteira outra vez.
function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

// Os próximos jogos por horário. Filtro de intervalo e ordenação no MESMO
// campo — de propósito, porque assim o Firestore resolve com o índice
// automático e não há como a consulta falhar por índice faltando.
export function useNextMatches(n = 3) {
  const dia = startOfToday()
  const { docs, loading } = useLiveQuery(
    `matches:next:${dia.getTime()}`,
    () => query(
      collection(db, 'matches'),
      where('scheduledAt', '>=', Timestamp.fromDate(dia)),
      orderBy('scheduledAt', 'asc'),
      limit(n + 6) // folga pra descartar no cliente os que já começaram
    ),
    { permanent: true }
  )
  const { classes } = useClasses()

  const matches = useMemo(
    () => docs
      .filter((m) => m.status === 'scheduled')
      .slice(0, n)
      .map((m) => freshMatch(m, classes)),
    [docs, classes, n]
  )

  return { matches, loading }
}
