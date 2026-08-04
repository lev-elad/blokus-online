import { create } from 'zustand';
import {
  applyMove,
  createDuoGame,
  getLegalMoves,
  orientationIndexOf,
  orientationsOf,
  reflectCells,
  rotateCells,
  validatePlacement,
  type Coord,
  type GameState,
  type PieceId,
} from '@blokus/engine';
import { orientedCells } from './ghost';

interface GameStore {
  game: GameState;
  selectedPieceId: PieceId | null;
  orientationIndex: number;
  hover: Coord | null;
  /** Bumped whenever an illegal placement is attempted, to drive the shake animation. */
  invalidAt: number;

  newGame: () => void;
  selectPiece: (id: PieceId | null) => void;
  rotate: (dir: 'cw' | 'ccw') => void;
  flip: () => void;
  setHover: (cell: Coord | null) => void;
  place: () => void;
}

function sameCell(a: Coord | null, b: Coord | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.x === b.x && a.y === b.y;
}

export const useGame = create<GameStore>((set, get) => ({
  game: createDuoGame(),
  selectedPieceId: null,
  orientationIndex: 0,
  hover: null,
  invalidAt: 0,

  newGame: () =>
    set({
      game: createDuoGame(),
      selectedPieceId: null,
      orientationIndex: 0,
      hover: null,
      invalidAt: 0,
    }),

  selectPiece: (id) => set({ selectedPieceId: id, orientationIndex: 0 }),

  rotate: (dir) => {
    const { selectedPieceId, orientationIndex } = get();
    if (!selectedPieceId) return;
    const cur = orientationsOf(selectedPieceId)[orientationIndex];
    const next = orientationIndexOf(selectedPieceId, rotateCells(cur, dir));
    if (next >= 0) set({ orientationIndex: next });
  },

  flip: () => {
    const { selectedPieceId, orientationIndex } = get();
    if (!selectedPieceId) return;
    const cur = orientationsOf(selectedPieceId)[orientationIndex];
    const next = orientationIndexOf(selectedPieceId, reflectCells(cur));
    if (next >= 0) set({ orientationIndex: next });
  },

  setHover: (cell) => {
    if (!sameCell(get().hover, cell)) set({ hover: cell });
  },

  place: () => {
    const { game, selectedPieceId, orientationIndex, hover } = get();
    if (!selectedPieceId || !hover || game.status !== 'playing') return;

    const cells = orientedCells(selectedPieceId, orientationIndex, hover);
    const res = validatePlacement(game, game.currentPlayerIndex, selectedPieceId, cells);
    if (!res.ok) {
      set({ invalidAt: Date.now() });
      return;
    }
    const next = applyMove(game, {
      playerIndex: game.currentPlayerIndex,
      pieceId: selectedPieceId,
      cells,
    });
    set({ game: next, selectedPieceId: null, orientationIndex: 0, hover: null });
  },
}));

// Dev-only handles for debugging / verification from the browser console.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  const w = window as unknown as {
    __game?: typeof useGame;
    __playToEnd?: () => unknown;
    __playMoves?: (n: number) => unknown;
  };
  w.__game = useGame;
  // Greedily play out the current game (largest piece first) to reach the end state.
  w.__playToEnd = () => {
    let g = useGame.getState().game;
    let guard = 0;
    while (g.status === 'playing' && guard++ < 500) {
      const moves = getLegalMoves(g, g.currentPlayerIndex);
      if (!moves.length) break;
      let best = moves[0];
      for (const m of moves) if (m.cells.length > best.cells.length) best = m;
      g = applyMove(g, best);
    }
    useGame.setState({ game: g, selectedPieceId: null, orientationIndex: 0, hover: null });
    return { status: g.status, turns: g.turn };
  };
  // Play up to n greedy (largest-piece-first) moves; stops early if the game ends.
  w.__playMoves = (n: number) => {
    let g = useGame.getState().game;
    let played = 0;
    while (g.status === 'playing' && played < n) {
      const moves = getLegalMoves(g, g.currentPlayerIndex);
      if (!moves.length) break;
      let best = moves[0];
      for (const m of moves) if (m.cells.length > best.cells.length) best = m;
      g = applyMove(g, best);
      played++;
    }
    useGame.setState({ game: g, selectedPieceId: null, orientationIndex: 0, hover: null });
    return { status: g.status, turns: g.turn, played };
  };
}
