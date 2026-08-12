import TrophyArt from './TrophyArt'
import {
  BRACKET_CANVAS,
  BRACKET_GAMES,
  BRACKET_LINKS,
  FINAL_LAYOUT,
  MATCH_BOX,
  championOf,
  resolveSlot,
  slotIsSeeded,
  slotPlaceholder,
} from '../../utils/bracket'

// Desenho do mata-mata: caixas de jogo posicionadas em pixel absoluto e
// ligadas por linhas douradas em ângulo reto. Mesmo componente serve o público
// (só leitura) e a prévia do admin (com onSlotClick, pra escolher o que editar).

const GOLD = '#F5EA15'
const CHEVRON = 'polygon(0 0,88% 0,100% 50%,88% 100%,0 100%)'
const HEX = 'polygon(10% 0,90% 0,100% 50%,90% 100%,10% 100%,0 50%)'
const CUT_CORNERS =
  'polygon(14px 0,calc(100% - 14px) 0,100% 14px,100% calc(100% - 14px),calc(100% - 14px) 100%,14px 100%,0 calc(100% - 14px),0 14px)'
const FINAL_ROW = 'polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)'

export default function BracketCanvas({ games, classes = [], onSlotClick, selectedGameId }) {
  const champion = resolveSlot(championOf(games), classes)
  const finalGame = games.final

  return (
    <div
      className="relative shrink-0"
      style={{ width: BRACKET_CANVAS.width, height: BRACKET_CANVAS.height, fontFamily: "'Rajdhani', sans-serif" }}
    >
      {/* Linhas: acendem quando o jogo de origem já tem vencedor */}
      {BRACKET_LINKS.map((link) => {
        const live = games[link.from]?.winner !== null
        const color = live ? GOLD : 'rgba(245,234,21,0.35)'
        return (
          <div key={link.from}>
            <div
              style={{
                position: 'absolute', left: link.node[0], top: link.node[1],
                width: 6, height: 6, borderRadius: '50%', background: color,
              }}
            />
            {link.segs.map(([left, top, width, height], i) => (
              <div key={i} style={{ position: 'absolute', left, top, width, height, background: color }} />
            ))}
          </div>
        )
      })}

      {/* Jogos 1 a 7 */}
      {BRACKET_GAMES.filter((g) => !g.isFinal).map((spec) => {
        const game = games[spec.id]
        const decided = game.winner !== null
        const selected = selectedGameId === spec.id
        return (
          <div key={spec.id}>
            <div style={{ position: 'absolute', left: spec.x, top: spec.labelY }}>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  height: 20, padding: '0 14px', whiteSpace: 'nowrap',
                  background: decided ? 'rgba(163,180,206,0.45)' : GOLD,
                  color: decided ? '#0E141D' : '#10306E',
                  fontWeight: 800, fontSize: 11, letterSpacing: '0.06em',
                  clipPath: HEX,
                }}
              >
                {game.label}
              </span>
            </div>

            {selected && (
              <div
                style={{
                  position: 'absolute', left: spec.x - 5, top: spec.y - 5,
                  width: MATCH_BOX.width + 10, height: 69,
                  border: `2px dashed ${GOLD}`, borderRadius: 6, pointerEvents: 'none',
                }}
              />
            )}

            <div
              style={{
                position: 'absolute', left: spec.x, top: spec.y,
                width: MATCH_BOX.width, display: 'flex', flexDirection: 'column', gap: MATCH_BOX.gap,
              }}
            >
              {[0, 1].map((i) => (
                <Slot
                  key={i}
                  gameId={spec.id}
                  index={i}
                  games={games}
                  classes={classes}
                  onSlotClick={onSlotClick}
                />
              ))}
            </div>
          </div>
        )
      })}

      {/* ===== Módulo da Final ===== */}
      <TrophyArt
        width={FINAL_LAYOUT.trophy.width}
        height={FINAL_LAYOUT.trophy.height}
        style={{
          position: 'absolute', left: FINAL_LAYOUT.trophy.left, top: FINAL_LAYOUT.trophy.top,
          filter: 'drop-shadow(0 8px 20px rgba(245,234,21,0.25))',
        }}
      />

      <div
        style={{
          position: 'absolute', left: FINAL_LAYOUT.title.left, top: FINAL_LAYOUT.title.top,
          width: FINAL_LAYOUT.title.width, textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: "'Anton', sans-serif", fontSize: 30, lineHeight: 1, color: '#fff',
            letterSpacing: '0.06em', textShadow: '0 0 4px rgba(245,234,21,0.9), 0 0 22px rgba(245,234,21,0.5)',
          }}
        >
          {finalGame.label}
        </div>
        <div
          style={{
            fontWeight: 700, fontSize: 10, letterSpacing: '0.22em',
            color: 'rgba(245,234,21,0.75)', marginTop: 4,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}
        >
          {champion ? `CAMPEÃ: ${champion.name.toUpperCase()}` : 'DECISÃO DO TÍTULO'}
        </div>
      </div>

      {selectedGameId === 'final' && (
        <div
          style={{
            position: 'absolute', left: FINAL_LAYOUT.box.left - 6, top: FINAL_LAYOUT.box.top - 6,
            width: FINAL_LAYOUT.box.width + 12, height: FINAL_LAYOUT.box.height + 12,
            border: `2px dashed ${GOLD}`, borderRadius: 8, pointerEvents: 'none',
          }}
        />
      )}

      <div style={{ position: 'absolute', ...FINAL_LAYOUT.box }}>
        <div
          style={{
            width: '100%', height: '100%', boxSizing: 'border-box', padding: 2,
            background: 'linear-gradient(180deg,#F5EA15,#b9a600)',
            filter: 'drop-shadow(0 0 20px rgba(245,234,21,0.4))',
            clipPath: CUT_CORNERS,
          }}
        >
          <div
            style={{
              width: '100%', height: '100%', boxSizing: 'border-box', padding: '10px 12px',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              background: 'linear-gradient(160deg,#16295a,#0E141D)',
              clipPath: CUT_CORNERS,
            }}
          >
            {[0, 1].map((i) => (
              <FinalRow key={i} index={i} games={games} classes={classes} onSlotClick={onSlotClick} />
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute', ...FINAL_LAYOUT.vs,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: GOLD, color: '#10306E', fontFamily: "'Anton', sans-serif", fontSize: 11,
          clipPath: HEX, pointerEvents: 'none',
        }}
      >
        VS
      </div>
    </div>
  )
}

