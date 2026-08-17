import { initializeApp } from 'firebase/app'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)

// Cache em IndexedDB. Sem ele, cada vez que alguém abre o site o Firestore
// baixa os 72 jogos + turmas + modalidades DE NOVO, e cada documento baixado
// é uma leitura cobrada. Com o cache, o SDK serve do disco e só pede ao
// servidor o que mudou desde a última visita — e o que vem do cache não conta
// na cota. É a maior economia possível num evento onde a mesma pessoa abre o
// site dez vezes no dia.
//
// `persistentMultipleTabManager`: quem deixa o site aberto em duas abas
// compartilha o mesmo cache em vez de uma abrir mão dele.
// Navegador anônimo e alguns Android bloqueiam IndexedDB. Sem o try, o site
// inteiro morria na inicialização — melhor perder o cache do que a tela.
function makeDb() {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    })
  } catch (e) {
    console.warn('Cache local indisponível, seguindo só com a rede:', e)
    return initializeFirestore(app, {})
  }
}

export const db = makeDb()

export const auth = getAuth(app)
