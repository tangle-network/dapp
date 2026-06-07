import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { focus, typeRole } from '../../styles/chrome';

export type ResultColumn<T> = {
  /** Column header rendered above the rows. */
  header: ReactNode;
  /** How to render each cell for this column. */
  render: (item: T, index: number) => ReactNode;
  /** Tailwind class for the column width. Default: `flex-1`. */
  className?: string;
  /** Hide on narrower viewports — used for secondary columns that can fold. */
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl';
};

type Props<T> = {
  items: T[];
  columns: ResultColumn<T>[];
  /** Optional row click handler (entire row becomes clickable). */
  onRowClick?: (item: T, index: number) => void;
  /** Stable key for each row — used as React key + for aria. */
  rowKey: (item: T, index: number) => string;
  className?: string;
};

/**
 * Dense row list — the senior move for catalog pages. Cards are pretty for
 * heterogeneous content but terrible when the operator needs to compare 8
 * inference blueprints by operator count, audit state, and price.
 *
 * The shape is a column-driven table without `<table>` semantics — every row
 * is a flex container so a column can render arbitrary content (status pills,
 * mono numerals, avatars). Hide-below classes let secondary columns fold on
 * narrow viewports without surrendering the primary scan axis.
 */
const HIDE_CLASS: Record<
  NonNullable<ResultColumn<unknown>['hideBelow']>,
  string
> = {
  sm: 'hidden sm:flex',
  md: 'hidden md:flex',
  lg: 'hidden lg:flex',
  xl: 'hidden xl:flex',
};

function ResultList<T>({
  items,
  columns,
  onRowClick,
  rowKey,
  className,
}: Props<T>) {
  return (
    <div
      className={twMerge(
        'overflow-hidden rounded-lg border border-border bg-[color:var(--bg-card)] shadow-[var(--shadow-card)]',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center border-b border-border bg-[color:var(--bg-elevated)]/80 px-4 py-2.5">
        {columns.map((col, i) => (
          <div
            key={i}
            className={twMerge(
              typeRole.label,
              'flex items-center',
              col.className ?? 'flex-1',
              col.hideBelow && HIDE_CLASS[col.hideBelow],
            )}
          >
            {col.header}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div role="list">
        {items.map((item, index) => {
          const key = rowKey(item, index);
          const interactive = onRowClick !== undefined;
          return (
            <div
              key={key}
              role="listitem"
              tabIndex={interactive ? 0 : undefined}
              onClick={interactive ? () => onRowClick(item, index) : undefined}
              onKeyDown={
                interactive
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onRowClick(item, index);
                      }
                    }
                  : undefined
              }
              className={twMerge(
                'flex items-center border-b border-border/60 bg-[color:var(--bg-card)] px-4 py-3.5 text-sm last:border-b-0',
                interactive &&
                  'cursor-pointer transition-colors hover:bg-[color:var(--bg-hover)]',
                interactive && focus.ring,
              )}
            >
              {columns.map((col, i) => (
                <div
                  key={i}
                  className={twMerge(
                    'flex min-w-0 items-center',
                    col.className ?? 'flex-1',
                    col.hideBelow && HIDE_CLASS[col.hideBelow],
                  )}
                >
                  {col.render(item, index)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ResultList;
