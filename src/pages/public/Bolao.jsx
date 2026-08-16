import { useState } from 'react'
import Header from '../../components/layout/Header'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import TeamCrest from '../../components/match/TeamCrest'
import MatchStatusBadge from '../../components/match/MatchStatusBadge'
import ProfileSetup from '../../components/bolao/ProfileSetup'
import PalpiteWidget from '../../components/bolao/PalpiteWidget'
import { NodesIcon, TrophyIcon, SoccerBallIcon, CrownIcon, FireIcon } from '../../components/common/Icons'
import { useMatches } from '../../hooks/useMatches'
import { useAllPredictions } from '../../hooks/usePredictions'
import { getFanProfile } from '../../utils/fanProfile'
import { buildBolaoRanking } from '../../utils/bolao'
import SearchBar from '../../components/common/SearchBar'
import { useModalities } from '../../hooks/useModalities'
import { filterMatches } from '../../utils/matchFilters'
import { matchTime, formatDayHeader } from '../../utils/formatDate'

export default function Bolao() {
  const [profile, setProfile] = useState(getFanProfile())
  const [tab, setTab] = useState('palpites')
  const [query, setQuery] = useState('')
  const [modalityFilter, setModalityFilter] = useState('all')
  const { matches, loading } = useMatches()
  const { modalities } = useModalities()
  const { predictions } = useAllPredictions()

  if (loading) return <Loader />

  const open = filterMatches(
    matches.filter((m) => m.status === 'scheduled'),
    { query, modalityId: modalityFilter, modalities }
  ).sort((a, b) => (a.scheduledAt?.seconds || 0) - (b.scheduledAt?.seconds || 0))
  const inPlay = matches.filter((m) => m.status === 'live')
  const ranking = buildBolaoRanking(predictions, matches)

  return (
    <div>
      <Header title="BOLÃO JIPD" subtitle="Crave o placar e domine o ranking" />

      <div className="p-4 pt-2">
        <div className="cut-corner-sm bg-arena-panel p-1 flex gap-1 mb-4">
          <TabButton active={tab === 'palpites'} onClick={() => setTab('palpites')}>
            <SoccerBallIcon className="w-4 h-4" /> Palpites
          </TabButton>
          <TabButton active={tab === 'ranking'} onClick={() => setTab('ranking')}>
            <TrophyIcon className="w-4 h-4" /> Cravadores
          </TabButton>
        </div>

        {tab === 'palpites' ? (
          <>
            {!profile ? (
              <ProfileSetup onDone={setProfile} />
            ) : (
              <p className="text-sm text-arena-muted mb-3 inline-flex items-center gap-1.5 font-bracket font-semibold">
                Fala, <span className="font-bold text-white">{profile.name}</span>
                {profile.className ? ` (${profile.className})` : ''}! Bora cravar?
                <FireIcon className="w-4 h-4 text-amber-500" />
              </p>
            )}

            {inPlay.length > 0 && (
              <>
                <GroupTitle live>A torcida está dizendo...</GroupTitle>
                {inPlay.map((m) => <BolaoMatchCard key={m.id} match={m} profile={profile} />)}
              </>
            )}

            <GroupTitle>Jogos abertos pra palpite</GroupTitle>
            <SearchBar value={query} onChange={setQuery} placeholder="Buscar turma ou modalidade…" className="mb-2" />
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
              <FilterChip active={modalityFilter === 'all'} onClick={() => setModalityFilter('all')}>Todas</FilterChip>
              {modalities.map((m) => (
                <FilterChip key={m.id} active={modalityFilter === m.id} onClick={() => setModalityFilter(m.id)}>
                  {m.name}
                </FilterChip>
              ))}
            </div>
            {open.length === 0 ? (
              <EmptyState
                icon={<NodesIcon className="w-10 h-10" />}
                title="Nenhum jogo aberto agora"
                subtitle="Assim que a comissão agendar novos jogos, eles aparecem aqui"
              />
            ) : (
              open.map((m) => <BolaoMatchCard key={m.id} match={m} profile={profile} />)
            )}
          </>
        ) : (
          <RankingTab ranking={ranking} profile={profile} />
        )}
      </div>
    </div>
  )
}

