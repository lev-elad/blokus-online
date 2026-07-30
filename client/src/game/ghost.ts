import {
  orientationsOf,
  translate,
  validatePlacement,
  type Coord,
  type GameState,
  type PieceId,
  type PlacementError,
} from '@blokus/engine';

export interface Ghost {
  cells: Coord[];
  valid: boolean;
  error?: PlacementError;
}

/** The piece cell that sits under the cursor: the top-most, left-most cell of the orientation. */
export function pivotOf(cells: Coord[]): Coord {
  return cells[0];
}

/** Absolute board cells for a selected/oriented piece anchored so its pivot sits at `hover`. */
export function orientedCells(pieceId: PieceId, orientationIndex: number, hover: Coord): Coord[] {
  const orientation = orientationsOf(pieceId)[orientationIndex];
  const pivot = pivotOf(orientation);
  return translate(orientation, hover.x - pivot.x, hover.y - pivot.y);
}

/** Compute the live placement preview (cells + legality) for the current selection, or null. */
export function computeGhost(
  game: GameState,
  pieceId: PieceId | null,
  orientationIndex: number,
  hover: Coord | null,
): Ghost | null {
  if (!pieceId || !hover) return null;
  const cells = orientedCells(pieceId, orientationIndex, hover);
  const res = validatePlacement(game, game.currentPlayerIndex, pieceId, cells);
  return { cells, valid: res.ok, error: res.error };
}
