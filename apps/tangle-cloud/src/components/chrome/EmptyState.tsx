import type { FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { typeRole } from '../../styles/chrome';

export type EmptyKind =
  | 'no-data'
  | 'no-match'
  | 'error'
  | 'loading'
  | 'no-permission'
  | 'no-network';

type Props = {
  kind: EmptyKind;
  /** Display title — defaults are kind-specific and rarely need overriding. */
  title?: string;
  /** Body copy — defaults are kind-specific. */
  description?: ReactNode;
  /** Optional glyph rendered above the title. Falls back to a kind-specific dot. */
  icon?: ReactNode;
  /** Primary action — typically the recovery affordance for `no-match` /
   * `error`, or the onboarding affordance for `no-data`. */
  primary?: ReactNode;
  /** Secondary action — escape hatch, "go back", "view docs". */
  secondary?: ReactNode;
  /** Surrounding container styles. Empty states usually live where the result
   * grid would have rendered, so layout class is the caller's choice. */
  className?: string;
};

const KIND_DEFAULTS: Record<
  EmptyKind,
  { title: string; description: string; dotClass: string; glyph: string }
> = {
  'no-data': {
    title: 'Nothing here yet',
    description: 'There is no data for this view. Get started below.',
    dotClass: 'bg-mono-100',
    glyph: '📭',
  },
  'no-match': {
    title: 'No matches',
    description: 'Try removing a filter or broadening your search.',
    dotClass: 'bg-purple-40',
    glyph: '🔍',
  },
  error: {
    title: 'Something went wrong',
    description: 'The request failed. Retry or refresh the page.',
    dotClass: 'bg-red-500',
    glyph: '⚠️',
  },
  loading: {
    title: 'Loading',
    description: 'Fetching data from the indexer.',
    dotClass: 'bg-mono-100',
    glyph: '⏳',
  },
  'no-permission': {
    title: 'No access',
    description: 'You need additional permissions to view this surface.',
    dotClass: 'bg-amber-50',
    glyph: '🔒',
  },
  'no-network': {
    title: 'Network unavailable',
    description: 'Switch networks or check your wallet connection.',
    dotClass: 'bg-amber-50',
    glyph: '📡',
  },
};

/**
 * Hand-crafted empty states, one per kind. Most cloud-app empties used to read
 * "no X found" with a tiny gray icon — that's slop. This component owns the
 * canonical shape (icon + title + description + primary + secondary) and the
 * kind-specific copy, so a caller writes:
 *
 *   <EmptyState
 *     kind="no-match"
 *     primary={<Button onClick={clearFilters}>Clear filters</Button>}
 *   />
 *
 * and gets recoverable, on-brand chrome. Pages can override `title`/`description`
 * for kind-specific context (e.g. `/operators` no-data: "Register your first
 * operator to get listed here.") but the kind drives the visual language.
 */
const EmptyState: FC<Props> = ({
  kind,
  title,
  description,
  icon,
  primary,
  secondary,
  className,
}) => {
  const defaults = KIND_DEFAULTS[kind];
  const finalTitle = title ?? defaults.title;
  const finalDescription = description ?? defaults.description;
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={twMerge(
        'flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-2xl border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180 p-8 text-center shadow-[0_10px_60px_rgba(17,24,39,0.10)] dark:shadow-[0_14px_70px_rgba(0,0,0,0.45)]',
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-mono-60 dark:border-mono-170 bg-mono-20 dark:bg-mono-190 text-2xl">
        {icon ?? <span aria-hidden>{defaults.glyph}</span>}
      </div>
      <div className="max-w-md space-y-1.5">
        <h2
          className={twMerge(
            typeRole.section,
            'text-mono-200 dark:text-mono-0',
          )}
        >
          {finalTitle}
        </h2>
        <p className="text-sm leading-relaxed text-mono-100 dark:text-mono-80">
          {finalDescription}
        </p>
      </div>
      {(primary !== undefined || secondary !== undefined) && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {primary}
          {secondary}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
