import { useState } from 'react'
import Card from '../common/Card'
import { useModalities } from '../../hooks/useModalities'
import { useClasses } from '../../hooks/useClasses'
import { usePodiums, usePenalties } from '../../hooks/useMedals'
import { useAwards } from '../../hooks/useAwards'
import { pontosDosExtras } from '../../utils/awards'
import { toggleMedal } from '../../services/medalsService'
import { buildMedalRanking, MEDALHAS, CATEGORIAS, podiumId, pontosDe } from '../../utils/medals'

// A TABELA DO RANKING, EDITÁVEL
//
// A comissão pensa por turma ("o 3ºC ganhou mais um ouro"), não por formulário
// de modalidade. Então a tela principal é a própria tabela do ranking, e mexer
// nela é tocar no número da medalha.
//
// O toque precisa perguntar QUAL modalidade porque um ouro não vale sempre o
// mesmo: esporte dá 350, e-sport e jogo de mesa dão 300 (edital §10). Guardar
// só "3 ouros" tornaria a conta impossível — e ninguém saberia depois de onde
// veio cada medalha quando alguém contestasse o resultado.
export default function MedalTableEditor() {
  const { classes } = useClasses()
  const { modalities } = useModalities()
  const { podiums } = usePodiums()
  const { penalties } = usePenalties()
  const { awards } = useAwards()
  const [abrindo, setAbrindo] = useState(null) // { classId, key }

  const rows = buildMedalRanking(podiums, penalties, classes, modalities, pontosDosExtras(awards))

  // De quais disputas veio cada medalha desta turma
  const origens = (classId, key) =>
    podiums
      .filter((p) => (Array.isArray(p[key]) ? p[key] : [p[key]]).includes(classId))
      .map((p) => ({
        ...p,
        modalityName: modalities.find((m) => m.id === p.modalityId)?.name || '—',
      }))

  return (
    <>
      <Card className="mb-3">
        <p className="text-sm font-semibold mb-1">Ranking geral</p>
        <p className="text-xs text-slate-400">
          Toque no número de uma medalha pra adicionar ou tirar. O sistema pergunta de qual
          modalidade — é isso que define quantos pontos ela vale.
        </p>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-1.5 px-1 pb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400 border-b border-slate-100">
          <span className="w-5" />
          <span className="flex-1">Turma</span>
          <span className="w-14 text-center">Pts</span>
          {MEDALHAS.map((m) => (
            <span key={m.key} className="w-11 flex justify-center">
              <span
                className="w-3.5 h-3.5 rounded-full border border-black/20"
                style={{ background: m.color }}
                title={m.label}
              />
            </span>
          ))}
        </div>

        {rows.map((r, i) => (
          <div key={r.id}>
            <div className="flex items-center gap-1.5 px-1 py-2 border-b border-slate-100">
              <span className="w-5 text-center text-xs font-bold text-slate-400">{i + 1}</span>
              <span className="flex-1 min-w-0 text-sm font-bold text-slate-700 truncate">
                {r.className}
              </span>
              <span className={`w-14 text-center text-sm font-bold ${r.points < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                {r.points}
                {r.penalty > 0 && (
                  <span className="block text-[10px] font-normal text-red-500">−{r.penalty}</span>
                )}
              </span>
              {MEDALHAS.map((m) => {
                const aberto = abrindo?.classId === r.id && abrindo?.key === m.key
                return (
                  <button
                    key={m.key}
                    onClick={() => setAbrindo(aberto ? null : { classId: r.id, key: m.key })}
                    className={`w-11 py-1.5 rounded-lg text-sm font-bold transition ${
                      aberto
                        ? 'bg-brand text-white'
                        : r[m.key] > 0
                          ? 'bg-slate-100 text-slate-800'
                          : 'text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {r[m.key]}
                  </button>
                )
              })}
            </div>

            {abrindo?.classId === r.id && (
              <Editor
                classId={r.id}
                className={r.className}
                medalKey={abrindo.key}
                modalities={modalities}
                podiums={podiums}
                origens={origens(r.id, abrindo.key)}
                onClose={() => setAbrindo(null)}
              />
            )}
          </div>
        ))}
      </Card>
    </>
  )
}

function Editor({ classId, className, medalKey, modalities, podiums, origens, onClose }) {
  const [categoria, setCategoria] = useState('unico')
  const [busca, setBusca] = useState('')
  const medalha = MEDALHAS.find((m) => m.key === medalKey)

  const aplicar = async (modalityId, cat) => {
    const id = podiumId(modalityId, cat)
    await toggleMedal({
      modalityId, categoria: cat, key: medalKey, classId,
      podium: podiums.find((p) => p.id === id),
    })
  }

  const filtradas = modalities.filter(
    (m) => !busca.trim() || m.name.toLowerCase().includes(busca.trim().toLowerCase())
  )

  return (
    <div className="bg-slate-50 border-b border-slate-200 px-3 py-3 animate-pop-in">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-slate-600">
          {medalha.label} de {className}
        </p>
        <button onClick={onClose} className="text-xs text-slate-400 underline">fechar</button>
      </div>

      {/* O que a turma já tem — tirar é o caso mais comum de correção */}
      {origens.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">
            Já tem ({origens.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {origens.map((o) => (
              <button
                key={o.id}
                onClick={() => aplicar(o.modalityId, o.categoria || 'unico')}
                className="px-2.5 py-1.5 rounded-full bg-brand text-white text-xs font-bold"
                title="Tocar pra tirar"
              >
                {o.modalityName}
                {o.categoria && o.categoria !== 'unico' ? ` (${o.categoria})` : ''} ✕
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">
        Adicionar de qual modalidade
      </p>

      <div className="flex gap-1.5 mb-2">
        {CATEGORIAS.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategoria(c.key)}
            className={`flex-1 rounded-lg py-1 text-[11px] font-bold transition ${
              categoria === c.key ? 'bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-500'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar modalidade…"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mb-2"
      />

      <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto">
        {filtradas.map((m) => {
          const id = podiumId(m.id, categoria)
          const pod = podiums.find((p) => p.id === id)
          const lista = Array.isArray(pod?.[medalKey]) ? pod[medalKey] : pod?.[medalKey] ? [pod[medalKey]] : []
          const marcada = lista.includes(classId)
          // Já tem dono e não é esta turma: dá pra empatar, mas quase sempre é engano
          const ocupada = lista.length > 0 && !marcada
          const vale = pontosDe(m.name)[medalKey]
          return (
            <button
              key={m.id}
              onClick={() => aplicar(m.id, categoria)}
              className={`px-2.5 py-1.5 rounded-full text-xs font-bold transition ${
                marcada
                  ? 'bg-brand text-white'
                  : ocupada
                    ? 'bg-amber-50 border border-amber-300 text-amber-700'
                    : 'bg-white border border-slate-200 text-slate-600'
              }`}
              title={ocupada ? 'Esta colocação já tem outra turma' : `Vale ${vale} pontos`}
            >
              {m.name} <span className="opacity-60">{vale}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
