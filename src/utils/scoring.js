// COMO CADA MODALIDADE MARCA RESULTADO
//
// Nem todo jogo tem placar. Xadrez e Dama se decidem em partidas ganhas;
// Call of Duty e Wild Rift são eliminação simples (só interessa quem passou).
// Marcar "3 a 0" num Call of Duty não quer dizer nada — por isso o tipo de
// marcação vem da modalidade, e a tela do juiz se adapta a ele.
//
// Base: edital JIPD 2026, seções 6 (esportes), 7 (mesa) e 8 (e-sports).

export const SCORING = {
  placar: {
    label: 'Placar',
    hint: 'Marca os números da partida',
    unitA: 'Pontos', // rótulo genérico; cada modalidade usa o seu abaixo
  },
  sets: {
    label: 'Partidas ganhas',
    hint: 'Melhor de 3 ou 5 — marca quantas cada lado venceu',
  },
  vencedor: {
    label: 'Só o vencedor',
    hint: 'Sem números: um toque diz quem passou',
  },
  nenhum: {
    label: 'Sem confronto direto',
    hint: 'Free Fire, Cubo Mágico e Uno: a classificação é feita na aba Classificação',
  },
}

// Modalidade -> como marca. A chave é o nome em minúsculas, sem acento.
const POR_MODALIDADE = {
  // --- placar de números ---
  'futsal masculino': { tipo: 'placar', unidade: 'gols' },
  'handebol': { tipo: 'placar', unidade: 'gols' },
  'basquete': { tipo: 'placar', unidade: 'pontos' },
  'voleibol': { tipo: 'placar', unidade: 'pontos' },
  'queimado': { tipo: 'placar', unidade: 'pontos' },
  'futmesa': { tipo: 'placar', unidade: 'pontos' },
  'quadrado volei': { tipo: 'placar', unidade: 'pontos' },
  'toto': { tipo: 'placar', unidade: 'gols' },
  'ping pong': { tipo: 'placar', unidade: 'pontos' },
  'domino': { tipo: 'placar', unidade: 'pontos' },
  'fifa': { tipo: 'placar', unidade: 'gols' },
  'e-football mobile': { tipo: 'placar', unidade: 'gols' },
  'truco': { tipo: 'placar', unidade: 'pontos' },

  // --- melhor de N: conta partidas/rounds ganhos ---
  'xadrez': { tipo: 'sets', unidade: 'partidas' },
  'dama': { tipo: 'sets', unidade: 'partidas' },
  'mortal kombat': { tipo: 'sets', unidade: 'rounds' },
  'brawl stars': { tipo: 'sets', unidade: 'partidas' },
  'clash royale': { tipo: 'sets', unidade: 'partidas' },

  // --- só quem passou ---
  'call of duty': { tipo: 'vencedor' },
  'wild rift': { tipo: 'vencedor' },
  'just dance': { tipo: 'vencedor' },
  'barra bandeira': { tipo: 'vencedor' },

  // --- não têm confronto turma × turma ---
  'free fire': { tipo: 'nenhum' },
  'cubo magico': { tipo: 'nenhum' },
  'uno': { tipo: 'nenhum' },
}

const chave = (nome) =>
  String(nome || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

// Como esta modalidade marca resultado. Modalidade desconhecida cai em
// 'vencedor', que é o mais seguro: nunca pede um número que não existe.
export function scoringOf(modalityName) {
  return POR_MODALIDADE[chave(modalityName)] || { tipo: 'vencedor' }
}

export const usaPlacar = (modalityName) => {
  const t = scoringOf(modalityName).tipo
  return t === 'placar' || t === 'sets'
}
