import { useState } from 'react'
import Header from '../../components/layout/Header'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import TeamCrest from '../../components/match/TeamCrest'
import { TrophyIcon, CrownIcon } from '../../components/common/Icons'
import BracketBoard from '../../components/bracket/BracketBoard'
import PointsTable from '../../components/standings/PointsTable'
import TimeTable from '../../components/standings/TimeTable'
import GroupStage from '../../components/bracket/GroupStage'
import { useModalities } from '../../hooks/useModalities'
import FilterBar from '../../components/common/FilterBar'
import { useStandings, useAllStandings, aggregateGeneral } from '../../hooks/useStandings'
import { useMatches } from '../../hooks/useMatches'
import { useClasses } from '../../hooks/useClasses'
import { useBracket } from '../../hooks/useBracket'
import { PHASE_LABELS } from '../../utils/constants'
import { hasTable } from '../../utils/standings'
import { mergeBracket } from '../../utils/bracket'

// Modalidades femininas de Esportes que são fase de grupos (edital 3.3).
// Handebol, Queimado e Barra Bandeira ficam de fora — essas são mata-mata.
const GRUPOS_FEMININO = ['voleibol', 'basquete', 'futsal', 'futmesa', 'quadrado vôlei', 'quadrado volei']

export default function Standings() {
  const { modalities } = useModalities()
  const { classes } = useClasses()
  const [modalityId, setModalityId] = useState('geral')
  const [tab, setTab] = useState('classificacao')
  const [modQuery, setModQuery] = useState('')

  const isGeral = modalityId === 'geral'
  const activeModality = isGeral ? modalities[0]?.id : (modalityId || modalities[0]?.id)
  const modality = modalities.find((m) => m.id === activeModality)
  // Free Fire usa a tabela por pontos (LBFF); o resto segue o formato clássico.
  const format = modality?.standingsFormat || 'mata-mata'
  // Free Fire e Cubo Mágico são disputados por pontuação/tempo, não por
  // chave: a aba de chaveamento não se aplica e some (como na visão Geral).
  const semChaveamento = isGeral || format === 'pontos' || format === 'tempo'
  // Mata-mata puro não tem tabela nenhuma — só o chaveamento.
  const semTabela = !isGeral && !hasTable(format)
  // Esportes com disputa feminina em fase de grupos (edital 3.3) ganham uma
  // aba própria: no masculino a mesma modalidade é mata-mata, então as duas
  // disputas não cabem na mesma tabela.
  const temFeminino = !isGeral && GRUPOS_FEMININO.some((g) => (modality?.name || '').toLowerCase().includes(g))

  // Abas disponíveis para esta modalidade
  const tabs = isGeral
    ? []
    : [
        !semTabela && { key: 'classificacao', label: 'Classificação' },
        !semChaveamento && { key: 'chaveamento', label: 'Chaveamento' },
        temFeminino && { key: 'feminino', label: 'Feminino' },
      ].filter(Boolean)
  // Se a aba escolhida não existe nesta modalidade, cai na primeira
  const activeTab = tabs.some((t) => t.key === tab) ? tab : tabs[0]?.key
  const { standings: modStandings, loading: modLoading } = useStandings(activeModality, format)
  const { rows: allRows, loading: allLoading } = useAllStandings()
  const { matches } = useMatches()

  // GERAL = soma da campanha de cada turma em todas as modalidades
  const standings = isGeral ? aggregateGeneral(allRows) : modStandings
  const loading = isGeral ? allLoading : modLoading

  const bracketMatches = matches.filter((m) => m.modalityId === activeModality && m.phase !== 'grupos')
  const phases = ['oitavas', 'quartas', 'semifinal', 'final'].filter((p) => bracketMatches.some((m) => m.phase === p))

  const teamOf = (s) => {
    const cls = classes.find((c) => c.id === s.classId)
    return { name: s.className || cls?.name || s.classId, color: cls?.color, logoUrl: cls?.logoUrl }
  }

  const podium = standings.slice(0, 3)

  return (
    <div>
      <Header title="RANKING" subtitle="Quem está dominando o JIPD?" />

      <div className="px-4 pt-1 pb-2">
        <FilterBar
          query={modQuery}
          onQueryChange={setModQuery}
          placeholder="Buscar modalidade…"
          groups={[{
            key: 'mod',
            label: 'Modalidade',
            value: modalityId,
            onChange: setModalityId,
            // a busca filtra as próprias opções do painel
            options: [
              { value: 'geral', label: 'Geral' },
              ...modalities
                .filter((m) => !modQuery.trim() || m.name.toLowerCase().includes(modQuery.trim().toLowerCase()))
                .map((m) => ({ value: m.id, label: m.name })),
            ],
          }]}
        />
      </div>

      <div className="p-4 pt-2">
        {tabs.length > 1 && (
          <div className="cut-corner-sm bg-arena-panel p-1 flex gap-1 mb-4">
            {tabs.map((t) => (
              <TabButton key={t.key} active={activeTab === t.key} onClick={() => setTab(t.key)}>
                {t.label}
              </TabButton>
            ))}
          </div>
        )}
        {isGeral && (
          <p className="font-bracket font-bold text-[10px] tracking-[0.2em] text-arena-dim uppercase mb-3">
            Soma de todas as modalidades
          </p>
        )}

        {activeTab === 'feminino' ? (
          <GroupStage title={`${modality?.name} · Fase de grupos`} />
        ) : activeTab === 'chaveamento' ? (
          <BracketTab
            modality={modality}
            classes={classes}
            phases={phases}
            bracketMatches={bracketMatches}
          />
        ) : isGeral || activeTab === 'classificacao' ? (
          loading ? <Loader /> : standings.length === 0 ? (
            <EmptyState icon={<TrophyIcon className="w-10 h-10" />} title="Ranking ainda não disponível" subtitle="Os pontos aparecem aqui quando os jogos começarem" />
          ) : !isGeral && format === 'pontos' ? (
            <PointsTable standings={standings} teamOf={teamOf} title={modality?.name} subtitle={modality?.name} />
          ) : !isGeral && format === 'tempo' ? (
            <TimeTable standings={standings} teamOf={teamOf} subtitle={modality?.name} />
          ) : (
            <>
              {/* Pódio dos 3 primeiros */}
              {podium.length >= 2 && (
                <div className="flex items-end justify-center gap-2.5 mb-5 mt-2 animate-pop-in">
                  {[1, 0, 2].map((idx) => podium[idx] && (
                    <PodiumSpot key={podium[idx].id} standing={podium[idx]} team={teamOf(podium[idx])} place={idx + 1} />
                  ))}
                </div>
              )}

              {/* Cabeçalho da tabela */}
              <div className="flex items-center gap-2 px-2 pb-1.5 font-bracket font-bold text-[11px] tracking-[0.12em] text-arena-dim uppercase">
                <span className="w-7" aria-hidden="true" />
                <span className="flex-1">Turma</span>
                <span className="w-8 text-center">P</span>
                <span className="w-6 text-center">V</span>
                <span className="w-6 text-center">E</span>
                <span className="w-6 text-center">D</span>
                <span className="w-8 text-center">SG</span>
              </div>

              {/* Linhas separadas; o líder ganha o degradê dourado */}
              <div className="flex flex-col gap-[5px]">
                {standings.map((s, i) => {
                  const team = teamOf(s)
                  const leader = i === 0
                  return (
                    <div
                      key={s.id}
                      className={`flex items-center gap-2 px-2 py-[9px] border ${
                        leader
                          ? 'bg-[linear-gradient(90deg,rgba(245,234,21,0.14),rgba(18,26,43,0.7))] border-gold/[0.55]'
                          : 'bg-arena-panel border-white/[0.06]'
                      }`}
                    >
                      <span className={`w-7 text-center font-bracket-display text-base ${leader ? 'text-gold' : 'text-arena-dim'}`}>
                        {i + 1}
                      </span>
                      <span className="flex-1 min-w-0 flex items-center gap-2">
                        <TeamCrest team={team} size="sm" />
                        <span className={`font-bracket font-bold text-sm tracking-[0.05em] truncate ${leader ? 'text-gold' : 'text-arena-text'}`}>
                          {team.name}
                        </span>
                      </span>
                      <span className={`w-8 text-center font-bracket-display text-[15px] ${leader ? 'text-gold' : 'text-white'}`}>{s.points}</span>
                      <span className="w-6 text-center font-bracket font-semibold text-[13px] text-arena-muted">{s.wins}</span>
                      <span className="w-6 text-center font-bracket font-semibold text-[13px] text-arena-muted">{s.draws}</span>
                      <span className="w-6 text-center font-bracket font-semibold text-[13px] text-arena-muted">{s.losses}</span>
                      <span className="w-8 text-center font-bracket font-semibold text-[13px] text-arena-muted">
                        {(s.scoredFor || 0) - (s.scoredAgainst || 0) > 0 ? '+' : ''}{(s.scoredFor || 0) - (s.scoredAgainst || 0)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </>
          )
        ) : null}
      </div>
    </div>
  )
}


function BracketTab({ modality, classes, phases, bracketMatches }) {
  const { bracket, loading, loadedFor } = useBracket(modality?.id)

  // Espera os dados serem os DESTA modalidade — no instante da troca o hook
  // ainda pode estar segurando o chaveamento da modalidade anterior.
  if (loading || loadedFor !== modality?.id) return <Loader />

  if (bracket?.published) {
    const model = mergeBracket(bracket)
    return (
      <div className="animate-pop-in">
        <BracketBoard
          title={modality?.name}
          subtitle={model.subtitle || `${modality?.name || 'Modalidade'} · Mata-mata`}
          games={model.games}
          classes={classes}
        />
      </div>
    )
  }

  if (phases.length === 0) {
    return (
      <EmptyState
        icon={<TrophyIcon className="w-10 h-10" />}
        title="Chaveamento ainda não definido"
        subtitle="O mata-mata aparece aqui depois da fase de grupos"
      />
    )
  }

  return phases.map((phase) => (
    <div key={phase} className="mb-5">
      <p className="font-bracket-display text-sm text-gold tracking-wide uppercase mb-2">{PHASE_LABELS[phase]}</p>
      {bracketMatches.filter((m) => m.phase === phase).map((m) => (
        <div key={m.id} className="cut-tl bg-arena-panel border border-white/[0.07] mb-1.5 px-3.5 py-2.5 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 flex-1 min-w-0">
            <TeamCrest team={m.teamA} size="sm" />
            <span className="font-bracket font-bold text-xs text-white truncate">{m.teamA?.name}</span>
          </span>
          <span className="font-bracket-display text-xl text-white shrink-0">
            {m.scoreA ?? 0} <span className="text-gold text-sm">×</span> {m.scoreB ?? 0}
          </span>
          <span className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            <span className="font-bracket font-bold text-xs text-white truncate">{m.teamB?.name}</span>
            <TeamCrest team={m.teamB} size="sm" />
          </span>
        </div>
      ))}
    </div>
  ))
}

// Pódio arena: barra na cor da turma; campeão em degradê dourado com brilho.
function PodiumSpot({ standing, team, place }) {
  const first = place === 1
  const height = first ? 'h-[86px]' : place === 2 ? 'h-[58px]' : 'h-11'
  const color = team.color || '#5A6C8C'
  return (
    <div className={`flex flex-col items-center flex-1 ${first ? 'max-w-[112px]' : 'max-w-[104px]'}`}>
      {first && <CrownIcon className="w-[22px] h-[22px] text-gold mb-0.5" />}
      <span className={first ? 'ring-[3px] ring-gold rounded-full shadow-[0_0_24px_rgba(245,234,21,0.4)]' : ''}>
        <TeamCrest team={team} size={first ? 'lg' : 'md'} />
      </span>
      <p className={`font-bracket font-bold text-xs mt-1.5 tracking-[0.06em] truncate max-w-full ${first ? 'text-gold text-[13px]' : 'text-arena-text'}`}>
        {team.name} · {standing.points} pts
      </p>
      <div
        className={`w-full ${height} mt-2 flex items-start justify-center pt-1.5 ${
          first ? 'bg-[linear-gradient(180deg,rgba(245,234,21,0.22),rgba(245,234,21,0.04))]' : 'bg-arena-panel'
        }`}
        style={{ borderTop: `3px solid ${first ? '#F5EA15' : color}` }}
      >
        <span className={`font-bracket-display ${first ? 'text-[26px] text-gold' : 'text-xl text-arena-dim'}`}>{place}</span>
      </div>
    </div>
  )
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 font-bracket font-bold text-xs tracking-[0.1em] uppercase transition ${
        active ? 'cut-corner-sm bg-gold text-brand-ink' : 'text-arena-muted hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
