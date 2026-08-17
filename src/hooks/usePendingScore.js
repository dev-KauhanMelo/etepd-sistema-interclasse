import { useCallback, useEffect, useRef, useState } from 'react'

const ESPERA_MS = 2500

// TOQUES AGRUPADOS — cada gravação no Firestore é cobrada uma vez por pessoa
// com o site aberto, então gravar a cada toque no + é o item mais caro do
// evento: um basquete de 40 pontos com 100 alunos assistindo custa 4.000
// leituras. Aqui o número sobe na hora na tela do juiz e a gravação sai uma
// vez, 2,5s depois do último toque — o aluno vê "12 a 10" em vez de assistir
// à contagem um a um, o que ninguém vai notar, e a conta cai umas dez vezes.
//
// O placar exibido é sempre o do banco + o que ainda não foi gravado, então a
// tela nunca "volta atrás" quando a gravação finalmente chega.
export function usePendingScore(match, onFlush) {
  const [pendente, setPendente] = useState({ A: 0, B: 0 })
  const timer = useRef(null)
  const dados = useRef({ pendente: { A: 0, B: 0 }, match, onFlush })

  dados.current.match = match
  dados.current.onFlush = onFlush

  const gravar = useCallback(() => {
    const { pendente: p, match: m, onFlush: fn } = dados.current
    if (!m || (p.A === 0 && p.B === 0)) return
    const alvo = {}
    if (p.A !== 0) alvo.scoreA = Math.max(0, (m.scoreA || 0) + p.A)
    if (p.B !== 0) alvo.scoreB = Math.max(0, (m.scoreB || 0) + p.B)
    dados.current.pendente = { A: 0, B: 0 }
    setPendente({ A: 0, B: 0 })
    fn(alvo)
  }, [])

  const ajustar = useCallback((lado, delta) => {
    const m = dados.current.match
    const atual = (m?.[lado === 'A' ? 'scoreA' : 'scoreB'] || 0) + dados.current.pendente[lado]
    // Não deixa o pendente levar o placar a número negativo
    if (atual + delta < 0) return
    const novo = { ...dados.current.pendente, [lado]: dados.current.pendente[lado] + delta }
    dados.current.pendente = novo
    setPendente(novo)
    clearTimeout(timer.current)
    timer.current = setTimeout(gravar, ESPERA_MS)
  }, [gravar])

  // Sair da tela grava o que estava pendente — ninguém perde ponto por ter
  // apertado "voltar" rápido demais.
  useEffect(() => () => { clearTimeout(timer.current); gravar() }, [gravar])

  const placar = (lado) =>
    (match?.[lado === 'A' ? 'scoreA' : 'scoreB'] || 0) + pendente[lado]

  return { placar, ajustar, salvando: pendente.A !== 0 || pendente.B !== 0, gravarAgora: gravar }
}
