import { useState } from 'react'
import Card from '../common/Card'
import { useClasses } from '../../hooks/useClasses'
import { useAwards } from '../../hooks/useAwards'
import { saveAward } from '../../services/medalsService'
import { EXTRAS } from '../../utils/awards'

// PERFORMANCE, TORCIDA E CAMISAS (edital §9)
//
// Não vêm de jogo nenhum: jurados externos avaliam e a comissão recebe a
// classificação pronta, do 1º ao 9º. E pesam mais que medalha — o 1º lugar da
// Performance vale 900 pontos, mais que dois ouros de esporte.
//
// A tela monta a fila por toque: toca na turma, ela entra na próxima posição
// livre. É mais rápido que nove seletores e não deixa repetir turma.
export default function AwardsEditor() {
  const [aba, setAba] = useState(EXTRAS[0].key)
  const def = EXTRAS.find((e) => e.key === aba)

  return (
    <>
      <div className="flex gap-2 mb-3">
        {EXTRAS.map((e) => (
          <button
            key={e.key}
            onClick={() => setAba(e.key)}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
              aba === e.key ? 'bg-brand text-white' : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>
      <Fila key={def.key} def={def} />
    </>
  )
}

function Fila({ def }) {
  const { classes } = useClasses()
  const { awards } = useAwards()
  const salvo = awards.find((a) => a.id === def.key)
  const [ordem, setOrdem] = useState(null)
  const [aviso, setAviso] = useState('')

  // Times combinados não entram: Performance, Torcida e Camisas são da turma.
  const turmas = classes.filter((c) => !c.isTeam)
  const fila = ordem ?? (Array.isArray(salvo?.places) ? salvo.places : [])

  const toca = (id) =>
    setOrdem(fila.includes(id) ? fila.filter((x) => x !== id) : [...fila, id])

  const salvar = async () => {
    await saveAward(def.key, fila)
    setOrdem(null)
    setAviso('Salvo — já está somado no ranking geral.')
    setTimeout(() => setAviso(''), 3000)
  }

  const nomeDe = (id) => turmas.find((c) => c.id === id)?.name || id
  const faltam = turmas.filter((c) => !fila.includes(c.id))

  return (
    <>
      <Card className="mb-3">
        <p className="text-sm font-semibold mb-1">{def.label}</p>
        <p className="text-xs text-slate-400 mb-3">{def.hint}</p>
        <p className="text-[11px] text-slate-400">
          Pontos por colocação: {def.pontos.join(' · ')}
        </p>
      </Card>

      <Card className="mb-3">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
          Toque na ordem da classificação
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {faltam.length === 0 ? (
            <p className="text-xs text-slate-400">Todas as turmas já foram colocadas.</p>
          ) : faltam.map((c) => (
            <button
              key={c.id}
              onClick={() => toca(c.id)}
              className="px-3.5 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-bold"
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          {def.pontos.map((pts, i) => {
            const id = fila[i]
            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-2 py-2 rounded-lg ${
                  id ? 'bg-brand/[0.07]' : 'bg-slate-50'
                }`}
              >
                <span className="w-7 text-center text-sm font-bold text-slate-500">{i + 1}º</span>
                <span className="flex-1 text-sm font-bold text-slate-700">
                  {id ? nomeDe(id) : <span className="text-slate-300 font-normal">—</span>}
                </span>
                <span className="text-xs text-slate-400">{pts} pts</span>
                {id && (
                  <button onClick={() => toca(id)} className="text-xs text-slate-400 underline">
                    tirar
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={salvar}
            disabled={fila.length === 0}
            className="rounded-xl bg-brand text-white px-5 py-2.5 text-sm font-bold disabled:opacity-40"
          >
            Salvar classificação
          </button>
          {fila.length > 0 && (
            <button onClick={() => setOrdem([])} className="text-xs text-slate-500 underline">
              Limpar
            </button>
          )}
          {aviso && <span className="text-xs text-emerald-700">{aviso}</span>}
        </div>
      </Card>
    </>
  )
}
