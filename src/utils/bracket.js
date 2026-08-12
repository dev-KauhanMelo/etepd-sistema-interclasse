// ===== Chaveamento (mata-mata) — formato oficial da escola =====
// 9 vagas, 8 partidas. O lado esquerdo tem uma rodada a mais que o direito
// (o 2º C entra direto no Jogo 5). A Final fica no meio do canvas: os jogos
// 1/2/5/7 caminham da esquerda pro centro e os jogos 3/4/6 da direita.
//
// A GEOMETRIA É FIXA em pixels (canvas 1210×500, tudo em position:absolute) —
// o chaveamento não encolhe, ele rola na horizontal. Os números abaixo vêm
// direto da referência de design; mexer neles desalinha as linhas douradas.

export const BRACKET_CANVAS = { width: 1210, height: 500 }
export const MATCH_BOX = { width: 136, slotHeight: 28, gap: 3 }

// Ordem de leitura no painel admin (o canvas usa as coordenadas, não esta ordem)
export const BRACKET_ORDER = ['jogo1', 'jogo2', 'jogo3', 'jogo4', 'jogo5', 'jogo6', 'jogo7', 'final']

// x/y = canto superior esquerdo da caixa de jogo; labelY = altura da etiqueta.
// slots[].seed = rótulo padrão da vaga (ex.: "3º B"); slots[].from = o vencedor
// de outro jogo cai aqui. to = pra onde o vencedor deste jogo vai.
export const BRACKET_GAMES = [
  { id: 'jogo1', label: 'JOGO 1', x: 30, y: 40, labelY: 14, slots: [{ seed: '3º B' }, { seed: '1º A' }], to: { game: 'jogo5', slot: 1 } },
  { id: 'jogo2', label: 'JOGO 2', x: 30, y: 380, labelY: 354, slots: [{ seed: '3º A' }, { seed: '1º B' }], to: { game: 'jogo7', slot: 1 } },
  { id: 'jogo5', label: 'JOGO 5', x: 216, y: 110, labelY: 84, slots: [{ seed: '2º C' }, { from: 'jogo1' }], to: { game: 'jogo7', slot: 0 } },
  { id: 'jogo7', label: 'JOGO 7', x: 402, y: 250, labelY: 224, slots: [{ from: 'jogo5' }, { from: 'jogo2' }], to: { game: 'final', slot: 0 } },
  { id: 'jogo6', label: 'JOGO 6', x: 858, y: 210, labelY: 184, slots: [{ from: 'jogo3' }, { from: 'jogo4' }], to: { game: 'final', slot: 1 } },
  { id: 'jogo3', label: 'JOGO 3', x: 1044, y: 40, labelY: 14, slots: [{ seed: '2º B' }, { seed: '1º C' }], to: { game: 'jogo6', slot: 0 } },
  { id: 'jogo4', label: 'JOGO 4', x: 1044, y: 380, labelY: 354, slots: [{ seed: '3º C' }, { seed: '2º A' }], to: { game: 'jogo6', slot: 1 } },
  { id: 'final', label: 'FINAL', x: 598, y: 206, isFinal: true, slots: [{ from: 'jogo7' }, { from: 'jogo6' }] },
]

// Linhas douradas ligando os jogos. node = bolinha 6×6 na saída da caixa de
// origem; segs = [left, top, width, height] de cada trecho (sempre em ângulo
// reto, nunca diagonal). `from` diz qual jogo alimenta a linha — quando esse
// jogo já tem vencedor, a linha acende.
export const BRACKET_LINKS = [
  { from: 'jogo1', node: [163, 67], segs: [[166, 69, 25, 3], [190, 69, 3, 87], [191, 154, 25, 3]] },
  { from: 'jogo2', node: [163, 407], segs: [[166, 409, 118, 3], [283, 294, 3, 118], [284, 294, 118, 3]] },
  { from: 'jogo5', node: [349, 137], segs: [[352, 139, 25, 3], [376, 139, 3, 126], [377, 263, 25, 3]] },
  { from: 'jogo7', node: [535, 277], segs: [[538, 279, 30, 3], [567, 235, 3, 47], [568, 235, 30, 3]] },
  { from: 'jogo6', node: [855, 237], segs: [[828, 239, 30, 3], [827, 239, 3, 62], [798, 299, 30, 3]] },
  { from: 'jogo3', node: [1041, 67], segs: [[1019, 69, 25, 3], [1018, 69, 3, 156], [994, 223, 25, 3]] },
  { from: 'jogo4', node: [1041, 407], segs: [[1019, 409, 25, 3], [1018, 254, 3, 156], [994, 254, 25, 3]] },
]

export const FINAL_LAYOUT = {
  trophy: { left: 619, top: -1, width: 150, height: 140 },
  // 152 e não 164 como no protótipo: lá o "DECISÃO DO TÍTULO" ficava por
  // baixo da moldura da final e aparecia cortado pela metade.
  title: { left: 598, top: 152, width: 200 },
  box: { left: 598, top: 206, width: 200, height: 124 },
  vs: { left: 681, top: 257, width: 34, height: 22 },
}

export const gameById = (id) => BRACKET_GAMES.find((g) => g.id === id)

