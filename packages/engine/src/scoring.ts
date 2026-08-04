import type { GameState, PieceId } from './types';
import { PIECES, PIECE_IDS } from './pieces';

export const MONOMINO_ID: PieceId = 'I1';
export const ALL_PLACED_BONUS = 15;
export const MONOMINO_LAST_BONUS = 5;

/** Total unit squares a player starts with (all 21 pieces = 89). */
export const TOTAL_SQUARES = PIECE_IDS.reduce((sum, id) => sum + PIECES[id].size, 0);

export interface PlayerScore {
  playerIndex: number;
  /** Unit squares the player has placed on the board — the points earned from placement. */
  placedSquares: number;
  /** Unit squares still in the player's unplaced pieces. */
  remainingSquares: number;
  placedAll: boolean;
  monominoLast: boolean;
  bonus: number;
  /** Final score (higher is better): placedSquares + bonus. */
  score: number;
}

/** Total unit squares across a set of piece ids. */
export function remainingSquares(remaining: PieceId[]): number {
  let sum = 0;
  for (const id of remaining) sum += PIECES[id].size;
  return sum;
}

/**
 * Blokus scoring, expressed positively: +1 per placed square; +15 for placing all 21 pieces;
 * +5 more if the very last piece placed was the monomino. This is the classic penalty score
 * (−1 per leftover square) shifted by a constant — placed + remaining always sum to
 * TOTAL_SQUARES — so the ranking and winner are identical, just easier to read.
 */
export function computeScores(state: GameState): PlayerScore[] {
  return state.players.map((p) => {
    const remaining = remainingSquares(p.remaining);
    const placed = TOTAL_SQUARES - remaining;
    const placedAll = p.remaining.length === 0;
    const monominoLast = placedAll && p.lastPieceId === MONOMINO_ID;
    const bonus = placedAll ? ALL_PLACED_BONUS + (monominoLast ? MONOMINO_LAST_BONUS : 0) : 0;
    return {
      playerIndex: p.index,
      placedSquares: placed,
      remainingSquares: remaining,
      placedAll,
      monominoLast,
      bonus,
      score: placed + bonus,
    };
  });
}

export interface GameResult {
  scores: PlayerScore[];
  /** Player indices sharing the top score (more than one on a tie). */
  winners: number[];
}

export function getResult(state: GameState): GameResult {
  const scores = computeScores(state);
  const top = Math.max(...scores.map((s) => s.score));
  const winners = scores.filter((s) => s.score === top).map((s) => s.playerIndex);
  return { scores, winners };
}
