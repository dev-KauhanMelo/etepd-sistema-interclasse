import { useState } from 'react'
import Header from '../../components/layout/Header'
import Card from '../../components/common/Card'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import TeamCrest from '../../components/match/TeamCrest'
import { TrophyIcon } from '../../components/common/Icons'
import { useModalities } from '../../hooks/useModalities'
import { useStandings } from '../../hooks/useStandings'
import { useMatches } from '../../hooks/useMatches'
import { useClasses } from '../../hooks/useClasses'
import { PHASE_LABELS } from '../../utils/constants'

export default function Standings() {
  const { modalities } = useModalities()
  const { classes } = useClasses()
  const [modalityId, setModalityId] = useState('')
  const [tab, setTab] = useState('classificacao')

  const activeModality = modalityId || modalities[0]?.id
  const { standings, loading } = useStandings(activeModality)
  const { matches } = useMatches()

  const bracketMatches = matches.filter((m) => m.modalityId === activeModality && m.phase !== 'grupos')
  const phases = ['oitavas', 'quartas', 'semifinal', 'final'].filter((p) => bracketMatches.some((m) => m.phase === p))

  const teamOf = (s) => {
    const cls = classes.find((c) => c.id === s.classId)
    return { name: s.className || cls?.name || s.classId, color: cls?.color }
  }

  const podium = standings.slice(0, 3)
  const rest = standings.slice(3)

  return (
    <div>
      <Header title="Ranking & Chaveamento" subtitle="Quem está dominando o JIPD?" />

      <div className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-none">
        {modalities.map((m) => (
          <Chip key={m.id} active={activeModality === m.id} onClick={() => setModalityId(m.id)}>
            {m.name}
          </Chip>
        ))}
      </div>

      <div className="p-4 pt-2">
        <div className="flex gap-2 mb-4 bg-white rounded-2xl p-1 border border-brand-mist/30 shadow-card">
          <TabButton active={tab === 'classificacao'} onClick={() => setTab('classificacao')}>Classificação</TabButton>
          <TabButton active={tab === 'chaveamento'} onClick={() => setTab('chaveamento')}>Chaveamento</TabButton>
        </div>

        {tab === 'classificacao' ? (
          loading ? <Loader /> : standings.length === 0 ? (
            <EmptyState icon={<TrophyIcon className="w-10 h-10" />} title="Ranking ainda não disponível" subtitle="Os pontos aparecem aqui quando os jogos começarem" />
          ) : (
            <>
              {/* Pódio dos 3 primeiros */}
              {podium.length >= 2 && (
                <div className="flex items-end justify-center gap-3 mb-4 mt-2 animate-pop-in">
                  {[1, 0, 2].map((idx) => podium[idx] && (
                    <PodiumSpot key={podium[idx].id} standing={podium[idx]} team={teamOf(podium[idx])} place={idx + 1} />
                  ))}
                </div>
              )}

              <Card className="p-0 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-brand-steel text-xs bg-brand-paper/70">
                      <th className="py-2.5 pl-4">#</th>
                      <th className="py-2.5">Turma</th>
                      <th className="py-2.5 text-center font-bold">P</th>
                      <th className="py-2.5 text-center">V</th>
                      <th className="py-2.5 text-center">E</th>
                      <th className="py-2.5 text-center">D</th>
                      <th className="py-2.5 text-center pr-4">SG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((s, i) => (
                      <tr key={s.id} className="border-t border-brand-paper">
                        <td className={`py-2.5 pl-4 score-number ${i < 3 ? 'text-brand' : 'text-brand-mist'}`}>{i + 1}</td>
                        <td className="py-2.5 font-bold text-brand-deep">
                          <span className="inline-flex items-center gap-2">
                            <TeamCrest team={teamOf(s)} size="sm" />
                            {teamOf(s).name}
                          </span>
                        </td>
                        <td className="py-2.5 text-center score-number text-brand-navy">{s.points}</td>
                        <td className="py-2.5 text-center text-brand-steel">{s.wins}</td>
                        <td className="py-2.5 text-center text-brand-steel">{s.draws}</td>
                        <td className="py-2.5 text-center text-brand-steel">{s.losses}</td>
                        <td className="py-2.5 text-center pr-4 text-brand-steel">{(s.scoredFor || 0) - (s.scoredAgainst || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </>
          )
        ) : (
          phases.length === 0 ? (
            <EmptyState icon={<TrophyIcon className="w-10 h-10" />} title="Chaveamento ainda não definido" subtitle="O mata-mata aparece aqui depois da fase de grupos" />
          ) : (
            phases.map((phase) => (
              <div key={phase} className="mb-5">
                <p className="headline text-sm text-brand-steel mb-2">{PHASE_LABELS[phase]}</p>
                {bracketMatches.filter((m) => m.phase === phase).map((m) => (
                  <Card key={m.id} className="mb-2 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 flex-1 min-w-0">
                      <TeamCrest team={m.teamA} size="sm" />
                      <span className="text-xs font-bold text-brand-deep truncate">{m.teamA?.name}</span>
                    </span>
                    <span className="score-number text-xl text-brand-navy shrink-0">
                      {m.scoreA ?? 0} <span className="text-brand-mist text-sm">×</span> {m.scoreB ?? 0}
                    </span>
                    <span className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span className="text-xs font-bold text-brand-deep truncate">{m.teamB?.name}</span>
                      <TeamCrest team={m.teamB} size="sm" />
                    </span>
                  </Card>
                ))}
              </div>
            ))
          )
        )}
      </div>
    </div>
  )
}

const medals = { 1: '🥇', 2: '🥈', 3: '🥉' }

function PodiumSpot({ standing, team, place }) {
  const height = place === 1 ? 'h-24' : place === 2 ? 'h-16' : 'h-12'
  return (
    <div className="flex flex-col items-center flex-1 max-w-[110px]">
      <span className="text-xl mb-1">{medals[place]}</span>
      <TeamCrest team={team} size={place === 1 ? 'lg' : 'md'} />
      <p className="text-xs font-bold text-brand-deep mt-1.5 truncate max-w-full">{team.name}</p>
      <p className="text-[10px] text-brand-steel mb-1.5">{standing.points} pts</p>
      <div className={`w-full ${height} rounded-t-xl ${place === 1 ? 'jipd-gradient' : 'bg-brand-mist/40'} flex items-start justify-center pt-1.5`}>
        <span className={`score-number text-lg ${place === 1 ? 'text-white' : 'text-brand-deep'}`}>{place}º</span>
      </div>
    </div>
  )
}

function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition ${
        active ? 'bg-brand text-white shadow-sm' : 'bg-white text-brand-steel border border-brand-mist/40'
      }`}
    >
      {children}
    </button>
  )
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${active ? 'bg-brand text-white shadow-sm' : 'text-brand-steel'}`}
    >
      {children}
    </button>
  )
}
