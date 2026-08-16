import { useState } from 'react'
import Header from '../../components/layout/Header'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import TeamCrest from '../../components/match/TeamCrest'
import ProfileSetup from '../../components/bolao/ProfileSetup'
import PalpiteWidget from '../../components/bolao/PalpiteWidget'
import { NodesIcon, TrophyIcon, SoccerBallIcon, CrownIcon, FireIcon } from '../../components/common/Icons'
import { useMatches } from '../../hooks/useMatches'
import { useAllPredictions } from '../../hooks/usePredictions'
import { getFanProfile } from '../../utils/fanProfile'
import { buildBolaoRanking } from '../../utils/bolao'
import FilterBar from '../../components/common/FilterBar'
import ShowMore from '../../components/common/ShowMore'
import { useModalities } from '../../hooks/useModalities'
import { filterMatches } from '../../utils/matchFilters'
import { matchTime, isTimeTBD, formatDayHeader } from '../../utils/formatDate'

export default function Bolao() {
  const [profile, setProfile] = useState(getFanProfile())
  const [tab, setTab] = useState('palpites')
  const [query, setQuery] = useState('')
  const [modalityFilter, setModalityFilter] = useState('all')
  const [showAll, setShowAll] = useState(false)
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
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              placeholder="Buscar turma ou modalidade…"
              resultCount={open.length}
              totalCount={matches.filter((m) => m.status === 'scheduled').length}
              groups={[{
                key: 'mod', label: 'Modalidade', value: modalityFilter, onChange: setModalityFilter,
                options: [{ value: 'all', label: 'Todas' }, ...modalities.map((m) => ({ value: m.id, label: m.name }))],
              }]}
            />
            <div className="h-3" />
            {open.length === 0 ? (
              <EmptyState
                icon={<NodesIcon className="w-10 h-10" />}
                title="Nenhum jogo aberto agora"
                subtitle="Assim que a comissão agendar novos jogos, eles aparecem aqui"
              />
            ) : (
              <>
                {(showAll ? open : open.slice(0, 5)).map((m) => (
                  <BolaoMatchCard key={m.id} match={m} profile={profile} />
                ))}
                <ShowMore hidden={showAll ? 0 : Math.max(0, open.length - 5)} onClick={() => setShowAll(true)} label="Ver todos pra palpitar" />
              </>
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
  const scheduled = match.status === 'scheduled'
  return (
    <div className="cut-corner bg-arena-panel border border-white/[0.07] p-3.5 mb-3 animate-pop-in">
      {/* Meta em uma linha só, sem quebra */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`cut-corner-sm font-bracket font-bold text-[10px] tracking-[0.12em] uppercase px-2.5 py-[3px] border ${
            scheduled
              ? 'text-accent border-accent/40 bg-accent/[0.14]'
              : 'text-live border-live/40 bg-live/[0.14]'
          }`}
        >
          {scheduled ? 'Agendado' : 'Ao vivo'}
        </span>
        <span className="font-bracket font-bold text-[10px] tracking-[0.1em] text-arena-dim uppercase whitespace-nowrap">
          {formatDayHeader(match.scheduledAt)} · {isTimeTBD(match) ? 'a definir' : matchTime(match)}
        </span>
      </div>

      {/* UMA grade pros dois andares: times e steppers alinham por coluna.
          Era esse o desalinhamento — antes cada andar tinha o próprio flex. */}
      <div className="grid grid-cols-[1fr_48px_1fr] items-center mt-4">
        <BolaoTeam team={match.teamA} />
        <span className="justify-self-center font-varsity text-[13px] text-brand-ink bg-gold px-2.5 py-[3px] [clip-path:polygon(7px_0,calc(100%-7px)_0,100%_50%,calc(100%-7px)_100%,7px_100%,0_50%)]">
          VS
        </span>
        <BolaoTeam team={match.teamB} />
      </div>

      {profile ? (
        <PalpiteWidget match={match} profile={profile} />
      ) : (
        <p className="text-center text-xs text-arena-muted bg-white/5 px-3 py-2.5 cut-corner-sm mt-4">
          Crie seu perfil no topo da página pra liberar os palpites
        </p>
      )}
    </div>
  )
}

function BolaoTeam({ team }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <TeamCrest team={team} size="lg" />
      <span className="font-bracket-display text-[17px] text-white tracking-[0.05em] whitespace-nowrap">
        {team?.name || '—'}
      </span>
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
