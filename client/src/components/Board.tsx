import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import type { Coord } from '@blokus/engine';
import { useGame } from '../game/store';
import { computeGhost } from '../game/ghost';

export function Board() {
  const game = useGame((s) => s.game);
  const selectedPieceId = useGame((s) => s.selectedPieceId);
  const orientationIndex = useGame((s) => s.orientationIndex);
  const hover = useGame((s) => s.hover);
  const setHover = useGame((s) => s.setHover);
  const place = useGame((s) => s.place);
  const invalidAt = useGame((s) => s.invalidAt);

  const size = game.config.boardSize;
  const boardRef = useRef<HTMLDivElement>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!invalidAt) return;
    setShake(true);
    const t = setTimeout(() => setShake(false), 380);
    return () => clearTimeout(t);
  }, [invalidAt]);

  const ghost = useMemo(
    () => computeGhost(game, selectedPieceId, orientationIndex, hover),
    [game, selectedPieceId, orientationIndex, hover],
  );

  const startSet = useMemo(() => {
    const m = new Map<string, number>();
    game.players.forEach((p) => m.set(`${p.startCell.x},${p.startCell.y}`, p.index));
    return m;
  }, [game.players]);

  const lastMove = game.history.length ? game.history[game.history.length - 1] : null;
  const playing = game.status === 'playing';

  const cellFromEvent = (e: ReactPointerEvent<HTMLDivElement>): Coord | null => {
    const el = boardRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const cs = rect.width / size;
    const x = Math.floor((e.clientX - rect.left) / cs);
    const y = Math.floor((e.clientY - rect.top) / cs);
    if (x < 0 || y < 0 || x >= size || y >= size) return null;
    return { x, y };
  };

  const pct = (c: Coord): CSSProperties => ({
    left: `${(c.x / size) * 100}%`,
    top: `${(c.y / size) * 100}%`,
    width: `${100 / size}%`,
    height: `${100 / size}%`,
  });

  return (
    <div
      ref={boardRef}
      className={`board ${shake ? 'board--shake' : ''}`}
      style={{ '--n': size } as CSSProperties}
      role="grid"
      aria-label="Blokus board"
      onPointerMove={(e) => {
        if (playing && selectedPieceId) setHover(cellFromEvent(e));
      }}
      onPointerLeave={() => setHover(null)}
      onPointerDown={(e) => {
        if (!playing || !selectedPieceId) return;
        const cell = cellFromEvent(e);
        if (cell) {
          setHover(cell);
          place();
        }
      }}
    >
      {game.board.map((row, y) =>
        row.map((cell, x) => {
          const key = `${x},${y}`;
          const startOwner = startSet.get(key);
          const cls = ['cell'];
          if (cell === 0) cls.push('cell--p0');
          else if (cell === 1) cls.push('cell--p1');
          else if (startOwner !== undefined) cls.push('cell--start', `cell--start-p${startOwner}`);
          return <div key={key} className={cls.join(' ')} />;
        }),
      )}

      {ghost && (
        <div className="overlay">
          {ghost.cells
            .filter((c) => c.x >= 0 && c.y >= 0 && c.x < size && c.y < size)
            .map((c, i) => (
              <div
                key={i}
                className={`ghost-cell ${ghost.valid ? 'ghost-cell--ok' : 'ghost-cell--bad'}`}
                style={pct(c)}
              />
            ))}
        </div>
      )}

      {lastMove && (
        <div className="overlay" key={game.turn}>
          {lastMove.cells.map((c, i) => (
            <div
              key={i}
              className={`flash-cell flash-cell--p${lastMove.playerIndex}`}
              style={pct(c)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