function BolaoMatchCard({ match, profile }) {
  return (
    <div className="cut-corner bg-arena-panel border border-white/[0.07] p-4 mb-3 animate-pop-in">
      <div className="flex items-center justify-between mb-3">
        <MatchStatusBadge status={match.status} />
        <span className="text-xs font-medium text-arena-muted font-bracket font-semibold uppercase tracking-wide">
          {formatDayHeader(match.scheduledAt)} · {matchTime(match)}
        </span>
      </div>
      <div className="flex items-center justify-center gap-3 mb-3">
        <span className="flex items-center gap-2 flex-1 justify-end min-w-0">
          <span className="text-xs font-bold text-white truncate font-bracket tracking-wide">{match.teamA?.name}</span>
          <TeamCrest team={match.teamA} size="sm" />
        </span>
        <span className="text-gold font-bracket-display text-xs">VS</span>
        <span className="flex items-center gap-2 flex-1 min-w-0">
          <TeamCrest team={match.teamB} size="sm" />
          <span className="text-xs font-bold text-white truncate font-bracket tracking-wide">{match.teamB?.name}</span>
        </span>
      </div>
      {profile ? (
        <PalpiteWidget match={match} profile={profile} />
      ) : (
        <p className="text-center text-xs text-arena-muted bg-white/5 px-3 py-2.5 cut-corner-sm">
          Crie seu perfil no topo da página pra liberar os palpites
        </p>
      )}
    </div>
  )
}

const medalColors = ['text-amber-400', 'text-slate-400', 'text-amber-700']

function RankingTab({ ranking, profile }) {
  const scored = ranking.filter((r) => r.total > 0)

  if (scored.length === 0) {
    return (
      <EmptyState
        icon={<TrophyIcon className="w-10 h-10" />}
        title="O ranking ainda está zerado"
        subtitle="Os pontos aparecem quando os primeiros jogos com palpite terminarem. Garanta já os seus!"
      />
    )
  }

  return (
    <>
      <div className="cut-corner bg-arena-panel border border-white/[0.07] overflow-hidden animate-pop-in">
        {scored.map((r, i) => {
          const isMe = profile && r.userId === profile.id
          return (
            <div
              key={r.userId}
              className={`flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] last:border-0 ${isMe ? 'bg-gold/10' : ''}`}
            >
              <span className="w-8 flex justify-center shrink-0">
                {i < 3 ? <CrownIcon className={`w-5 h-5 ${medalColors[i]}`} /> : <span className="font-bracket-display text-arena-dim">{i + 1}</span>}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate font-bracket tracking-wide">
                  {r.name} {isMe && <span className="text-gold text-[10px] font-black uppercase ml-1">você</span>}
                </p>
                <p className="text-[11px] text-arena-muted">
                  {r.className || 'Sem turma'} · {r.exact} placar{r.exact === 1 ? '' : 'es'} cravado{r.exact === 1 ? '' : 's'}
                </p>
              </div>
              <span className="font-bracket-display text-xl text-gold shrink-0">{r.points} <span className="text-xs text-arena-muted font-bracket font-bold">pts</span></span>
            </div>
          )
        })}
      </div>
      <p className="text-[11px] text-arena-muted text-center mt-3 font-bracket font-semibold">
        Placar exato = 5 pts · Vencedor certo = 2 pts · Desempate por placares cravados
      </p>
    </>
  )
}

function GroupTitle({ children, live = false }) {
  return (
    <h2 className="flex items-center gap-2.5 mt-4 mb-3">
      {live
        ? <span className="w-2.5 h-2.5 bg-live rounded-full pulse-live" />
        : <span className="section-slash" aria-hidden="true" />}
      <span className="font-bracket-display text-base text-white tracking-[0.05em] uppercase">{children}</span>
    </h2>
  )
}

function FilterChip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3.5 py-[5px] font-bracket font-bold text-xs tracking-[0.08em] uppercase transition ${
        active ? 'cut-corner-sm bg-gold text-brand-ink' : 'border border-white/[0.12] text-arena-muted hover:text-white'
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
      className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 font-bracket font-bold text-xs tracking-[0.1em] uppercase transition ${
        active ? 'cut-corner-sm bg-gold text-brand-ink' : 'text-arena-muted hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
