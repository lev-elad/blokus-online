import { useEffect } from 'react';
import { useGame } from './game/store';
import { Board } from './components/Board';
import { PieceTray } from './components/PieceTray';
import { Controls } from './components/Controls';
import { PlayerPanel } from './components/PlayerPanel';
import { GameOverModal } from './components/GameOverModal';
import './game.css';

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
    <div className="app" data-turn={status === 'playing' ? `p${currentIndex}` : 'none'}>
      <header className="app__header">
        <h1 className="app__title">
          Blokus <span className="app__badge">Duo</span>
        </h1>
        <button type="button" className="btn" onClick={newGame}>
          New game
        </button>
      </header>

      <section className="scoreboard">
        <PlayerPanel index={0} />
        <PlayerPanel index={1} />
      </section>

      <main className="play">
        <Board />
      </main>

      <section className="dock">
        <Controls />
        <PieceTray />
      </section>

      <GameOverModal />
    </div>
  );
}
