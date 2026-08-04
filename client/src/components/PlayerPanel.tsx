import { remainingSquares } from '@blokus/engine';
import { useGame } from '../game/store';

export function PlayerPanel({ index }: { index: number }) {
  const game = useGame((s) => s.game);
  const p = game.players[index];
  const isCurrent = game.status === 'playing' && game.currentPlayerIndex === index;
  const squares = remainingSquares(p.remaining);

  const status = p.finishedAll
    ? 'Finished! 🎉'
    : !p.active
      ? 'No moves left'
      : `${p.remaining.length} pieces left`;

  return (
    <div className={`panel panel-p${index} ${isCurrent ? 'panel-active' : ''}`}>
      <div className="flex items-center gap-2.5">
        <span className="panel-swatch" />
        <span className="font-bold">{p.label}</span>
        {isCurrent && (
          <span className="ml-auto text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[color:var(--pc)]">
            ● turn
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <strong className="text-2xl tabular-nums">{squares}</strong>
        <span className="text-[0.82rem] text-dim">squares left</span>
      </div>
      <div className="text-[0.8rem] text-dim">{status}</div>
    </div>
  );
}
