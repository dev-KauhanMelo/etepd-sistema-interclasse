import { useState } from 'react'
import Header from '../../components/layout/Header'
import Card from '../../components/common/Card'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import TeamCrest from '../../components/match/TeamCrest'
import MatchStatusBadge from '../../components/match/MatchStatusBadge'
import ProfileSetup from '../../components/bolao/ProfileSetup'
import PalpiteWidget from '../../components/bolao/PalpiteWidget'
import { NodesIcon, TrophyIcon } from '../../components/common/Icons'
import { useMatches } from '../../hooks/useMatches'
import { useAllPredictions } from '../../hooks/usePredictions'
import { getFanProfile } from '../../utils/fanProfile'
import { buildBolaoRanking } from '../../utils/bolao'
import { formatTime, formatDayHeader } from '../../utils/formatDate'

export default function Bolao() {
  const [profile, setProfile] = useState(getFanProfile())
  const [tab, setTab] = useState('palpites')
  const { matches, loading } = useMatches()
  const { predictions } = useAllPredictions()

  if (loading) return <Loader />

  const open = matches
    .filter((m) => m.status === 'scheduled')
    .sort((a, b) => (a.scheduledAt?.seconds || 0) - (b.scheduledAt?.seconds || 0))
  const inPlay = matches.filter((m) => m.status === 'live')
  const ranking = buildBolaoRanking(predictions, matches)

  return (
    <div>
      <Header title="Bolão JIPD" subtitle="Crave o placar, mostre que entende de bola e domine o ranking" />

      <div className="p-4 pt-2">
        <div className="flex gap-2 mb-4 bg-white rounded-2xl p-1 border border-brand-mist/30 shadow-card">
          <TabButton active={tab === 'palpites'} onClick={() => setTab('palpites')}>🎯 Palpites</TabButton>
          <TabButton active={tab === 'ranking'} onClick={() => setTab('ranking')}>🏆 Cravadores</TabButton>
        </div>

        {tab === 'palpites' ? (
          <>
            {!profile ? (
              <ProfileSetup onDone={setProfile} />
            ) : (
              <p className="text-sm text-brand-steel mb-3">
                Fala, <span className="font-bold text-brand-deep">{profile.name}</span>
                {profile.className ? ` (${profile.className})` : ''}! Bora cravar? 🔥
              </p>
            )}

            {inPlay.length > 0 && (
              <>
                <GroupTitle live>A torcida está dizendo...</GroupTitle>
                {inPlay.map((m) => <BolaoMatchCard key={m.id} match={m} profile={profile} />)}
              </>
            )}

            <GroupTitle>Jogos abertos pra palpite</GroupTitle>
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
    <Card className="mb-3 animate-pop-in">
      <div className="flex items-center justify-between mb-3">
        <MatchStatusBadge status={match.status} />
        <span className="text-xs font-medium text-brand-steel">
          {formatDayHeader(match.scheduledAt)} · {formatTime(match.scheduledAt)}
        </span>
      </div>
      <div className="flex items-center justify-center gap-3 mb-3">
        <span className="flex items-center gap-2 flex-1 justify-end min-w-0">
          <span className="text-xs font-bold text-brand-deep truncate">{match.teamA?.name}</span>
          <TeamCrest team={match.teamA} size="sm" />
        </span>
        <span className="text-brand-mist font-bold text-xs">VS</span>
        <span className="flex items-center gap-2 flex-1 min-w-0">
          <TeamCrest team={match.teamB} size="sm" />
          <span className="text-xs font-bold text-brand-deep truncate">{match.teamB?.name}</span>
        </span>
      </div>
      {profile ? (
        <PalpiteWidget match={match} profile={profile} />
      ) : (
        <p className="text-center text-xs text-brand-steel bg-brand-paper/70 rounded-xl px-3 py-2.5">
          Crie seu perfil aí em cima pra liberar os palpites 👆
        </p>
      )}
    </Card>
  )
}

const medals = ['🥇', '🥈', '🥉']

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
      <Card className="p-0 overflow-hidden animate-pop-in">
        {scored.map((r, i) => {
          const isMe = profile && r.userId === profile.id
          return (
            <div
              key={r.userId}
              className={`flex items-center gap-3 px-4 py-3 border-b border-brand-paper last:border-0 ${isMe ? 'bg-brand/5' : ''}`}
            >
              <span className="w-8 text-center shrink-0">
                {i < 3 ? <span className="text-lg">{medals[i]}</span> : <span className="score-number text-brand-mist">{i + 1}</span>}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-brand-deep truncate">
                  {r.name} {isMe && <span className="text-brand text-[10px] font-black uppercase ml-1">você</span>}
                </p>
                <p className="text-[11px] text-brand-steel">
                  {r.className || 'Sem turma'} · {r.exact} placar{r.exact === 1 ? '' : 'es'} cravado{r.exact === 1 ? '' : 's'}
                </p>
              </div>
              <span className="score-number text-xl text-brand shrink-0">{r.points} <span className="text-xs text-brand-steel not-italic font-bold">pts</span></span>
            </div>
          )
        })}
      </Card>
      <p className="text-[11px] text-brand-steel text-center mt-3">
        Placar exato = 5 pts · Vencedor certo = 2 pts · Desempate por placares cravados
      </p>
    </>
  )
}

function GroupTitle({ children, live = false }) {
  return (
    <h2 className="headline text-base text-brand-navy mt-4 mb-3 flex items-center gap-2">
      {live && <span className="w-2.5 h-2.5 bg-live rounded-full pulse-live not-italic" />}
      {children}
    </h2>
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
