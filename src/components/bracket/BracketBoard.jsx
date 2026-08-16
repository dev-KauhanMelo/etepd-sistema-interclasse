import BracketCanvas from './BracketCanvas'
import ZoomPane from './ZoomPane'
import { BRACKET_CANVAS } from '../../utils/bracket'

// Palco escuro do chaveamento: banner do título, dica de arrastar, o canvas
// rolando na horizontal e a legenda. É o único bloco do site em tema escuro —
// decisão de design: o mata-mata é "momento de torneio".
export default function BracketBoard({ title, subtitle, games, classes, onSlotClick, selectedGameId, footer }) {
  return (
    <div className="bracket-stage relative overflow-hidden rounded-2xl border border-[#F5EA15]/25">
      <div className="px-4 pt-5 pb-1 flex justify-center">
        <div
          className="px-8 py-2.5 text-center"
          style={{
            background: 'linear-gradient(90deg,#10306E,#0552CB)',
            borderTop: '3px solid #F5EA15',
            borderBottom: '3px solid #F5EA15',
            clipPath: 'polygon(3% 0,97% 0,100% 50%,97% 100%,3% 100%,0 50%)',
          }}
        >
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, color: '#fff', letterSpacing: '0.03em', lineHeight: 1 }}>
            CHAVEAMENTO
          </div>
          <div
            style={{
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 11,
              color: '#F5EA15', letterSpacing: '0.15em', marginTop: 2, textTransform: 'uppercase',
            }}
          >
            {subtitle || `${title || 'Modalidade'} · Mata-mata`}
          </div>
        </div>
      </div>

      <p className="text-center px-4 mt-3 mb-1 font-body font-medium text-xs text-arena-muted">
        Use dois dedos para dar zoom · arraste para navegar
      </p>

      {/* O canvas tem 1210px: rolar de lado nunca mostrava a chave inteira.
          Com zoom, dá pra afastar e ver tudo, ou aproximar e ler os nomes. */}
      <div className="px-2 pt-1 pb-2">
        <ZoomPane width={BRACKET_CANVAS.width} height={BRACKET_CANVAS.height}>
          <BracketCanvas games={games} classes={classes} onSlotClick={onSlotClick} selectedGameId={selectedGameId} />
        </ZoomPane>
      </div>

      <div
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-4 pb-4"
        style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, letterSpacing: '0.12em', color: 'rgba(239,245,249,0.5)' }}
      >
        <Legend label="VAGA DEFINIDA" style={{ background: 'linear-gradient(135deg,#10306E,#182750)', border: '1px solid rgba(245,234,21,0.25)' }} />
        <Legend label="A DEFINIR" style={{ background: 'rgba(163,180,206,0.10)', border: '1px dashed rgba(245,234,21,0.35)' }} />
        <Legend label="FINAL" style={{ background: 'linear-gradient(135deg,#F5EA15,#e2d400)' }} />
        <Legend label="JÁ DECIDIDO" style={{ background: 'rgba(163,180,206,0.45)' }} />
      </div>

      {footer}
    </div>
  )
}

function Legend({ label, style }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span style={{ width: 22, height: 10, clipPath: 'polygon(0 0,80% 0,100% 50%,80% 100%,0 100%)', ...style }} />
      {label}
    </span>
  )
}
