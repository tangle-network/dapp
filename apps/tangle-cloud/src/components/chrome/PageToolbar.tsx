import { Search } from '@tangle-network/icons';
import type { FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { chromeHeight, focus, typeRole } from '../../styles/chrome';

type Props = {
  /** Bound to the search input. Required — the toolbar's reason for existing. */
  search: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    /** Auto-focus on mount (use on dedicated catalog pages). */
    autoFocus?: boolean;
  };
  /** Inline filter chips/segments rendered between search and the trailing slot. */
  filters?: ReactNode;
  /** Right-aligned trailing slot — view toggle, "Filters" button, count badge. */
  trailing?: ReactNode;
  /** Optional total/match count, rendered as mono numerals next to search. */
  count?: { matches: number; total: number; noun?: string };
  /** Make the toolbar stick to the top of the page on scroll. Default true. */
  sticky?: boolean;
  className?: string;
};

/**
 * Search + filter + view-toggle row. 44px tall. No card wrapping, no shadow,
 * no `variant="sandbox"` tinted surface — it's a typography-and-controls row
 * over the page background. Sticky by default so the toolbar stays available
 * as the operator scrolls a long catalog.
 *
 * Replaces the per-page filter card (the one that used to consume 320px of
 * vertical space on `/blueprints`). Every list/catalog page in the cloud-app
 * composes this same component so the operator's eye trains on one bar shape.
 */
const PageToolbar: FC<Props> = ({
  search,
  filters,
  trailing,
  count,
  sticky = true,
  className,
}) => {
  return (
    <div
      className={twMerge(
        chromeHeight.toolbar,
        'flex w-full flex-wrap items-center gap-2 rounded-lg border border-border bg-[color:var(--bg-card)] px-2 py-1.5 shadow-[var(--shadow-card)] sm:flex-nowrap sm:gap-3',
        sticky && 'sticky top-16 z-20',
        className,
      )}
    >
      <div className="relative flex min-w-[180px] flex-[1_1_260px] items-center">
        <Search
          className="pointer-events-none absolute left-3 h-4 w-4 fill-current text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={search.value}
          onChange={(event) => search.onChange(event.currentTarget.value)}
          placeholder={search.placeholder}
          autoFocus={search.autoFocus}
          className={twMerge(
            'h-9 w-full rounded-md border border-transparent bg-transparent pl-9 pr-3 font-sans text-sm leading-tight text-foreground not-italic placeholder:text-muted-foreground/70',
            'hover:border-border focus:border-[color:var(--border-accent-hover)]',
            focus.ring,
          )}
        />
      </div>

      {count !== undefined && (
        <span
          className={twMerge(
            typeRole.mono,
            'shrink-0 text-muted-foreground tabular-nums',
          )}
          aria-live="polite"
        >
          {count.matches.toLocaleString()}
          {count.matches !== count.total && (
            <span className="opacity-60">
              {' / '}
              {count.total.toLocaleString()}
            </span>
          )}
          {count.noun !== undefined && (
            <span className="ml-1 opacity-60">{count.noun}</span>
          )}
        </span>
      )}

      {filters !== undefined && (
        <div className="flex shrink-0 items-center gap-2">{filters}</div>
      )}

      {trailing !== undefined && (
        <div className="flex flex-[1_1_100%] flex-wrap items-center justify-start gap-2 sm:flex-none sm:justify-end">
          {trailing}
        </div>
      )}
    </div>
  );
};

export default PageToolbar;
