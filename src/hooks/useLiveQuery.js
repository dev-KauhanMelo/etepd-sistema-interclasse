import { useEffect, useState } from 'react'
import { subscribeQuery } from '../services/liveStore'

// Liga um componente a uma consulta compartilhada (ver services/liveStore).
//
// `key` é a identidade da consulta — quem passa a mesma key divide o mesmo
// listener. `makeQuery` só é chamada na primeira vez que aquela key aparece,
// então pode ser uma função nova a cada render sem custo.
//
// `permanent`: consultas que a página inteira usa o tempo todo (jogos, turmas,
// modalidades) ficam abertas até a aba fechar. As que variam por tela deixam
// esse valor em false e fecham sozinhas depois de ociosas.
export function useLiveQuery(key, makeQuery, { permanent = false, enabled = true } = {}) {
  const [state, setState] = useState({ docs: [], loading: true })

  useEffect(() => {
    if (!enabled || !key) { setState({ docs: [], loading: false }); return }
    setState((s) => (s.loading ? s : { ...s, loading: true }))
    return subscribeQuery(key, makeQuery, (docs, loaded) => {
      setState({ docs, loading: !loaded })
    }, { permanent })
    // makeQuery de propósito fora das dependências: a key já é a identidade
    // da consulta, e a função é recriada a cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, permanent])

  return state
}
