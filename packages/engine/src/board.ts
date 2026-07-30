import type { Cell } from './types';

/** An empty `size` × `size` board. */
export function createBoard(size: number): Cell[][] {
  return Array.from({ length: size }, () => Array<Cell>(size).fill(null));
}

/** A shallow-per-row copy of a board (cells are primitives, so this is a full clone). */
export function cloneBoard(board: Cell[][]): Cell[][] {
  return board.map((row) => row.slice());
}

export function inBounds(size: number, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < size && y < size;
}

/** Count how many cells on the board belong to a given player. */
export function countCells(board: Cell[][], playerIndex: number): number {
  let n = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell === playerIndex) n++;
    }
  }
  return n;
}
