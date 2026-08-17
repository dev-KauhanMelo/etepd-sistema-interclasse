import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cotaEstourada, onCotaEstourada } from '../../services/liveStore'

// Quando o banco recusa leituras (cota do dia esgotada), placar e classificação
// param, mas o cronograma continua — ele vem do código, não do banco.
// Sem este aviso a pessoa só via telas vazias e concluía que o site quebrou.
export default function OfflineBanner() {
  const [sem, setSem] = useState(cotaEstourada())

  useEffect(() => onCotaEstourada(setSem), [])

  if (!sem) return null

  return (
    <div className="mx-4 mt-3 cut-corner border border-gold/40 bg-gold/[0.10] px-4 py-3">
      <p className="font-bracket-display text-sm text-gold tracking-wide uppercase">
        Placar ao vivo fora do ar
      </p>
      <p className="font-bracket font-semibold text-[13px] text-arena-muted mt-1 leading-snug">
        O sistema bateu o limite de acessos de hoje e volta sozinho de madrugada.
        Os jogos continuam normalmente — os resultados entram assim que voltar.
      </p>
      <Link
        to="/horarios"
        className="inline-block font-bracket font-bold text-[11px] text-gold mt-2.5 tracking-[0.14em] uppercase underline"
      >
        Ver a programação do dia →
      </Link>
    </div>
  )
}
