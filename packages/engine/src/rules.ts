import type { Coord, GameState, Move, PieceId, PlacementResult, PlayerIndex } from './types';
import { inBounds } from './board';
import { cellsKey, normalize, orientationsOf, translate } from './pieces';

const ORTHOGONAL: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

const DIAGONAL: ReadonlyArray<readonly [number, number]> = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

const orientationKeySets = new Map<PieceId, Set<string>>();

function orientationKeys(id: PieceId): Set<string> {
  let set = orientationKeySets.get(id);
  if (!set) {
    set = new Set(orientationsOf(id).map((o) => cellsKey(o)));
    orientationKeySets.set(id, set);
  }
  return set;
}

/** True when `cells` is exactly some rotation/reflection of the given piece. */
export function isShapeOfPiece(id: PieceId, cells: Coord[]): boolean {
  return orientationKeys(id).has(cellsKey(normalize(cells)));
}

/**
 * The core Blokus geometry check for a set of absolute cells belonging to `playerIndex`:
 * in bounds, no overlap, never edge-adjacent to the player's own colour, and either
 * (first move) covering the player's start cell, or (later) touching the player's own
 * colour diagonally. Does not check piece ownership/shape — see {@link validatePlacement}.
 */
export function checkGeometry(
  state: GameState,
  playerIndex: PlayerIndex,
  cells: Coord[],
): PlacementResult {
  const size = state.config.boardSize;
  const board = state.board;
  const player = state.players[playerIndex];

  for (const c of cells) {
    if (!inBounds(size, c.x, c.y)) return { ok: false, error: 'out-of-bounds' };
    if (board[c.y][c.x] !== null) return { ok: false, error: 'overlap' };
  }

  let touchesCorner = false;
  for (const c of cells) {
    for (const [dx, dy] of ORTHOGONAL) {
      const nx = c.x + dx;
      const ny = c.y + dy;
      if (inBounds(size, nx, ny) && board[ny][nx] === playerIndex) {
        return { ok: false, error: 'edge-adjacent-own' };
      }
    }
    for (const [dx, dy] of DIAGONAL) {
      const nx = c.x + dx;
      const ny = c.y + dy;
      if (inBounds(size, nx, ny) && board[ny][nx] === playerIndex) {
        touchesCorner = true;
      }
    }
  }

  if (!player.hasPlacedFirst) {
    const start = player.startCell;
    const coversStart = cells.some((c) => c.x === start.x && c.y === start.y);
    return coversStart ? { ok: true } : { ok: false, error: 'first-not-on-start' };
  }

  return touchesCorner ? { ok: true } : { ok: false, error: 'no-corner-own' };
}

/** Full validation of a placement: ownership, shape integrity, then geometry. */
export function validatePlacement(
  state: GameState,
  playerIndex: PlayerIndex,
  pieceId: PieceId,
  cells: Coord[],
): PlacementResult {
  const player = state.players[playerIndex];
  if (!player.remaining.includes(pieceId)) return { ok: false, error: 'not-your-piece' };
  if (cells.length === 0 || !isShapeOfPiece(pieceId, cells)) {
    return { ok: false, error: 'bad-shape' };
  }
  return checkGeometry(state, playerIndex, cells);
}

/**
 * Empty cells worth trying to build on: the start cell for a first move, otherwise every
 * empty cell diagonally adjacent to one of the player's own cells. A legal non-first move
 * must cover at least one such cell, so this is a sound (and small) search frontier.
 */
export function candidateCells(state: GameState, playerIndex: PlayerIndex): Coord[] {
  const size = state.config.boardSize;
  const board = state.board;
  const player = state.players[playerIndex];

  if (!player.hasPlacedFirst) {
    const s = player.startCell;
    return board[s.y][s.x] === null ? [{ x: s.x, y: s.y }] : [];
  }

  const out: Coord[] = [];
  const seen = new Set<string>();
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (board[y][x] !== playerIndex) continue;
      for (const [dx, dy] of DIAGONAL) {
        const nx = x + dx;
        const ny = y + dy;
        if (!inBounds(size, nx, ny) || board[ny][nx] !== null) continue;
        const key = `${nx},${ny}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ x: nx, y: ny });
      }
    }
  }
  return out;
}

/** Every legal placement for a player in the current state (used for pass detection and, later, the bot). */
export function getLegalMoves(state: GameState, playerIndex: PlayerIndex): Move[] {
  const player = state.players[playerIndex];
  const anchors = candidateCells(state, playerIndex);
  if (anchors.length === 0) return [];

  const moves: Move[] = [];
  const seen = new Set<string>();
  for (const pieceId of player.remaining) {
    for (const orientation of orientationsOf(pieceId)) {
      for (const anchor of anchors) {
        // Slide the piece so each of its cells in turn lands on the anchor.
        for (const pivot of orientation) {
          const abs = translate(orientation, anchor.x - pivot.x, anchor.y - pivot.y);
          if (!checkGeometry(state, playerIndex, abs).ok) continue;
          const absSorted = abs.slice().sort((a, b) => a.y - b.y || a.x - b.x);
          const key = `${pieceId}@${cellsKey(absSorted)}`;
          if (seen.has(key)) continue;
          seen.add(key);
          moves.push({ playerIndex, pieceId, cells: abs });
        }
      }
    }
  }
  return moves;
}

/** Whether a player has any legal move (cheaper than enumerating them all). */
export function hasAnyLegalMove(state: GameState, playerIndex: PlayerIndex): boolean {
  const player = state.players[playerIndex];
  const anchors = candidateCells(state, playerIndex);
  if (anchors.length === 0) return false;

  for (const pieceId of player.remaining) {
    for (const orientation of orientationsOf(pieceId)) {
      for (const anchor of anchors) {
        for (const pivot of orientation) {
          const abs = translate(orientation, anchor.x - pivot.x, anchor.y - pivot.y);
          if (checkGeometry(state, playerIndex, abs).ok) return true;
        }
      }
    }
  }
  return false;
}

/** The set of a player's remaining pieces that have at least one legal placement right now. */
export function playablePieceIds(state: GameState, playerIndex: PlayerIndex): Set<PieceId> {
  const player = state.players[playerIndex];
  const anchors = candidateCells(state, playerIndex);
  const out = new Set<PieceId>();
  if (anchors.length === 0) return out;

  for (const pieceId of player.remaining) {
    let playable = false;
    search: for (const orientation of orientationsOf(pieceId)) {
      for (const anchor of anchors) {
        for (const pivot of orientation) {
          const abs = translate(orientation, anchor.x - pivot.x, anchor.y - pivot.y);
          if (checkGeometry(state, playerIndex, abs).ok) {
            playable = true;
            break search;
          }
        }
      }
    }
    if (playable) out.add(pieceId);
  }
  return out;
}
