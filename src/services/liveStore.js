import { onSnapshot } from 'firebase/firestore'

// LISTENERS COMPARTILHADOS — o que estourou a cota no dia 1 do JIPD.
//
// Cada hook abria o seu próprio onSnapshot na montagem do componente. Como
// useMatches() ainda chama useClasses() por dentro, abrir a Home valia quatro
// listeners; sair pro Cronograma fechava os quatro e abria três novos. E todo
// listener novo começa baixando a coleção inteira: 72 jogos + 25 modalidades +
// 9 turmas = ~110 leituras cobradas. Cinco telas visitadas viravam ~550
// leituras por pessoa. Com o pátio cheio, 50 mil/dia acabam antes do almoço.
//
// Aqui existe UM listener por consulta, compartilhado por todos os componentes
// que pedem os mesmos dados, e ele NÃO fecha quando o último deles desmonta:
// manter aberto custa só as mudanças, reabrir custa a coleção toda outra vez.
// Consultas que variam por tela (a classificação de uma modalidade, os
// palpites de um jogo) seriam infinitas, então essas fecham depois de um tempo
// ocioso — tempo suficiente pra ir e voltar sem pagar de novo.

const IDLE_MS = 5 * 60 * 1000

const stores = new Map()

// Cota de leitura estourada (`resource-exhausted`): o Firestore recusa tudo
// até a virada do dia. Sem isso a tela ficava vazia sem explicação, e quem
// abria achava que o site tinha quebrado. Quem quiser saber, escuta aqui.
let semCota = false
const ouvintesDeCota = new Set()

export const cotaEstourada = () => semCota

export function onCotaEstourada(cb) {
  ouvintesDeCota.add(cb)
  return () => ouvintesDeCota.delete(cb)
}

function marcarSemCota() {
  if (semCota) return
  semCota = true
  ouvintesDeCota.forEach((cb) => cb(true))
}

function getStore(key, makeQuery, permanent) {
  let s = stores.get(key)
  if (!s) {
    s = { docs: [], loaded: false, subs: new Set(), unsub: null, idle: null, makeQuery, permanent }
    stores.set(key, s)
  }
  return s
}

function emit(s) {
  s.subs.forEach((cb) => cb(s.docs, s.loaded))
}

// Assina uma consulta. Devolve a função de cancelamento do assinante — que
// tira o callback da lista, mas não necessariamente derruba o listener.
export function subscribeQuery(key, makeQuery, cb, { permanent = false } = {}) {
  const s = getStore(key, makeQuery, permanent)
  s.subs.add(cb)

  if (s.idle) { clearTimeout(s.idle); s.idle = null }

  // Já tem dado em mãos: entrega na hora, sem esperar a rede. É o que faz a
  // troca de telas parecer instantânea.
  if (s.loaded) cb(s.docs, true)

  if (!s.unsub) {
    s.unsub = onSnapshot(
      makeQuery(),
      (snap) => {
        s.docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        s.loaded = true
        emit(s)
      },
      (error) => {
        // Cota estourada, índice faltando ou regra negando caem aqui. Melhor
        // mostrar a tela vazia do que deixar o Loader girando pra sempre.
        console.error(`Erro ao carregar ${key}:`, error)
        if (error?.code === 'resource-exhausted') marcarSemCota()
        s.loaded = true
        emit(s)
      }
    )
  }

  return () => {
    s.subs.delete(cb)
    if (s.subs.size === 0 && !s.permanent) {
      s.idle = setTimeout(() => {
        if (s.subs.size > 0) return
        s.unsub?.()
        stores.delete(key)
      }, IDLE_MS)
    }
  }
}
