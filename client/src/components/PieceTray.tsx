import { useMemo, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { PIECES, PIECE_IDS, playablePieceIds } from '@blokus/engine';
import { useGame } from '../game/store';
import { PieceGlyph } from './PieceGlyph';

interface Tip {
  text: string;
  x: number;
  y: number;
}

export function PieceTray() {
  const game = useGame((s) => s.game);
  const selectedPieceId = useGame((s) => s.selectedPieceId);
  const selectPiece = useGame((s) => s.selectPiece);

  const player = game.players[game.currentPlayerIndex];
  const playing = game.status === 'playing';

  // Which of the current player's remaining pieces actually have a legal move this turn.
  const playable = useMemo(
    () => (playing ? playablePieceIds(game, game.currentPlayerIndex) : null),
    [game, playing],
  );

  // Custom tooltip (unusable pieces only) that follows the cursor.
  const [tip, setTip] = useState<Tip | null>(null);
  const handleMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-tip]');
    if (el) setTip({ text: el.dataset.tip ?? '', x: e.clientX, y: e.clientY });
    else if (tip) setTip(null);
  };

  return (
    <div
      className={`tray tray-p${player.index}`}
      aria-label={`${player.label}'s pieces`}
      onPointerMove={handleMove}
      onPointerLeave={() => setTip(null)}
    >
      {PIECE_IDS.map((id) => {
        const owned = player.remaining.includes(id);
        const blocked = owned && playing && playable !== null && !playable.has(id);
        const reason: 'used' | 'blocked' | null = !owned ? 'used' : blocked ? 'blocked' : null;
        const interactive = playing && owned && !blocked;
        const selected = selectedPieceId === id;
        const points = PIECES[id].size;
        const tipText = reason === 'used' ? 'Used' : reason === 'blocked' ? 'No legal move' : undefined;

        return (
          <button
            key={id}
            type="button"
            className={[
              'tray-piece',
              selected && 'tray-piece-selected',
              reason === 'used' && 'tray-piece-used',
              reason === 'blocked' && 'tray-piece-blocked',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => interactive && selectPiece(selected ? null : id)}
            aria-disabled={!interactive}
            aria-pressed={selected}
            aria-label={
              reason === 'used'
                ? `${id}, already placed`
                : reason === 'blocked'
                  ? `${id}, no legal move this turn`
                  : `${id}, worth ${points} points`
            }
            data-tip={tipText}
          >
            <PieceGlyph cells={PIECES[id].cells} colorIndex={player.index} box={38} />
            {reason === null && <span className="tray-points">{points}</span>}
            {reason === 'used' && (
              <span className="tray-status tray-status-used" aria-hidden="true">
                ✓
              </span>
            )}
            {reason === 'blocked' && (
              <span className="tray-status tray-status-blocked" aria-hidden="true">
                ✕
              </span>
            )}
          </button>
        );
      })}

      {tip && (
        <div className="tip" style={{ left: tip.x + 14, top: tip.y - 12 }} role="tooltip">
          {tip.text}
        </div>
      )}
    </div>
  );
}