// ===== Modelo salvo no Firestore =====
// brackets/{modalityId} = { subtitle, published, games: { jogo1: {...} } }
// Cada jogo salvo: { label, winner: 0|1|null, slots: [{ classId, name, color,
// logoUrl, label }] }. Slot vazio = vaga ainda não definida.

export function emptySlot() {
  return { classId: null, name: null, color: null, logoUrl: null, label: null }
}

export function emptyBracket() {
  const games = {}
  for (const g of BRACKET_GAMES) {
    games[g.id] = { label: g.label, winner: null, slots: [emptySlot(), emptySlot()] }
  }
  return { subtitle: '', published: false, games }
}

// Junta o que veio do banco com a estrutura oficial — garante que os 8 jogos
// e os 2 slots sempre existam, mesmo que o doc esteja pela metade.
export function mergeBracket(saved) {
  const base = emptyBracket()
  if (!saved) return base
  const games = {}
  for (const g of BRACKET_GAMES) {
    const s = saved.games?.[g.id] || {}
    const slots = [0, 1].map((i) => ({ ...emptySlot(), ...(s.slots?.[i] || {}) }))
    games[g.id] = {
      label: (s.label || g.label).toUpperCase(),
      winner: s.winner === 0 || s.winner === 1 ? s.winner : null,
      slots,
    }
  }
  return { subtitle: saved.subtitle || '', published: !!saved.published, games }
}

// Turma de um slot, sempre com os dados frescos do cadastro (se a turma trocou
// de logo ou cor no admin, o chaveamento acompanha sem precisar salvar de novo).
export function resolveSlot(slot, classes = []) {
  if (!slot?.classId) return null
  const cls = classes.find((c) => c.id === slot.classId)
  return {
    classId: slot.classId,
    name: cls?.name || slot.name || 'Turma',
    color: cls?.color || slot.color || '#5A6C8C',
    logoUrl: cls?.logoUrl || slot.logoUrl || null,
  }
}

// Texto que aparece quando a vaga ainda não tem turma: o rótulo digitado no
// admin, o seed oficial ("3º B") ou o "VENCEDOR JOGO N" de quem alimenta o slot.
export function slotPlaceholder(gameId, index, games) {
  const custom = games?.[gameId]?.slots?.[index]?.label
  if (custom) return custom.toUpperCase()
  const spec = gameById(gameId)?.slots?.[index]
  if (!spec) return 'A DEFINIR'
  if (spec.seed) return spec.seed
  if (spec.from) return `VENCEDOR ${(games?.[spec.from]?.label || gameById(spec.from)?.label || '').toUpperCase()}`
  return 'A DEFINIR'
}

// Um slot com seed oficial (ou rótulo escrito à mão) é "vaga definida" — chip
// azul cheio. Um slot que só espera o vencedor de outro jogo é "a definir".
export function slotIsSeeded(gameId, index, games) {
  if (games?.[gameId]?.slots?.[index]?.label) return true
  return !!gameById(gameId)?.slots?.[index]?.seed
}

// Marca o vencedor e joga a turma vencedora direto na vaga do próximo jogo.
// Clicar de novo no mesmo lado desmarca (e limpa a vaga lá na frente).
export function applyWinner(games, gameId, winnerIndex) {
  const next = { ...games }
  const current = { ...next[gameId] }
  current.winner = current.winner === winnerIndex ? null : winnerIndex
  next[gameId] = current
  return pushForward(next, gameId)
}

// Leva o resultado de um jogo pra frente e segue a corrente até a final: se
// mudar o vencedor do Jogo 1, o Jogo 5 é atualizado, e se aquilo invalidar o
// resultado do Jogo 5, o Jogo 7 e a Final também são corrigidos.
function pushForward(games, gameId) {
  const to = gameById(gameId)?.to
  if (!to) return games

  const current = games[gameId]
  const target = { ...games[to.game], slots: games[to.game].slots.map((s) => ({ ...s })) }
  target.slots[to.slot] = current.winner === null ? emptySlot() : carrySlot(games, gameId, current.winner)
  // Se a vaga que mudou era a do vencedor lá na frente, aquele resultado não
  // vale mais — melhor limpar do que exibir um vencedor que não existe.
  if (target.winner === to.slot) target.winner = null

  const next = { ...games, [to.game]: target }
  return pushForward(next, to.game)
}

// Com turma escolhida, leva a turma inteira (nome + foto). Sem turma, leva o
// rótulo da vaga ("3º B") — mas só se for um rótulo de verdade, pra não
// empurrar "VENCEDOR JOGO 5" pra frente como se fosse um time.
function carrySlot(games, gameId, winnerIndex) {
  const src = games[gameId].slots[winnerIndex]
  if (src.classId) return { ...src, label: null }
  return {
    ...emptySlot(),
    label: slotIsSeeded(gameId, winnerIndex, games) ? slotPlaceholder(gameId, winnerIndex, games) : null,
  }
}

// Campeão = vencedor da final (só existe depois que o admin marca).
export function championOf(games) {
  const final = games?.final
  if (final?.winner !== 0 && final?.winner !== 1) return null
  return final.slots[final.winner]
}
