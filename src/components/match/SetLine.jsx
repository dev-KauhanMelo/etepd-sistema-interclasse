// Linha de sets: só aparece em jogo que se decide em sets (vôlei). O placar
// grande já mostra os sets ganhos — o que falta pro aluno entender o momento
// da partida é o set em andamento e como terminaram os anteriores.
export default function SetLine({ match, className = '' }) {
  const sets = match?.periodScores || []
  const emJogo = match?.status === 'live' || match?.status === 'paused'
  const pa = Number(match?.pointsA) || 0
  const pb = Number(match?.pointsB) || 0
  const temPontos = emJogo && (pa > 0 || pb > 0)

  if (sets.length === 0 && !temPontos) return null

  return (
    <p className={`font-bracket font-semibold text-[11px] tracking-[0.06em] ${className}`}>
      {sets.map((s, i) => (
        <span key={i} className="text-arena-muted">
          {i > 0 && <span className="opacity-40"> · </span>}
          {i + 1}º {s.scoreA}×{s.scoreB}
        </span>
      ))}
      {temPontos && (
        <span className="text-gold">
          {sets.length > 0 && <span className="opacity-40"> · </span>}
          {sets.length + 1}º set {pa}×{pb}
        </span>
      )}
    </p>
  )
}
