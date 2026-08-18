import { useCallback, useState } from 'react'

// FILTRO QUE NÃO SE PERDE AO SAIR DA TELA
//
// Cada tela guardava a escolha do filtro num useState comum, que morre junto
// com o componente. Na prática: você filtra por Futsal, abre um jogo, volta —
// e a lista está toda de novo em "Todas". Quem estava acompanhando UMA
// modalidade tinha que refiltrar a cada ida e volta.
//
// sessionStorage e não localStorage de propósito: a escolha vale enquanto a
// aba estiver aberta. Fechar o site e voltar amanhã começa limpo, sem um
// filtro esquecido escondendo metade dos jogos.
export function useStickyState(chave, inicial) {
  const [valor, setValor] = useState(() => {
    try {
      const salvo = sessionStorage.getItem(`jipd:${chave}`)
      return salvo === null ? inicial : JSON.parse(salvo)
    } catch {
      return inicial
    }
  })

  const set = useCallback((novo) => {
    setValor((atual) => {
      const v = typeof novo === 'function' ? novo(atual) : novo
      try { sessionStorage.setItem(`jipd:${chave}`, JSON.stringify(v)) } catch { /* modo anônimo */ }
      return v
    })
  }, [chave])

  return [valor, set]
}
