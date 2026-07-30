import { describe, it, expect } from 'vitest';
import { PIECES, PIECE_IDS, orientationsOf, cellsKey } from '../src/index';
import type { Coord, PieceId } from '../src/index';

describe('piece set', () => {
  it('has exactly 21 pieces', () => {
    expect(PIECE_IDS).toHaveLength(21);
    expect(Object.keys(PIECES)).toHaveLength(21);
  });

  it('totals 89 unit squares', () => {
    const total = PIECE_IDS.reduce((sum, id) => sum + PIECES[id].size, 0);
    expect(total).toBe(89);
  });

  it('has the expected size distribution (1,1,2,5,12 pieces of size 1..5)', () => {
    const bySize: Record<number, number> = {};
    for (const id of PIECE_IDS) bySize[PIECES[id].size] = (bySize[PIECES[id].size] ?? 0) + 1;
    expect(bySize).toEqual({ 1: 1, 2: 1, 3: 2, 4: 5, 5: 12 });
  });

  it('defines every piece as a connected shape matching its declared size', () => {
    for (const id of PIECE_IDS) {
      const def = PIECES[id];
      expect(def.cells).toHaveLength(def.size);
      const keys = new Set(def.cells.map((c) => `${c.x},${c.y}`));
      expect(keys.size).toBe(def.size); // no duplicate cells
      expect(isConnected(def.cells)).toBe(true);
    }
  });
});

// Known number of *fixed* (rotations + reflections counted separately) orientations per piece.
const EXPECTED_ORIENTATIONS: Record<PieceId, number> = {
  I1: 1,
  I2: 2,
  I3: 2,
  V3: 4,
  I4: 2,
  L4: 8,
  T4: 4,
  S4: 4,
  O4: 1,
  F: 8,
  I5: 2,
  L5: 8,
  N: 8,
  P: 8,
  T5: 4,
  U: 4,
  V5: 4,
  W: 4,
  X: 1,
  Y: 8,
  Z: 4,
};

describe('orientations', () => {
  it('produces the known number of fixed orientations per piece', () => {
    for (const id of PIECE_IDS) {
      expect(orientationsOf(id)).toHaveLength(EXPECTED_ORIENTATIONS[id]);
    }
  });

  it('sums to the 91 fixed polyominoes of size 1..5 (1+2+6+19+63)', () => {
    const total = PIECE_IDS.reduce((sum, id) => sum + orientationsOf(id).length, 0);
    expect(total).toBe(1 + 2 + 6 + 19 + 63);
  });

  it('returns normalized, size-preserving, de-duplicated orientations', () => {
    for (const id of PIECE_IDS) {
      const os = orientationsOf(id);
      const keys = new Set(os.map((o) => cellsKey(o)));
      expect(keys.size).toBe(os.length); // all distinct
      for (const o of os) {
        expect(o).toHaveLength(PIECES[id].size);
        expect(Math.min(...o.map((c) => c.x))).toBe(0);
        expect(Math.min(...o.map((c) => c.y))).toBe(0);
      }
    }
  });
});

/** 4-connectivity check for a polyomino. */
function isConnected(cells: Coord[]): boolean {
  if (cells.length === 0) return false;
  const key = (x: number, y: number) => `${x},${y}`;
  const set = new Set(cells.map((c) => key(c.x, c.y)));
  const seen = new Set<string>([key(cells[0].x, cells[0].y)]);
  const stack: Coord[] = [cells[0]];
  while (stack.length) {
    const c = stack.pop() as Coord;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nk = key(c.x + dx, c.y + dy);
      if (set.has(nk) && !seen.has(nk)) {
        seen.add(nk);
        stack.push({ x: c.x + dx, y: c.y + dy });
      }
    }
  }
  return seen.size === cells.length;
}
