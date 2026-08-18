import { useEffect, useState } from 'react'
import Card from '../common/Card'
import { useClasses } from '../../hooks/useClasses'
import { usePodiums } from '../../hooks/useMedals'
import { savePodium } from '../../services/medalsService'
import { MEDALHAS, pontosDe, podiumId } from '../../utils/medals'

// FECHAR O PÓDIO NA PRÓPRIA FINAL
//
// Terminada a final, a modalidade acabou — e quem estava ali sabe exatamente
// quem ficou em 1º, 2º e 3º. Fazer essa pessoa guardar o resultado e alguém
// depois abrir outra tela pra digitar é onde a informação se perde.
//
// 1º e 2º saem do próprio jogo. O 3º precisa de escolha: nesta chave não há
// disputa de terceiro lugar, então quem perdeu as semifinais empata na posição
// — por isso o campo aceita mais de uma turma, e vem sugerido com elas.
export default function ClosePodium({ match, modalityId, modalityName, sugestao3 = [] }) {
  const { classes } = useClasses()
  const { podiums } = usePodiums()
  const [bronze, setBronze] = useState(sugestao3)
  const [salvo, setSalvo] = useState(false)
  const [erro, setErro] = useState('')

  const jaTem = podiums.find((p) => p.id === podiumId(modalityId, 'unico'))

  // A sugestão chega junto com o chaveamento, que carrega depois da tela
  useEffect(() => {
    if (sugestao3.length && bronze.length === 0) setBronze(sugestao3)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sugestao3.join(',')])

  if (!match.winnerSide) return null

  const campeao = match.winnerSide === 'A' ? match.teamA : match.teamB
  const vice = match.winnerSide === 'A' ? match.teamB : match.teamA
  const valores = pontosDe(modalityName)

  const salvar = async () => {
    if (!campeao?.classId || !vice?.classId) return setErro('Faltam as turmas do jogo.')
    setErro('')
    try {
      await savePodium(modalityId, 'unico', {
        gold: [campeao.classId], silver: [vice.classId], bronze,
      })
      setSalvo(true)
    } catch (e) {
      console.error(e)
      setErro('Não deu pra salvar. Confere a internet e tenta de novo.')
    }
  }

  const nomeDe = (id) => classes.find((c) => c.id === id)?.name || id

  if (salvo) {
    return (
      <Card className="mb-4 border-2 border-amber-400 bg-amber-50">
        <p className="text-sm font-bold text-amber-900">
          Pódio de {modalityName} fechado — medalhas já contam no ranking geral.
        </p>
        <p className="text-xs text-slate-500 mt-1">
          🥇 {campeao?.name} · 🥈 {vice?.name}
          {bronze.length ? ` · 🥉 ${bronze.map(nomeDe).join(', ')}` : ''}
        </p>
        <button onClick={() => setSalvo(false)} className="text-xs text-slate-500 underline mt-2">
          Corrigir
        </button>
      </Card>
    )
  }

  return (
    <Card className="mb-4 border-2 border-amber-400 bg-amber-50/60">
      <p className="text-base font-bold text-amber-900 mb-1">Fechar o pódio de {modalityName}</p>
      <p className="text-xs text-slate-500 mb-4">
        Esta era a final. Confirme as colocações e as medalhas entram no ranking geral na hora.
      </p>

      <Linha medal={MEDALHAS[0]} valor={valores.gold} texto={campeao?.name} />
      <Linha medal={MEDALHAS[1]} valor={valores.silver} texto={vice?.name} />

      <div className="mt-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1">
          <span className="w-4 h-4 rounded-full border border-black/20" style={{ background: MEDALHAS[2].color }} />
          Bronze · {valores.bronze} pts
        </p>
        <p className="text-[11px] text-slate-400 mb-2">
          Quem perdeu as semifinais. Pode marcar as duas se não houve disputa de 3º lugar.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {classes.map((c) => {
            const on = bronze.includes(c.id)
            const impedido = c.id === campeao?.classId || c.id === vice?.classId
            return (
              <button
                key={c.id}
                disabled={impedido}
                onClick={() => setBronze(on ? bronze.filter((x) => x !== c.id) : [...bronze, c.id])}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition disabled:opacity-30 ${
                  on ? 'bg-amber-700 text-white' : 'bg-white border border-slate-200 text-slate-600'
                }`}
              >
                {c.name}
              </button>
            )
          })}
        </div>
      </div>

      {jaTem && (
        <p className="text-xs text-amber-800 mt-3">
          Esta modalidade já tem pódio lançado — salvar substitui o anterior.
        </p>
      )}
      {erro && <p className="text-xs text-red-600 mt-2">{erro}</p>}

      <button
        onClick={salvar}
        className="w-full mt-4 rounded-xl bg-amber-600 text-white py-3.5 font-bold active:scale-[0.98] transition"
      >
        SALVAR PÓDIO E CONTABILIZAR MEDALHAS
      </button>
    </Card>
  )
}

function Linha({ medal, valor, texto }) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="w-4 h-4 rounded-full border border-black/20 shrink-0" style={{ background: medal.color }} />
      <span className="text-sm font-semibold text-slate-700 w-20">{medal.label}</span>
      <span className="flex-1 text-sm font-bold text-slate-900">{texto || '—'}</span>
      <span className="text-xs text-slate-400">{valor} pts</span>
    </div>
  )
}
