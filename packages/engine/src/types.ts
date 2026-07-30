/** A board coordinate. `x` is the column, `y` is the row. Boards are indexed `board[y][x]`. */
export interface Coord {
  x: number;
  y: number;
}

/**
 * The 21 Blokus pieces — every free polyomino of size 1..5:
 *  - size 1: I1 (monomino)
 *  - size 2: I2 (domino)
 *  - size 3: I3, V3
 *  - size 4: I4, L4, T4, S4, O4
 *  - size 5: F, I5, L5, N, P, T5, U, V5, W, X, Y, Z (the 12 pentominoes)
 */
export type PieceId =
  | 'I1'
  | 'I2'
  | 'I3'
  | 'V3'
  | 'I4'
  | 'L4'
  | 'T4'
  | 'S4'
  | 'O4'
  | 'F'
  | 'I5'
  | 'L5'
  | 'N'
  | 'P'
  | 'T5'
  | 'U'
  | 'V5'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z';

/** A piece's canonical shape, normalized so the minimum x and y are 0. */
export interface PieceDef {
  id: PieceId;
  size: number;
  cells: Coord[];
}

/** Index into `GameState.players`. */
export type PlayerIndex = number;

/** A board cell: the owning player's index, or `null` when empty. */
export type Cell = PlayerIndex | null;

/** Everything that varies between game modes (Duo vs Classic) lives here. */
export interface GameConfig {
  boardSize: number;
  /** Presentational colour per player, index-aligned with `players`. */
  colors: string[];
  /** Each player's mandatory first-move cell, index-aligned with `players`. */
  startCells: Coord[];
  /** Optional display names, index-aligned with `players`. */
  labels?: string[];
}

export interface PlayerState {
  index: PlayerIndex;
  color: string;
  label: string;
  startCell: Coord;
  /** Piece ids not yet placed. */
  remaining: PieceId[];
  hasPlacedFirst: boolean;
  /** False once the player can no longer make any legal move (permanent in Blokus). */
  active: boolean;
  finishedAll: boolean;
  /** The id of the most recently placed piece (drives the monomino-last bonus). */
  lastPieceId: PieceId | null;
}

/** A concrete placement: a piece occupying specific absolute board cells. */
export interface Move {
  playerIndex: PlayerIndex;
  pieceId: PieceId;
  cells: Coord[];
}

export type GameStatus = 'playing' | 'ended';

export interface GameState {
  config: GameConfig;
  board: Cell[][];
  players: PlayerState[];
  currentPlayerIndex: PlayerIndex;
  /** Number of moves applied so far. */
  turn: number;
  history: Move[];
  status: GameStatus;
}

/** Why a placement was rejected. */
export type PlacementError =
  | 'not-your-piece'
  | 'bad-shape'
  | 'out-of-bounds'
  | 'overlap'
  | 'edge-adjacent-own'
  | 'no-corner-own'
  | 'first-not-on-start';

export interface PlacementResult {
  ok: boolean;
  error?: PlacementError;
}
