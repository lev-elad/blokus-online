import { PIECES, PIECE_IDS } from '@blokus/engine';
import { useGame } from '../game/store';
import { PieceGlyph } from './PieceGlyph';

export function PieceTray() {
  const game = useGame((s) => s.game);
  const selectedPieceId = useGame((s) => s.selectedPieceId);
  const selectPiece = useGame((s) => s.selectPiece);

  const player = game.players[game.currentPlayerIndex];
  const gameOver = game.status !== 'playing';

  return (
    <div className={`tray tray-p${player.index}`} aria-label={`${player.label}'s pieces`}>
      {PIECE_IDS.map((id) => {
        const owned = player.remaining.includes(id);
        const selected = selectedPieceId === id;
        const points = PIECES[id].size;
        return (
          <button
            key={id}
            type="button"
            className={`tray-piece ${selected ? 'tray-piece-selected' : ''} ${
              owned ? '' : 'tray-piece-used'
            }`}
            onClick={() => owned && selectPiece(selected ? null : id)}
            disabled={!owned || gameOver}
            aria-pressed={selected}
            aria-label={owned ? `${id}, worth ${points} points` : `${id}, used`}
            title={owned ? `${id} · ${points} pts` : `${id} · used`}
          >
            <PieceGlyph cells={PIECES[id].cells} colorIndex={player.index} box={38} />
            <span className="tray-points">{points}</span>
          </button>
        );
      })}
    </div>
  );
}
