import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

type Props<T> = {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  /** Tailwind columns spec for sm/md/lg/xl/2xl. Default: responsive 1→2→3→3→4. */
  columns?: string;
  className?: string;
};

/**
 * Tokenized grid surface. Catalog pages compose this with a `renderItem` that
 * returns the card. No card wrapper, no padding — the grid is just layout.
 * Per-item visual treatment lives on the card component the caller passes in.
 *
 * Columns default scale up to four on 2xl viewports — wider catalogs reward
 * higher density, but never more than four cards in a row because card titles
 * become illegible past that.
 */
function ResultGrid<T>({
  items,
  renderItem,
  columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4',
  className,
}: Props<T>) {
  return (
    <div
      className={twMerge(
        'grid gap-4 content-start',
        columns,
        // `content-visibility: auto` lets the browser skip rendering off-screen
        // cards — meaningful on a catalog with hundreds of blueprints.
        '[content-visibility:auto] [contain-intrinsic-size:800px]',
        className,
      )}
    >
      {items.map((item, i) => (
        <div key={i}>{renderItem(item, i)}</div>
      ))}
    </div>
  );
}

export default ResultGrid;
