import { describe, it, expect } from 'vitest';
import {
  applyMove,
  countCells,
  createDuoGame,
  createGame,
  getLegalMoves,
  remainingSquares,
  tryApplyMove,
} from '../src/index';

describe('createDuoGame', () => {
  it('sets up a 14×14 board with two players holding 21 pieces each', () => {
    const s = createDuoGame();
    expect(s.board).toHaveLength(14);
    expect(s.board[0]).toHaveLength(14);
    expect(s.players).toHaveLength(2);
    for (const p of s.players) expect(p.remaining).toHaveLength(21);
    expect(s.currentPlayerIndex).toBe(0);
    expect(s.status).toBe('playing');
  });
});

describe('applyMove', () => {
  it('places the piece, consumes it, and passes the turn — without mutating the prior state', () => {
    const s0 = createDuoGame();
    const s1 = applyMove(s0, { playerIndex: 0, pieceId: 'I1', cells: [{ x: 4, y: 4 }] });

    expect(s1.board[4][4]).toBe(0);
    expect(s1.players[0].remaining).not.toContain('I1');
    expect(s1.players[0].hasPlacedFirst).toBe(true);
    expect(s1.currentPlayerIndex).toBe(1);

    // s0 is untouched (immutability)
    expect(s0.board[4][4]).toBeNull();
    expect(s0.players[0].remaining).toContain('I1');
    expect(s0.currentPlayerIndex).toBe(0);
  });

  it('rejects playing out of turn', () => {
    const s = createDuoGame();
    const r = tryApplyMove(s, { playerIndex: 1, pieceId: 'I1', cells: [{ x: 9, y: 9 }] });
    expect(r.ok).toBe(false);
    expect(r.error).toBe('not-your-turn');
  });
});

describe('turn skipping and end detection', () => {
  it('ends the game when the sole player runs out of moves', () => {
    const s = createGame({ boardSize: 5, colors: ['solo'], startCells: [{ x: 0, y: 0 }] });
    s.players[0].remaining = ['I1']; // only the monomino
    const done = applyMove(s, { playerIndex: 0, pieceId: 'I1', cells: [{ x: 0, y: 0 }] });
    expect(done.players[0].finishedAll).toBe(true);
    expect(done.status).toBe('ended');
  });
});

describe('square conservation', () => {
  it('keeps placed + remaining squares = 89 for every player throughout a game', () => {
    let s = createDuoGame();
    for (let i = 0; i < 12 && s.status === 'playing'; i++) {
      const moves = getLegalMoves(s, s.currentPlayerIndex);
      if (moves.length === 0) break;
      s = applyMove(s, moves[Math.floor(moves.length / 2)]);
      for (const p of s.players) {
        expect(countCells(s.board, p.index) + remainingSquares(p.remaining)).toBe(89);
      }
    }
  });
});
