import MatchRow from './MatchRow'
import { useModalities } from '../../hooks/useModalities'

// Mantido como fachada: várias telas já importam LiveScoreCard. O desenho do
// card vive em MatchRow, usado também pelo Cronograma — uma linguagem só.
export default function LiveScoreCard({ match }) {
  const { modalities } = useModalities()
  const modName = modalities.find((m) => m.id === match.modalityId)?.name || ''
  return (
    <div className="mb-2.5 animate-pop-in">
      <MatchRow match={match} modName={modName} />
    </div>
  )
}
