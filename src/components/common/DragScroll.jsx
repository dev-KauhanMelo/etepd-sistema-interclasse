import { useRef } from 'react'

// Fileira que rola de lado. No celular o dedo já arrasta; no computador,
// sem barra de rolagem visível, não havia como mover — agora dá pra clicar
// e arrastar com o mouse (e a roda do mouse rola na horizontal).
export default function DragScroll({ children, className = '' }) {
  const ref = useRef(null)
  const drag = useRef(null)

  const onPointerDown = (e) => {
    // só botão principal do mouse; toque continua no comportamento nativo
    if (e.pointerType === 'touch' || e.button !== 0) return
    const el = ref.current
    drag.current = { x: e.clientX, left: el.scrollLeft, moved: false }
    el.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 3) d.moved = true
    ref.current.scrollLeft = d.left - dx
  }

  const onPointerUp = (e) => {
    const d = drag.current
    drag.current = null
    try { ref.current.releasePointerCapture(e.pointerId) } catch {}
    // se arrastou, engole o clique pra não disparar o chip por acidente
    if (d?.moved) {
      const swallow = (ev) => { ev.stopPropagation(); ev.preventDefault() }
      ref.current.addEventListener('click', swallow, { capture: true, once: true })
      setTimeout(() => ref.current?.removeEventListener('click', swallow, { capture: true }), 0)
    }
  }

  // roda do mouse vertical vira rolagem horizontal
  const onWheel = (e) => {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
    ref.current.scrollLeft += e.deltaY
  }

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      className={`overflow-x-auto scrollbar-none cursor-grab active:cursor-grabbing ${className}`}
    >
      {children}
    </div>
  )
}
