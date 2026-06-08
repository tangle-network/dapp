import type { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { focus } from '../../styles/chrome';

// Inline SVGs — @tangle-network/icons ships GridFillIcon but no matching
// list-view icon. Tiny inline SVG is cheaper than adding an icon entry that
// only the view toggle uses.
const GridIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" />
  </svg>
);

const ListIconLocal: FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path d="M3 5h18v3H3V5zm0 5h18v3H3v-3zm0 5h18v3H3v-3z" />
  </svg>
);

export type ResultView = 'grid' | 'list';

type Props = {
  value: ResultView;
  onChange: (view: ResultView) => void;
  className?: string;
};

/**
 * Two-mode segmented control for switching catalog views between cards (grid)
 * and dense rows (list). Lives in the toolbar `trailing` slot. The list view
 * is the senior move — operators comparing N similar items scan rows faster
 * than cards.
 */
const ViewToggle: FC<Props> = ({ value, onChange, className }) => {
  return (
    <div
      role="radiogroup"
      aria-label="View"
      className={twMerge(
        'inline-flex h-9 items-center rounded-md border border-border bg-muted/30 p-0.5',
        className,
      )}
    >
      <ViewButton
        kind="grid"
        active={value === 'grid'}
        onClick={() => onChange('grid')}
      />
      <ViewButton
        kind="list"
        active={value === 'list'}
        onClick={() => onChange('list')}
      />
    </div>
  );
};

const ViewButton: FC<{
  kind: ResultView;
  active: boolean;
  onClick: () => void;
}> = ({ kind, active, onClick }) => {
  const Icon = kind === 'grid' ? GridIcon : ListIconLocal;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      title={kind === 'grid' ? 'Grid view' : 'List view'}
      className={twMerge(
        'inline-flex h-7 w-8 items-center justify-center rounded font-sans not-italic transition-colors',
        active
          ? 'bg-[color:var(--bg-hover)] text-foreground'
          : 'text-muted-foreground hover:text-foreground',
        focus.ring,
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">
        {kind === 'grid' ? 'Grid view' : 'List view'}
      </span>
    </button>
  );
};

export default ViewToggle;
