import type { GameConfig } from './types';

/**
 * Blokus Duo — the purpose-built 2-player game.
 * A 14×14 board with the two start cells near the centre at (4, 4) and (9, 9)
 * (0-indexed) — the 5th cell in from opposite corners along both axes.
 */
export const DUO_CONFIG: GameConfig = {
  boardSize: 14,
  colors: ['purple', 'orange'],
  labels: ['Purple', 'Orange'],
  startCells: [
    { x: 4, y: 4 },
    { x: 9, y: 9 },
  ],
};
