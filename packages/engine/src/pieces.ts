import type { Coord, PieceDef, PieceId } from './types';

/**
 * Canonical piece shapes as [x, y] pairs, normalized so the minimum x and y are 0.
 * Rotations and reflections are derived at runtime by {@link computeOrientations}.
 */
const RAW: Record<PieceId, [number, number][]> = {
  // size 1
  I1: [[0, 0]],
  // size 2
  I2: [[0, 0], [1, 0]],
  // size 3
  I3: [[0, 0], [1, 0], [2, 0]],
  V3: [[0, 0], [1, 0], [0, 1]],
  // size 4
  I4: [[0, 0], [1, 0], [2, 0], [3, 0]],
  L4: [[0, 0], [0, 1], [0, 2], [1, 2]],
  T4: [[0, 0], [1, 0], [2, 0], [1, 1]],
  S4: [[1, 0], [2, 0], [0, 1], [1, 1]],
  O4: [[0, 0], [1, 0], [0, 1], [1, 1]],
  // size 5 — the 12 pentominoes
  F: [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]],
  I5: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
  L5: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]],
  N: [[1, 0], [1, 1], [0, 2], [1, 2], [0, 3]],
  P: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]],
  T5: [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]],
  U: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1]],
  V5: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]],
  W: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]],
  X: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]],
  Y: [[1, 0], [0, 1], [1, 1], [1, 2], [1, 3]],
  Z: [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]],
};

/** All 21 piece ids, in canonical order (size-ascending). */
export const PIECE_IDS = Object.keys(RAW) as PieceId[];

function toCoords(pairs: [number, number][]): Coord[] {
  return pairs.map(([x, y]) => ({ x, y }));
}

/** The canonical definition of every piece, keyed by id. */
export const PIECES: Record<PieceId, PieceDef> = Object.fromEntries(
  PIECE_IDS.map((id) => {
    const cells = toCoords(RAW[id]);
    return [id, { id, size: cells.length, cells } satisfies PieceDef];
  }),
) as Record<PieceId, PieceDef>;

// --- geometry helpers ---

/** Translate a shape so its minimum x and y are 0, and sort cells (row-major) for a stable order. */
export function normalize(cells: Coord[]): Coord[] {
  let minX = Infinity;
  let minY = Infinity;
  for (const c of cells) {
    if (c.x < minX) minX = c.x;
    if (c.y < minY) minY = c.y;
  }
  return cells
    .map((c) => ({ x: c.x - minX, y: c.y - minY }))
    .sort((a, b) => a.y - b.y || a.x - b.x);
}

/** A canonical string key for a shape. Expects normalized (translated + sorted) cells. */
export function cellsKey(cells: Coord[]): string {
  return cells.map((c) => `${c.x},${c.y}`).join(';');
}

/** Rotate 90° clockwise ('cw': (x, y) -> (-y, x)) or counter-clockwise ('ccw': (x, y) -> (y, -x)). */
export function rotateCells(cells: Coord[], dir: 'cw' | 'ccw' = 'cw'): Coord[] {
  return dir === 'cw'
    ? cells.map((c) => ({ x: -c.y, y: c.x }))
    : cells.map((c) => ({ x: c.y, y: -c.x }));
}

/** Reflect across the vertical axis: (x, y) -> (-x, y). */
export function reflectCells(cells: Coord[]): Coord[] {
  return cells.map((c) => ({ x: -c.x, y: c.y }));
}

/** All distinct orientations (rotations × reflections) of a shape, normalized. */
export function computeOrientations(cells: Coord[]): Coord[][] {
  const seen = new Map<string, Coord[]>();
  let cur = cells;
  for (let r = 0; r < 4; r++) {
    for (const variant of [cur, reflectCells(cur)]) {
      const norm = normalize(variant);
      const key = cellsKey(norm);
      if (!seen.has(key)) seen.set(key, norm);
    }
    cur = rotateCells(cur, 'cw');
  }
  return [...seen.values()];
}

const ORIENTATION_CACHE = new Map<PieceId, Coord[][]>();

/** The distinct orientations of a piece (memoized). */
export function orientationsOf(id: PieceId): Coord[][] {
  let o = ORIENTATION_CACHE.get(id);
  if (!o) {
    o = computeOrientations(PIECES[id].cells);
    ORIENTATION_CACHE.set(id, o);
  }
  return o;
}

/** Return a copy of `cells` shifted by (dx, dy). */
export function translate(cells: Coord[], dx: number, dy: number): Coord[] {
  return cells.map((c) => ({ x: c.x + dx, y: c.y + dy }));
}

/** Index of the orientation matching `cells` within a piece's orientation list, or -1 if none. */
export function orientationIndexOf(id: PieceId, cells: Coord[]): number {
  const key = cellsKey(normalize(cells));
  return orientationsOf(id).findIndex((o) => cellsKey(o) === key);
}
