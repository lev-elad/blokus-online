import { useEffect } from 'react';
import { useGame } from './game/store';
import { Board } from './components/Board';
import { PieceTray } from './components/PieceTray';
import { Controls } from './components/Controls';
import { PlayerPanel } from './components/PlayerPanel';
import { GameOverModal } from './components/GameOverModal';

export default function App() {
  const rotate = useGame((s) => s.rotate);
  const flip = useGame((s) => s.flip);
  const selectPiece = useGame((s) => s.selectPiece);
  const newGame = useGame((s) => s.newGame);
  const currentIndex = useGame((s) => s.game.currentPlayerIndex);
  const status = useGame((s) => s.game.status);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'r':
          rotate('cw');
          break;
        case 'e':
          rotate('ccw');
          break;
        case 'f':
          flip();
          break;
        case 'escape':
          selectPiece(null);
          break;
        default:
          return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rotate, flip, selectPiece]);

  return (
    <div
      data-turn={status === 'playing' ? `p${currentIndex}` : 'none'}
      className="mx-auto flex min-h-full max-w-[920px] flex-col gap-4 px-4 pb-12 pt-[18px]"
    >
      <header className="flex items-center justify-between gap-3">
        <h1 className="m-0 flex items-center gap-2.5 text-[1.7rem] font-extrabold tracking-tight">
          Blokus
          <span className="rounded-full bg-accent px-[9px] py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-white transition-colors">
            Duo
          </span>
        </h1>
        <button type="button" className="btn" onClick={newGame}>
          New game
        </button>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <PlayerPanel index={0} />
        <PlayerPanel index={1} />
      </section>

      <main className="flex justify-center">
        <Board />
      </main>

      <section className="flex flex-col items-center gap-3">
        <Controls />
        <PieceTray />
      </section>

      <GameOverModal />
    </div>
  );
}
