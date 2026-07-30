import type { GameState, PieceId } from './types';
import { PIECES } from './pieces';

export const MONOMINO_ID: PieceId = 'I1';
export const ALL_PLACED_BONUS = 15;
export const MONOMINO_LAST_BONUS = 5;

export interface PlayerScore {
  playerIndex: number;
  /** Total unit squares in the player's unplaced pieces. */
  remainingSquares: number;
  placedAll: boolean;
  monominoLast: boolean;
  bonus: number;
  /** Final score: −remainingSquares + bonus. Higher is better. */
  score: number;
}

/** Total unit squares across a set of piece ids. */
export function remainingSquares(remaining: PieceId[]): number {
  let sum = 0;
  for (const id of remaining) sum += PIECES[id].size;
  return sum;
}

/**
 * Blokus scoring: −1 per leftover square; +15 for placing all 21 pieces; +5 more if the
 * very last piece placed was the monomino.
 */
export function computeScores(state: GameState): PlayerScore[] {
  return state.players.map((p) => {
    const rem = remainingSquares(p.remaining);
    const placedAll = p.remaining.length === 0;
    const monominoLast = placedAll && p.lastPieceId === MONOMINO_ID;
    const bonus = placedAll ? ALL_PLACED_BONUS + (monominoLast ? MONOMINO_LAST_BONUS : 0) : 0;
    return {
      playerIndex: p.index,
      remainingSquares: rem,
      placedAll,
      monominoLast,
      bonus,
      score: -rem + bonus,
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