// Uma vaga da caixa de jogo: turma escolhida (escudo + nome), rótulo de vaga
// ("3º B") ou o tracejado de "a definir" ("VENCEDOR JOGO 1").
function Slot({ gameId, index, games, classes, onSlotClick }) {
  const game = games[gameId]
  const team = resolveSlot(game.slots[index], classes)
  const decided = game.winner !== null
  const isWinner = game.winner === index
  const isLoser = decided && !isWinner
  const filled = !!team || slotIsSeeded(gameId, index, games)
  const clickable = !!onSlotClick

  const base = {
    height: MATCH_BOX.slotHeight, width: '100%', boxSizing: 'border-box',
    display: 'flex', alignItems: 'center', gap: 6,
    padding: team ? '0 20px 0 4px' : '0 22px 0 16px',
    textTransform: 'uppercase', textAlign: 'left', clipPath: CHEVRON,
    opacity: isLoser ? 0.5 : 1,
    filter: isLoser ? 'grayscale(1)' : 'none',
    cursor: clickable ? 'pointer' : 'default',
  }

  const skin = filled
    ? {
        background: isWinner ? 'linear-gradient(135deg,#1B47A8,#10306E)' : 'linear-gradient(135deg,#10306E,#182750)',
        border: `1px solid ${isWinner ? GOLD : 'rgba(245,234,21,0.25)'}`,
        color: isWinner ? GOLD : '#fff',
        fontWeight: 700, fontSize: 13, letterSpacing: '0.03em',
      }
    : {
        background: 'rgba(163,180,206,0.10)',
        border: '1px dashed rgba(245,234,21,0.35)',
        color: 'rgba(239,245,249,0.55)',
        fontWeight: 600, fontSize: 12, fontStyle: 'italic', letterSpacing: '0.02em',
      }

  const Tag = clickable ? 'button' : 'div'

  return (
    <Tag
      type={clickable ? 'button' : undefined}
      onClick={clickable ? () => onSlotClick(gameId, index) : undefined}
      style={{ ...base, ...skin }}
    >
      {team && <Crest team={team} size={20} />}
      <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {team ? team.name : slotPlaceholder(gameId, index, games)}
      </span>
    </Tag>
  )
}

// Linhas douradas da Final — mesmas regras do Slot, com o destaque da decisão.
function FinalRow({ index, games, classes, onSlotClick }) {
  const game = games.final
  const team = resolveSlot(game.slots[index], classes)
  const decided = game.winner !== null
  const isWinner = game.winner === index
  const isLoser = decided && !isWinner
  const clickable = !!onSlotClick
  const Tag = clickable ? 'button' : 'div'

  return (
    <Tag
      type={clickable ? 'button' : undefined}
      onClick={clickable ? () => onSlotClick('final', index) : undefined}
      style={{
        height: 40, width: '100%', boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '0 10px', textAlign: 'center',
        fontWeight: 800, fontSize: team ? 13 : 15, letterSpacing: '0.04em', textTransform: 'uppercase',
        color: '#10306E',
        background: isLoser ? 'rgba(163,180,206,0.5)' : 'linear-gradient(135deg,#F5EA15,#e2d400)',
        filter: isWinner ? 'drop-shadow(0 0 6px rgba(245,234,21,0.9))' : 'none',
        opacity: isLoser ? 0.6 : 1,
        clipPath: FINAL_ROW,
        cursor: clickable ? 'pointer' : 'default',
      }}
    >
      {team && <Crest team={team} size={24} ring="#10306E" />}
      <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {team ? team.name : slotPlaceholder('final', index, games)}
      </span>
    </Tag>
  )
}

// Escudo da turma em miniatura. Mesma regra do TeamCrest do resto do site
// (logo cadastrada, senão círculo colorido com a sigla), só que dimensionado
// em px porque aqui tudo é geometria fixa.
function Crest({ team, size = 20, ring = 'rgba(255,255,255,0.6)' }) {
  const box = {
    width: size, height: size, flexShrink: 0, borderRadius: '50%',
    objectFit: 'cover', background: team.color || '#5A6C8C',
    boxShadow: `0 0 0 1.5px ${ring}`,
  }
  if (team.logoUrl) return <img src={team.logoUrl} alt="" loading="lazy" style={{ ...box, background: '#fff' }} />
  return (
    <span
      style={{
        ...box, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.42, fontWeight: 800, color: '#fff', letterSpacing: 0,
      }}
    >
      {(team.name || '?').replace(/[^0-9a-zA-ZÀ-ú]/g, '').slice(0, 3).toUpperCase()}
    </span>
  )
}
