export * from './types';
export * from './pieces';
export * from './board';
export * from './rules';
export * from './game';
export * from './scoring';
export * from './config';

import { DUO_CONFIG } from './config';
import { createGame } from './game';
import { PIECE_IDS } from './pieces';
import type { GameState } from './types';

/** Number of pieces each player owns (21). */
export const PIECE_COUNT = PIECE_IDS.length;

/** Convenience factory for a standard Blokus Duo game. */
export function createDuoGame(): GameState {
  return createGame(DUO_CONFIG);
}
