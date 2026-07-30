import { describe, it, expect } from 'vitest';
import {
  applyMove,
  createDuoGame,
  getLegalMoves,
  hasAnyLegalMove,
  isShapeOfPiece,
  validatePlacement,
} from '../src/index';
import type { GameState } from '../src/index';

/** P0 plays the V3 tromino on its start cell; P1 plays a monomino on its start cell. Turn returns to P0. */
function afterOpening(): GameState {
  let s = createDuoGame();
  s = applyMove(s, {
    playerIndex: 0,
    pieceId: 'V3',
    cells: [
      { x: 4, y: 4 },
      { x: 5, y: 4 },
      { x: 4, y: 5 },
    ],
  });
  s = applyMove(s, { playerIndex: 1, pieceId: 'I1', cells: [{ x: 9, y: 9 }] });
  return s;
}

describe('first move', () => {
  it('must cover the start cell', () => {
    const s = createDuoGame();
    expect(validatePlacement(s, 0, 'I1', [{ x: 0, y: 0 }]).error).toBe('first-not-on-start');
    expect(validatePlacement(s, 0, 'I1', [{ x: 4, y: 4 }]).ok).toBe(true);
  });

  it('applyMove throws when the first piece misses the start cell', () => {
    const s = createDuoGame();
    expect(() => applyMove(s, { playerIndex: 0, pieceId: 'I1', cells: [{ x: 0, y: 0 }] })).toThrow();
  });
});

describe('placement geometry', () => {
  it('rejects overlap', () => {
    expect(validatePlacement(afterOpening(), 0, 'I1', [{ x: 4, y: 4 }]).error).toBe('overlap');
  });

  it('rejects out-of-bounds cells', () => {
    expect(validatePlacement(afterOpening(), 0, 'I1', [{ x: 14, y: 0 }]).error).toBe('out-of-bounds');
  });

  it('rejects a piece edge-adjacent to your own colour', () => {
    // (6,4) is orthogonally adjacent to P0's (5,4).
    expect(validatePlacement(afterOpening(), 0, 'I1', [{ x: 6, y: 4 }]).error).toBe('edge-adjacent-own');
  });

  it('accepts a piece that touches your own colour only at a corner', () => {
    // (6,5) is diagonal to P0's (5,4) and not edge-adjacent to any P0 cell.
    expect(validatePlacement(afterOpening(), 0, 'I1', [{ x: 6, y: 5 }]).ok).toBe(true);
  });

  it('rejects a piece with no corner contact to your own colour', () => {
    expect(validatePlacement(afterOpening(), 0, 'I1', [{ x: 0, y: 0 }]).error).toBe('no-corner-own');
  });

  it('rejects a piece the player no longer owns', () => {
    expect(validatePlacement(afterOpening(), 0, 'V3', [{ x: 6, y: 5 }, { x: 7, y: 5 }, { x: 6, y: 6 }]).error).toBe(
      'not-your-piece',
    );
  });

  it('rejects cells that are not a real orientation of the piece', () => {
    // A 2-cell gap is not a valid domino shape.
    expect(validatePlacement(afterOpening(), 0, 'I2', [{ x: 6, y: 5 }, { x: 8, y: 5 }]).error).toBe('bad-shape');
  });
});

describe('isShapeOfPiece', () => {
  it('accepts genuine orientations and rejects impostors', () => {
    expect(isShapeOfPiece('I2', [{ x: 0, y: 0 }, { x: 0, y: 1 }])).toBe(true); // vertical domino
    expect(isShapeOfPiece('I2', [{ x: 0, y: 0 }, { x: 2, y: 0 }])).toBe(false); // gap
    expect(isShapeOfPiece('O4', [{ x: 3, y: 3 }, { x: 4, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 4 }])).toBe(true);
    expect(isShapeOfPiece('I4', [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }])).toBe(true);
  });
});

describe('legal-move enumeration', () => {
  it('offers only start-cell-covering moves on the opening', () => {
    const s = createDuoGame();
    expect(hasAnyLegalMove(s, 0)).toBe(true);
    const moves = getLegalMoves(s, 0);
    expect(moves.length).toBeGreaterThan(0);
    for (const m of moves) {
      expect(m.cells.some((c) => c.x === 4 && c.y === 4)).toBe(true);
      expect(validatePlacement(s, 0, m.pieceId, m.cells).ok).toBe(true);
    }
  });

  it('every enumerated mid-game move validates', () => {
    const s = afterOpening();
    const moves = getLegalMoves(s, 0);
    expect(moves.length).toBeGreaterThan(0);
    for (const m of moves) {
      expect(validatePlacement(s, 0, m.pieceId, m.cells).ok).toBe(true);
    }
  });
});
