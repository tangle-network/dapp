import type { FC, ReactNode } from 'react';
import { Skeleton } from '@tangle-network/sandbox-ui/primitives';
import { twMerge } from 'tailwind-merge';

/**
 * Canonical small-tile stat used across hero strips, table headers, blueprint
 * cards, and operator rows. Single source of truth for label + value rhythm,
 * skeleton, and accent variants — replaces the five inline copies that drifted
 * (HeroMetric, BlueprintMetric, OperatorMetric, OperatorSummaryMetric,
 * LaunchFact).
 *
 * Sizes:
 *   - sm  : compact tile (operator row / blueprint card metric strip)
 *   - md  : hero KPI tile (default)
 *   - lg  : page-prime KPI (TVL-style number)
 *
 * Tone:
 *   - default : neutral elevated surface
 *   - accent  : brand-tinted (action-required / featured items)
 *   - success : positive (healthy / operators online)
 *   - warning : needs attention (capacity / pending)
 */
export type StatTone = 'default' | 'accent' | 'success' | 'warning';
export type StatSize = 'sm' | 'md' | 'lg';

export type StatProps = {
  label: string;
  value: ReactNode;
  sublabel?: ReactNode;
  icon?: ReactNode;
  size?: StatSize;
  tone?: StatTone;
  isLoading?: boolean;
  className?: string;
  /**
   * Inline detail rendered next to the value (e.g. "5 / 12" denominator).
   * Smaller, muted, on the same baseline.
   */
  inlineDetail?: ReactNode;
};

const SIZE_STYLES: Record<
  StatSize,
  { container: string; label: string; value: string }
> = {
  sm: {
    container: 'p-2.5',
    label: 'text-[10px]',
    value: 'text-sm',
  },
  md: {
    container: 'p-3',
    label: 'text-[10px]',
    value: 'text-base',
  },
  lg: {
    container: 'p-4',
    label: 'text-xs',
    value: 'text-2xl',
  },
};

const TONE_STYLES: Record<StatTone, string> = {
  default: 'border-border bg-[var(--bg-card)]',
  accent: 'border-[color:var(--border-accent)] bg-[var(--accent-surface-soft)]',
  success: 'border-emerald-500/30 bg-emerald-500/10',
  warning: 'border-amber-500/30 bg-amber-500/10',
};

const VALUE_TONE: Record<StatTone, string> = {
  default: 'text-foreground',
  accent: 'text-foreground',
  success: 'text-emerald-200',
  warning: 'text-amber-200',
};

export const Stat: FC<StatProps> = ({
  label,
  value,
  sublabel,
  icon,
  size = 'md',
  tone = 'default',
  isLoading = false,
  inlineDetail,
  className,
}) => {
  const sizing = SIZE_STYLES[size];
  return (
    <div
      className={twMerge(
        'rounded-md border',
        sizing.container,
        TONE_STYLES[tone],
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        {icon ? (
          <span className="shrink-0 text-muted-foreground [&_svg]:h-3 [&_svg]:w-3">
            {icon}
          </span>
        ) : null}
        <p
          className={twMerge(
            'truncate font-medium text-muted-foreground uppercase tracking-wider',
            sizing.label,
          )}
        >
          {label}
        </p>
      </div>
      {isLoading ? (
        <Skeleton
          className={twMerge(
            'mt-1',
            size === 'lg'
              ? 'h-8 w-32'
              : size === 'md'
                ? 'h-6 w-24'
                : 'h-5 w-20',
          )}
        />
      ) : (
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <p
            className={twMerge(
              'truncate font-display font-extrabold tracking-tight',
              sizing.value,
              VALUE_TONE[tone],
            )}
          >
            {value}
          </p>
          {inlineDetail ? (
            <span className="truncate text-muted-foreground text-xs">
              {inlineDetail}
            </span>
          ) : null}
        </div>
      )}
      {sublabel ? (
        <p className="mt-1 truncate text-muted-foreground text-xs">
          {sublabel}
        </p>
      ) : null}
    </div>
  );
};

Stat.displayName = 'Stat';

/**
 * StatRow — opinionated horizontal cluster of Stats used at the top of pages.
 * Renders a responsive grid that defaults to 2 cols on mobile and N on desktop
 * (N = items.length, capped at 6). Inherits gap + radius from the parent so it
 * drops cleanly into hero panels.
 */
export const StatRow: FC<{
  items: StatProps[];
  className?: string;
}> = ({ items, className }) => {
  const cols = Math.min(items.length, 6);
  const desktopCols: Record<number, string> = {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
    5: 'sm:grid-cols-3 lg:grid-cols-5',
    6: 'sm:grid-cols-3 lg:grid-cols-6',
  };
  return (
    <div
      className={twMerge(
        'grid grid-cols-2 gap-2',
        desktopCols[cols] ?? 'sm:grid-cols-3',
        className,
      )}
    >
      {items.map((item, idx) => (
        <Stat key={`${item.label}-${idx}`} {...item} />
      ))}
    </div>
  );
};

StatRow.displayName = 'StatRow';
