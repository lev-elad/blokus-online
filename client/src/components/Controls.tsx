import { orientationsOf } from '@blokus/engine';
import { useGame } from '../game/store';
import { PieceGlyph } from './PieceGlyph';

export function Controls() {
  const game = useGame((s) => s.game);
  const selectedPieceId = useGame((s) => s.selectedPieceId);
  const orientationIndex = useGame((s) => s.orientationIndex);
  const rotate = useGame((s) => s.rotate);
  const flip = useGame((s) => s.flip);
  const selectPiece = useGame((s) => s.selectPiece);

  if (game.status !== 'playing') return null;

  const player = game.players[game.currentPlayerIndex];

  return (
    <div className="controls">
      <div className="controls__preview">
        {selectedPieceId ? (
          <PieceGlyph
            cells={orientationsOf(selectedPieceId)[orientationIndex]}
            colorIndex={player.index}
            box={64}
          />
        ) : (
          <span className="controls__placeholder">?</span>
        )}
      </div>

      <div className="controls__actions">
        <button type="button" onClick={() => rotate('ccw')} disabled={!selectedPieceId} title="Rotate left (E)">
          ⟲
        </button>
        <button type="button" onClick={() => rotate('cw')} disabled={!selectedPieceId} title="Rotate right (R)">
          ⟳
        </button>
        <button type="button" onClick={flip} disabled={!selectedPieceId} title="Flip (F)">
          ⇋
        </button>
        <button type="button" onClick={() => selectPiece(null)} disabled={!selectedPieceId} title="Deselect (Esc)">
          ✕
        </button>
      </div>

      <p className="controls__hint">
        {selectedPieceId ? (
          <>
            Move over the board and click to place. <kbd>R</kbd>/<kbd>E</kbd> rotate · <kbd>F</kbd> flip ·{' '}
            <kbd>Esc</kbd> cancel.
          </>
        ) : (
          <>
            <strong>{player.label}</strong>, choose a piece to place.
          </>
        )}
      </p>
    </div>
  );
}
