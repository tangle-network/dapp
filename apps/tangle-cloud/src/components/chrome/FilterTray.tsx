import * as Popover from '@radix-ui/react-popover';
import { FilterIcon2 } from '@tangle-network/icons';
import { Button } from '@tangle-network/sandbox-ui/primitives';
import type { FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { chromeHeight, focus, typeRole } from '../../styles/chrome';

type Props = {
  children: ReactNode;
  /** Number of active (non-default) filters. Renders as a badge on the trigger. */
  activeCount?: number;
  /** Callback when the user clicks "Clear all" inside the tray. */
  onClear?: () => void;
  /** Trigger label override (default: "Filters"). */
  label?: string;
  /** Optional title shown at the top of the tray. */
  trayTitle?: string;
};

/**
 * Secondary filters live here, not on the toolbar surface. The toolbar gets a
 * single "Filters" pill with an active-count badge; clicking opens a popover
 * tray with the full set of selects, toggles, and chips.
 *
 * Why a tray instead of inline:
 *   - Most operators don't change filters per session — surfacing 4 dropdowns
 *     permanently was tax on every visit.
 *   - The tray is shared across catalog pages (blueprints, operators, services),
 *     so the operator's muscle memory transfers.
 *
 * Children are arbitrary form controls; this component owns the surface and
 * the "Clear all" affordance, not the filter semantics.
 */
const FilterTray: FC<Props> = ({
  children,
  activeCount = 0,
  onClear,
  label = 'Filters',
  trayTitle,
}) => {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={twMerge(
            'inline-flex h-9 items-center gap-2 rounded-md border border-border bg-muted/30 px-3 font-sans text-sm font-medium text-foreground not-italic transition-colors hover:bg-[color:var(--bg-hover)]',
            focus.ring,
          )}
        >
          <FilterIcon2 className="h-4 w-4 fill-current" />
          <span>{label}</span>
          {activeCount > 0 && (
            <span
              className={twMerge(
                typeRole.mono,
                'flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[color:var(--border-accent)] px-1.5 text-[11px] text-foreground',
              )}
            >
              {activeCount}
            </span>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className={twMerge(
            chromeHeight.tray,
            'z-50 rounded-lg border border-border bg-[color:var(--bg-card)] p-4 shadow-[var(--shadow-dropdown)]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className={typeRole.label}>{trayTitle ?? 'Filters'}</span>
            {onClear && activeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="h-7 px-2 font-sans text-xs not-italic"
              >
                Clear all
              </Button>
            )}
          </div>
          <div className="space-y-4">{children}</div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default FilterTray;
