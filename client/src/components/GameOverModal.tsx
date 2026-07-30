import { getResult } from '@blokus/engine';
import { useGame } from '../game/store';

export function GameOverModal() {
  const game = useGame((s) => s.game);
  const newGame = useGame((s) => s.newGame);

  if (game.status !== 'ended') return null;

  const { scores, winners } = getResult(game);
  const tie = winners.length > 1;
  const title = tie ? "It's a tie!" : `${game.players[winners[0]].label} wins!`;

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-label="Game over">
        <h2 className="modal__title">{title}</h2>
        <div className="modal__scores">
          {scores.map((sc) => {
            const p = game.players[sc.playerIndex];
            const win = winners.includes(sc.playerIndex);
            return (
              <div
                key={sc.playerIndex}
                className={`score-row score-row--p${sc.playerIndex} ${win ? 'score-row--win' : ''}`}
              >
                <span className="score-row__name">
                  {p.label}
                  {win && ' 👑'}
                </span>
                <span className="score-row__detail">
                  {sc.placedAll ? `all placed · +${sc.bonus} bonus` : `${sc.remainingSquares} squares left`}
                </span>
                <span className="score-row__score">{sc.score > 0 ? `+${sc.score}` : sc.score}</span>
              </div>
            );
          })}
        </div>
        <button type="button" className="btn btn--primary" onClick={newGame}>
          New game
        </button>
      </div>
    </div>
  );
}
