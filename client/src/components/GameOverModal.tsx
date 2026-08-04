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
        <h2 className="mb-[18px] mt-0 text-[1.6rem] font-extrabold">{title}</h2>
        <div className="mb-[22px] flex flex-col gap-2">
          {scores.map((sc) => {
            const p = game.players[sc.playerIndex];
            const win = winners.includes(sc.playerIndex);
            const detail = sc.placedAll
              ? `all 21 placed · +${sc.bonus} bonus`
              : `${p.remaining.length} pieces left`;
            return (
              <div
                key={sc.playerIndex}
                className={`score-row score-row-p${sc.playerIndex} ${win ? 'score-row-win' : ''}`}
              >
                <span className="font-bold [grid-area:name]">
                  {p.label}
                  {win && ' 👑'}
                </span>
                <span className="text-[0.78rem] text-dim [grid-area:detail]">{detail}</span>
                <span className="text-2xl font-extrabold tabular-nums text-[color:var(--rc)] [grid-area:score]">
                  {sc.score}
                  <span className="ml-1 text-xs font-semibold text-dim">pts</span>
                </span>
              </div>
            );
          })}
        </div>
        <button type="button" className="btn btn-primary w-full py-3 text-base" onClick={newGame}>
          New game
        </button>
      </div>
    </div>
  );
}
