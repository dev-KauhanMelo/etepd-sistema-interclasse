import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase'

// Chaveamento da modalidade, ao vivo: quando o admin salva, a tela do aluno
// atualiza sozinha (mesmo padrão dos outros hooks do site).
//
// `loadedFor` diz de qual modalidade são os dados que estão em `bracket`.
// Sem isso, no instante em que a modalidade muda o React ainda renderiza uma
// vez com o bracket da modalidade anterior — e quem lê o hook acha que aquele
// dado é da modalidade nova. Comparar `loadedFor === modalityId` antes de usar
// resolve isso.
export function useBracket(modalityId) {
  const [state, setState] = useState({ bracket: null, loading: true, loadedFor: null })

  useEffect(() => {
    if (!modalityId) {
      setState({ bracket: null, loading: false, loadedFor: null })
      return
    }
    // Zera na hora da troca pra ninguém enxergar o chaveamento da modalidade
    // anterior enquanto o novo não chega.
    setState({ bracket: null, loading: true, loadedFor: null })
    const unsub = onSnapshot(
      doc(db, 'brackets', modalityId),
      (snap) => {
        setState({
          bracket: snap.exists() ? { id: snap.id, ...snap.data() } : null,
          loading: false,
          loadedFor: modalityId,
        })
      },
      (error) => {
        console.error('Erro ao carregar chaveamento:', error)
        setState({ bracket: null, loading: false, loadedFor: modalityId })
      },
    )
    return unsub
  }, [modalityId])

  return state
}
