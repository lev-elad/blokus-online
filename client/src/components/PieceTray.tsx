import { PIECES, PIECE_IDS } from '@blokus/engine';
import { useGame } from '../game/store';
import { PieceGlyph } from './PieceGlyph';

export function PieceTray() {
  const game = useGame((s) => s.game);
  const selectedPieceId = useGame((s) => s.selectedPieceId);
  const selectPiece = useGame((s) => s.selectPiece);

  const player = game.players[game.currentPlayerIndex];
  const disabled = game.status !== 'playing';

  return (
    <div className={`tray tray--p${player.index}`} aria-label={`${player.label}'s pieces`}>
      {PIECE_IDS.filter((id) => player.remaining.includes(id)).map((id) => {
        const selected = selectedPieceId === id;
        return (
          <button
            key={id}
            type="button"
            className={`tray__piece ${selected ? 'tray__piece--selected' : ''}`}
            onClick={() => selectPiece(selected ? null : id)}
            disabled={disabled}
            aria-pressed={selected}
            title={id}
          >
            <PieceGlyph cells={PIECES[id].cells} colorIndex={player.index} box={38} />
          </button>
        );
      })}
    </div>
  );
}
