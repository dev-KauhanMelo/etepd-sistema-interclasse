import { useEffect, useRef, useState } from 'react'
import { ZoomInIcon, ZoomOutIcon } from '../common/Icons'

const MIN = 0.45
const MAX = 2
const STEP = 0.25
const clamp = (v) => Math.min(MAX, Math.max(MIN, v))

// Palco com zoom e arrasto para o chaveamento.
//
// O canvas do mata-mata tem 1210px de largura: no celular só dava pra rolar
// de lado, e nunca se via a chave inteira. Aqui a pessoa pode afastar com
// dois dedos pra ter a visão geral, aproximar pra ler os nomes, e arrastar
// pra qualquer direção — com limites de 45% a 200% pra nunca se perder.
//
// Tudo em transform (composto pela GPU), então continua fluido mesmo com as
// dezenas de elementos posicionados do canvas.
export default function ZoomPane({ width, height, children, initial = 0.62 }) {
  const box = useRef(null)
  const [scale, setScale] = useState(initial)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  // gestos: 1 dedo arrasta, 2 dedos dão pinch
  const gesture = useRef(null)

  useEffect(() => {
    const el = box.current
    if (!el) return

    const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)
    const mid = (t) => ({ x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 })

    const onStart = (e) => {
      const t = e.touches
      if (t.length === 2) {
        gesture.current = { kind: 'pinch', d0: dist(t), s0: scale, m0: mid(t), p0: { ...pos } }
      } else if (t.length === 1) {
        gesture.current = { kind: 'pan', x0: t[0].clientX, y0: t[0].clientY, p0: { ...pos } }
      }
    }

    const onMove = (e) => {
      const g = gesture.current
      if (!g) return
      const t = e.touches
      if (g.kind === 'pinch' && t.length === 2) {
        e.preventDefault()
        const next = clamp(g.s0 * (dist(t) / g.d0))
        const m = mid(t)
        // Âncora: o ponto do conteúdo que estava entre os dedos continua
        // entre os dedos. Em coordenadas do conteúdo esse ponto é
        // (m0 - p0) / s0, e para mantê-lo sob o dedo basta p = m - ponto * s.
        const cx = (g.m0.x - g.p0.x) / g.s0
        const cy = (g.m0.y - g.p0.y) / g.s0
        setScale(next)
        setPos({ x: m.x - cx * next, y: m.y - cy * next })
      } else if (g.kind === 'pan' && t.length === 1) {
        e.preventDefault()
        setPos({ x: g.p0.x + (t[0].clientX - g.x0), y: g.p0.y + (t[0].clientY - g.y0) })
      }
    }

    const onEnd = () => { gesture.current = null }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd)
    el.addEventListener('touchcancel', onEnd)
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onEnd)
    }
  }, [scale, pos])

  const zoom = (delta) => setScale((s) => clamp(s + delta))
  const reset = () => { setScale(initial); setPos({ x: 0, y: 0 }) }

  return (
    <div className="relative">
      <div
        ref={box}
        className="overflow-hidden touch-none select-none"
        style={{ height: height * initial + 24 }}
      >
        <div
          style={{
            width, height,
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: gesture.current ? 'none' : 'transform 180ms cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {children}
        </div>
      </div>

      {/* Controles: quem não usa gesto (ou está no desktop) tem os botões */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
        <button
          onClick={() => zoom(-STEP)}
          disabled={scale <= MIN}
          aria-label="Diminuir zoom"
          className="w-9 h-9 cut-corner-sm bg-arena-panel/90 border border-white/15 text-white flex items-center justify-center disabled:opacity-35 active:scale-90 transition"
        >
          <ZoomOutIcon className="w-[18px] h-[18px]" />
        </button>
        <button
          onClick={reset}
          aria-label="Enquadrar chaveamento"
          className="h-9 px-2.5 cut-corner-sm bg-arena-panel/90 border border-white/15 font-bracket font-bold text-[11px] text-arena-muted tracking-wide active:scale-90 transition"
        >
          {Math.round(scale * 100)}%
        </button>
        <button
          onClick={() => zoom(STEP)}
          disabled={scale >= MAX}
          aria-label="Aumentar zoom"
          className="w-9 h-9 cut-corner-sm bg-arena-panel/90 border border-white/15 text-white flex items-center justify-center disabled:opacity-35 active:scale-90 transition"
        >
          <ZoomInIcon className="w-[18px] h-[18px]" />
        </button>
      </div>
    </div>
  )
}
