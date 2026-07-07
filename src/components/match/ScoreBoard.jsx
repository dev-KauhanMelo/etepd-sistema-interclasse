import FlipScore from './FlipScore'

// O placar de mesa completo, recriado a partir do SVG de referência:
// abas de pendurar, corpo trapezoidal, cartões com argolas e o × no meio.
export default function ScoreBoard({ scoreA, scoreB }) {
  return (
    <div className="w-fit mx-auto select-none">
      <div className="flex justify-between px-4">
        <div className="board-tab" />
        <div className="board-tab" />
      </div>
      <div className="board-body px-6 pt-5 pb-4">
        <div className="flex items-center justify-center gap-3">
          <BoardCard value={scoreA} />
          <span className="text-white text-xl font-bold px-0.5">×</span>
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
      <div className="board-ring left-1.5" />
      <div className="board-ring right-1.5" />
      <FlipScore value={value} size="lg" />
    </div>
  )
}
