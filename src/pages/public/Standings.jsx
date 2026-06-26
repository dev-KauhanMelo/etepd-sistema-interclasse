import { useState } from 'react'
import Header from '../../components/layout/Header'
import Card from '../../components/common/Card'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import { useModalities } from '../../hooks/useModalities'
import { useStandings } from '../../hooks/useStandings'
import { useMatches } from '../../hooks/useMatches'
import { PHASE_LABELS } from '../../utils/constants'

export default function Standings() {
  const { modalities } = useModalities()
  const [modalityId, setModalityId] = useState('')
  const [tab, setTab] = useState('classificacao')

  const activeModality = modalityId || modalities[0]?.id
  const { standings, loading } = useStandings(activeModality)
  const { matches } = useMatches()

  const bracketMatches = matches.filter((m) => m.modalityId === activeModality && m.phase !== 'grupos')
  const phases = ['oitavas', 'quartas', 'semifinal', 'final'].filter((p) => bracketMatches.some((m) => m.phase === p))

  return (
    <div>
      <Header title="Ranking & Chaveamento" />
      <div className="p-4">
        <select
          value={activeModality || ''}
          onChange={(e) => setModalityId(e.target.value)}
          className="w-full mb-4 rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          {modalities.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <div className="flex gap-2 mb-4">
          <TabButton active={tab === 'classificacao'} onClick={() => setTab('classificacao')}>Classificação</TabButton>
          <TabButton active={tab === 'chaveamento'} onClick={() => setTab('chaveamento')}>Chaveamento</TabButton>
        </div>

        {tab === 'classificacao' ? (
          loading ? <Loader /> : standings.length === 0 ? (
            <EmptyState title="Ranking ainda não disponível" />
          ) : (
            <Card>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 text-xs">
                    <th className="pb-2">Turma</th>
                    <th className="pb-2 text-center">P</th>
                    <th className="pb-2 text-center">V</th>
                    <th className="pb-2 text-center">E</th>
                    <th className="pb-2 text-center">D</th>
                    <th className="pb-2 text-center">SG</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((s, i) => (
                    <tr key={s.id} className="border-t border-slate-50">
                      <td className="py-2 font-medium">{i + 1}º {s.className || s.classId}</td>
                      <td className="py-2 text-center font-semibold">{s.points}</td>
                      <td className="py-2 text-center">{s.wins}</td>
                      <td className="py-2 text-center">{s.draws}</td>
                      <td className="py-2 text-center">{s.losses}</td>
                      <td className="py-2 text-center">{(s.scoredFor || 0) - (s.scoredAgainst || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )
        ) : (
          phases.length === 0 ? <EmptyState title="Chaveamento ainda não definido" /> : (
            phases.map((phase) => (
              <div key={phase} className="mb-4">
                <p className="text-sm font-semibold text-slate-500 mb-2">{PHASE_LABELS[phase]}</p>
                {bracketMatches.filter((m) => m.phase === phase).map((m) => (
                  <Card key={m.id} className="mb-2">
                    <p className="text-sm font-medium">{m.teamA?.name} {m.scoreA ?? 0} × {m.scoreB ?? 0} {m.teamB?.name}</p>
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

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-xl text-sm font-medium ${active ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500'}`}
    >
      {children}
    </button>
  )
}
