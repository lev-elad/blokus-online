import type { GameConfig, GameState, Move, PlayerState } from './types';
import { cloneBoard, createBoard } from './board';
import { PIECE_IDS } from './pieces';
import { hasAnyLegalMove, validatePlacement } from './rules';

/** Create a fresh game from a config. Player 0 moves first. */
export function createGame(config: GameConfig): GameState {
  const players: PlayerState[] = config.colors.map((color, index) => ({
    index,
    color,
    label: config.labels?.[index] ?? `Player ${index + 1}`,
    startCell: config.startCells[index],
    remaining: [...PIECE_IDS],
    hasPlacedFirst: false,
    active: true,
    finishedAll: false,
    lastPieceId: null,
  }));

  return {
    config,
    board: createBoard(config.boardSize),
    players,
    currentPlayerIndex: 0,
    turn: 0,
    history: [],
    status: 'playing',
  };
}

function clonePlayer(p: PlayerState): PlayerState {
  return { ...p, remaining: [...p.remaining], startCell: { ...p.startCell } };
}

function cloneState(state: GameState): GameState {
  return {
    config: state.config,
    board: cloneBoard(state.board),
    players: state.players.map(clonePlayer),
    currentPlayerIndex: state.currentPlayerIndex,
    turn: state.turn,
    history: state.history.slice(),
    status: state.status,
  };
}

/**
 * Hand the turn to the next player who has a legal move, marking any player who cannot
 * move as permanently inactive. If nobody can move (including the player who just moved,
 * checked last), the game ends. Mutates the given (already-cloned) state.
 */
function advanceTurnInPlace(state: GameState): void {
  const n = state.players.length;
  for (let step = 1; step <= n; step++) {
    const idx = (state.currentPlayerIndex + step) % n;
    const p = state.players[idx];
    if (p.active && hasAnyLegalMove(state, idx)) {
      state.currentPlayerIndex = idx;
      return;
    }
    p.active = false;
  }
  state.status = 'ended';
}

/**
 * Apply a validated move, returning a new immutable state with the turn advanced.
 * Throws if the game has ended, it isn't the player's turn, or the move is illegal —
 * callers that want a soft failure should use {@link tryApplyMove}.
 */
export function applyMove(state: GameState, move: Move): GameState {
  if (state.status !== 'playing') throw new Error('Game has already ended');
  if (move.playerIndex !== state.currentPlayerIndex) throw new Error('Not this player’s turn');

  const res = validatePlacement(state, move.playerIndex, move.pieceId, move.cells);
  if (!res.ok) throw new Error(`Illegal move (${res.error ?? 'unknown'})`);

  const next = cloneState(state);
  const player = next.players[move.playerIndex];
  for (const c of move.cells) {
    next.board[c.y][c.x] = move.playerIndex;
  }
  player.remaining = player.remaining.filter((id) => id !== move.pieceId);
  player.hasPlacedFirst = true;
  player.lastPieceId = move.pieceId;
  player.finishedAll = player.remaining.length === 0;
  next.history.push({
    playerIndex: move.playerIndex,
    pieceId: move.pieceId,
    cells: move.cells.map((c) => ({ x: c.x, y: c.y })),
  });
  next.turn += 1;

  advanceTurnInPlace(next);
  return next;
}

export interface TryApplyResult {
  ok: boolean;
  state?: GameState;
  error?: string;
}

/** Like {@link applyMove} but returns a result object instead of throwing. */
export function tryApplyMove(state: GameState, move: Move): TryApplyResult {
  if (state.status !== 'playing') return { ok: false, error: 'game-ended' };
  if (move.playerIndex !== state.currentPlayerIndex) return { ok: false, error: 'not-your-turn' };
  const res = validatePlacement(state, move.playerIndex, move.pieceId, move.cells);
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, state: applyMove(state, move) };
}
