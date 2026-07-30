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
    <div className={`panel panel--p${index} ${isCurrent ? 'panel--active' : ''}`}>
      <div className="panel__top">
        <span className="panel__swatch" />
        <span className="panel__name">{p.label}</span>
        {isCurrent && <span className="panel__turn">● turn</span>}
      </div>
      <div className="panel__squares">
        <strong>{squares}</strong>
        <span>squares left</span>
      </div>
      <div className="panel__status">{status}</div>
    </div>
  );
}
