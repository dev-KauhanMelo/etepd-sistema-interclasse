import { useState } from 'react'
import Header from '../../components/layout/Header'
import LiveScoreCard from '../../components/match/LiveScoreCard'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import SearchBar from '../../components/common/SearchBar'
import { BarsIcon } from '../../components/common/Icons'
import { useMatches } from '../../hooks/useMatches'
import { useModalities } from '../../hooks/useModalities'
import { isToday } from '../../utils/formatDate'
import { filterMatches } from '../../utils/matchFilters'

export default function LiveScores() {
  const { matches, loading } = useMatches()
  const { modalities } = useModalities()
  const [query, setQuery] = useState('')
  const [modalityFilter, setModalityFilter] = useState('all')

  if (loading) return <Loader />

  const visible = filterMatches(matches, { query, modalityId: modalityFilter, modalities })

  const live = visible.filter((m) => m.status === 'live')
  const todayScheduled = visible
    .filter((m) => m.status === 'scheduled' && isToday(m.scheduledAt))
    .sort((a, b) => (a.scheduledAt?.seconds || 0) - (b.scheduledAt?.seconds || 0))
  const todayFinished = visible.filter((m) => m.status === 'finished' && isToday(m.scheduledAt))

  const nothingToday = live.length + todayScheduled.length + todayFinished.length === 0
  const isFiltering = query || modalityFilter !== 'all'

  return (
    <div>
      <Header title="Placar ao vivo" subtitle="Tudo que está acontecendo hoje" />

      <div className="px-4 pt-1">
        <SearchBar value={query} onChange={setQuery} placeholder="Buscar turma, local ou modalidade…" />
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
        <Chip active={modalityFilter === 'all'} onClick={() => setModalityFilter('all')}>Todas</Chip>
        {modalities.map((m) => (
          <Chip key={m.id} active={modalityFilter === m.id} onClick={() => setModalityFilter(m.id)}>
            {m.name}
          </Chip>
        ))}
      </div>

      <div className="p-4 pt-0">
        {nothingToday && (
          <EmptyState
            icon={<BarsIcon className="w-10 h-10" />}
            title={isFiltering ? 'Nenhum jogo encontrado' : 'Nenhum jogo hoje'}
            subtitle={isFiltering ? 'Tente outra busca ou modalidade' : 'Confira a tabela completa no Cronograma'}
          />
        )}

        {live.length > 0 && (
          <>
            <GroupTitle live>Rolando agora</GroupTitle>
            {live.map((m) => <LiveScoreCard key={m.id} match={m} />)}
          </>
        )}

        {todayScheduled.length > 0 && (
          <>
            <GroupTitle>Ainda hoje</GroupTitle>
            {todayScheduled.map((m) => <LiveScoreCard key={m.id} match={m} />)}
          </>
        )}

        {todayFinished.length > 0 && (
          <>
            <GroupTitle>Já encerrados</GroupTitle>
            {todayFinished.map((m) => <LiveScoreCard key={m.id} match={m} />)}
          </>
        )}
      </div>
    </div>
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
