// RANKING GERAL POR MEDALHAS
//
// A campanha de uma turma no JIPD não é "quantos jogos ganhou" — é em quantas
// modalidades ela subiu no pódio. Vitória em fase de grupos não vale ponto
// geral; o que vale é terminar a modalidade em 1º, 2º ou 3º.

// Edital §10: esporte vale mais que e-sport e jogo de mesa.
export const PONTOS = {
  esporte: { gold: 350, silver: 250, bronze: 150 },
  mesa: { gold: 300, silver: 200, bronze: 100 },
}

// Quais modalidades são "esporte" (§10.1). O resto cai em e-sports e jogos de
// mesa (§10.2). Chave: nome em minúsculas, sem acento.
const ESPORTES = new Set([
  'futsal masculino', 'futsal', 'handebol', 'basquete', 'voleibol', 'volei',
  'queimado', 'barra bandeira', 'quadrado volei', 'futmesa',
])

const chave = (nome) =>
  String(nome || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

// A categoria no nome não muda o que a modalidade é: "Voleibol Feminino" vale
// como esporte igual a "Voleibol" (§10.1), e não como jogo de mesa.
const semCategoria = (k) =>
  k.replace(/\b(feminino|masculino|fem|masc|misto)\b/g, '').replace(/\s+/g, ' ').trim()

export const tipoDaModalidade = (nome) => {
  const k = semCategoria(chave(nome))
  const ehEsporte = ESPORTES.has(k) || [...ESPORTES].some((e) => k.includes(e) || e.includes(k))
  return ehEsporte ? 'esporte' : 'mesa'
}
export const pontosDe = (nome) => PONTOS[tipoDaModalidade(nome)]

export const MEDALHAS = [
  { key: 'gold', label: 'Ouro', short: 'O', place: 1, color: '#F5C518' },
  { key: 'silver', label: 'Prata', short: 'P', place: 2, color: '#C5CEDB' },
  { key: 'bronze', label: 'Bronze', short: 'B', place: 3, color: '#CD7F32' },
]

// Categorias: a mesma modalidade pode ter duas disputas com pódios diferentes
// (Basquete masculino e feminino terminaram com colocações distintas).
export const CATEGORIAS = [
  { key: 'unico', label: 'Único' },
  { key: 'masc', label: 'Masculino' },
  { key: 'fem', label: 'Feminino' },
]

export const podiumId = (modalityId, categoria = 'unico') => `${modalityId}__${categoria}`

// Times combinados do feminino (1º ano unido, 2ºB+2ºC…) não são uma turma, são
// várias. Por isso cada colocação guarda uma LISTA de turmas, e todas as turmas
// da lista recebem os pontos daquela colocação — quem subiu no pódio foi cada
// uma delas.
export function buildMedalRanking(podiums = [], penalties = [], classes = [], modalities = [], extras = {}) {
  const linhas = new Map()

  // Times combinados (Primeirão, Terceirão, 2ºB/2ºC) existem como turma só
  // pra poder entrar num jogo — mas não são uma turma, são várias. No ranking
  // geral eles não aparecem: a medalha que o time ganhou vira medalha de cada
  // turma que o formou.
  const turmasReais = classes.filter((c) => !c.isTeam)
  const expandir = (id) => {
    const c = classes.find((x) => x.id === id)
    if (c?.isTeam) return Array.isArray(c.memberIds) ? c.memberIds : []
    return id ? [id] : []
  }

  const linha = (classId) => {
    if (!classId) return null
    if (!linhas.has(classId)) {
      const cls = turmasReais.find((c) => c.id === classId)
      if (!cls) return null
      linhas.set(classId, {
        id: classId, classId,
        className: cls.name, color: cls.color, logoUrl: cls.logoUrl,
        gold: 0, silver: 0, bronze: 0,
        earned: 0, extras: 0, penalty: 0, points: 0,
      })
    }
    return linhas.get(classId)
  }

  // Toda turma aparece, mesmo zerada — sumir da tabela por ainda não ter
  // pontuado faz parecer que a turma não está no evento.
  turmasReais.forEach((c) => linha(c.id))

  for (const p of podiums) {
    const mod = modalities.find((m) => m.id === p.modalityId)
    const valores = pontosDe(mod?.name)
    for (const { key } of MEDALHAS) {
      const marcados = Array.isArray(p[key]) ? p[key] : p[key] ? [p[key]] : []
      // Um time combinado no pódio vira todas as turmas que o formaram
      const ids = [...new Set(marcados.flatMap(expandir))]
      for (const id of ids) {
        const l = linha(id)
        if (!l) continue
        l[key] += 1
        l.earned += valores[key]
      }
    }
  }

  // §5.4: punição em modalidade de turmas unificadas penaliza TODAS as turmas
  // do time, "independentemente de qual turma tenha cometido a infração".
  // Punir o time é punir cada uma; punir uma turma sozinha atinge só ela.
  for (const pen of penalties) {
    for (const id of expandir(pen.classId)) {
      const l = linha(id)
      if (!l) continue
      l.penalty += Number(pen.points) || 0
    }
  }

  // §9.5: Performance, Torcida e Camisas somam ao mesmo placar geral
  for (const [classId, pts] of Object.entries(extras)) {
    const l = linha(classId)
    if (!l) continue
    l.extras = (l.extras || 0) + pts
    l.earned += pts
  }

  const rows = [...linhas.values()]
  rows.forEach((l) => { l.points = l.earned - l.penalty })

  // Empate em pontos se desfaz por medalha mais valiosa, como em olimpíada.
  return rows.sort((a, b) =>
    b.points - a.points ||
    b.gold - a.gold ||
    b.silver - a.silver ||
    b.bronze - a.bronze ||
    String(a.className).localeCompare(String(b.className))
  )
}
