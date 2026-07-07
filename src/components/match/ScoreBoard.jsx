import FlipScore from './FlipScore'

// O placar de mesa completo, recriado do PNG/SVG de referência:
// abas de pendurar, corpo trapezoidal, cartões com argolas,
// dígitos com zero à esquerda (02 × 01) e brilho quente embaixo.
export default function ScoreBoard({ scoreA, scoreB }) {
  return (
    <div className="w-fit mx-auto select-none board-glow">
      <div className="flex justify-between px-3">
        <div className="board-tab" />
        <div className="board-tab" />
      </div>
      <div className="board-body px-4 pt-3.5 pb-3">
        <div className="flex items-center justify-center gap-2">
          <BoardCard value={scoreA} />
          <span className="text-white text-sm font-bold px-0.5">×</span>
          <BoardCard value={scoreB} />
        </div>
      </div>
      <div className="board-base" />
    </div>
  )
}

function BoardCard({ value }) {
  return (
    <div className="relative">
      <div className="board-ring left-1" />
      <div className="board-ring right-1" />
      <FlipScore value={value} size="lg" pad />
    </div>
  )
}
