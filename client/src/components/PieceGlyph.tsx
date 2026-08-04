import { memo } from 'react';
import type { Coord } from '@blokus/engine';

interface Props {
  cells: Coord[];
  colorIndex: number;
  /** Target size in px for the piece's larger dimension. */
  box?: number;
}

/** A small SVG rendering of a piece shape, scaled proportionally. Memoized: props are
 *  referentially stable per piece, so it doesn't re-render on unrelated tray state (e.g. tooltip). */
export const PieceGlyph = memo(function PieceGlyph({ cells, colorIndex, box = 44 }: Props) {
  let w = 1;
  let h = 1;
  for (const c of cells) {
    w = Math.max(w, c.x + 1);
    h = Math.max(h, c.y + 1);
  }
  const scale = box / Math.max(w, h);
  const fill = colorIndex === 0 ? 'fill-p0' : 'fill-p1';

  return (
    <svg
      className="block"
      width={w * scale}
      height={h * scale}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
    >
      {cells.map((c, i) => (
        <rect
          key={i}
          x={c.x + 0.06}
          y={c.y + 0.06}
          width={0.88}
          height={0.88}
          rx={0.16}
          className={`glyph-cell ${fill}`}
        />
      ))}
    </svg>
  );
});
