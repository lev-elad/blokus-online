import { describe, it, expect } from 'vitest';
import { computeScores, createDuoGame, createGame, getResult } from '../src/index';

function soloState() {
  return createGame({ boardSize: 5, colors: ['solo'], startCells: [{ x: 0, y: 0 }] });
}

describe('scoring', () => {
  it('scores a fresh game as 0 points for each player', () => {
    for (const sc of computeScores(createDuoGame())) {
      expect(sc.placedSquares).toBe(0);
      expect(sc.remainingSquares).toBe(89);
      expect(sc.placedAll).toBe(false);
      expect(sc.score).toBe(0);
    }
  });

  it('awards +15 for placing all pieces, plus +5 more when the monomino is last', () => {
    const s = soloState();
    s.players[0].remaining = [];
    s.players[0].lastPieceId = 'I1';
    const sc = computeScores(s)[0];
    expect(sc.placedAll).toBe(true);
    expect(sc.monominoLast).toBe(true);
    expect(sc.placedSquares).toBe(89);
    expect(sc.bonus).toBe(20);
    expect(sc.score).toBe(109); // 89 placed + 20 bonus
  });

  it('awards +15 (not +20) when the last piece is not the monomino', () => {
    const s = soloState();
    s.players[0].remaining = [];
    s.players[0].lastPieceId = 'I5';
    const sc = computeScores(s)[0];
    expect(sc.bonus).toBe(15);
    expect(sc.score).toBe(104); // 89 placed + 15 bonus
  });

  it('names the highest score as the winner (more placed squares wins)', () => {
    const s = createDuoGame();
    s.players[0].remaining = ['I1']; // 1 square left -> 88 placed
    s.players[1].remaining = ['I5']; // 5 squares left -> 84 placed
    const { winners, scores } = getResult(s);
    expect(scores[0].score).toBe(88);
    expect(scores[1].score).toBe(84);
    expect(winners).toEqual([0]);
  });
});
