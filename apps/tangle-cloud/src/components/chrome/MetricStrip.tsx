import { Skeleton } from '@tangle-network/sandbox-ui/primitives';
import type { FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { chromeHeight, typeRole } from '../../styles/chrome';

export type MetricTone = 'neutral' | 'accent' | 'success' | 'warning';

export type Metric = {
  label: string;
  value: ReactNode;
  sublabel?: ReactNode;
  tone?: MetricTone;
  loading?: boolean;
};

type Props = {
  metrics: Metric[];
  className?: string;
  /** Compact mode renders smaller numerals (used in toolbars). */
  density?: 'default' | 'compact';
};

const TONE_VALUE_CLASS: Record<MetricTone, string> = {
  neutral: 'text-mono-200 dark:text-mono-0',
  accent: 'text-mono-200 dark:text-mono-0',
  success: 'text-[color:var(--md3-tertiary,#10b981)]',
  warning: 'text-[color:var(--md3-warning,#f59e0b)]',
};

const TONE_DOT_CLASS: Record<MetricTone, string> = {
  neutral: 'bg-mono-20 dark:bg-mono-190-foreground/30',
  accent: 'bg-[color:var(--border-accent-hover)]',
  success: 'bg-[color:var(--md3-tertiary,#10b981)]',
  warning: 'bg-[color:var(--md3-warning,#f59e0b)]',
};

/**
 * Compact horizontal strip of 2–4 metrics. **Off by default** on most pages —
 * only opt in where a small dose of context above the content earns its space
 * (the home dashboard, the operator-detail page header). Catalog pages don't
 * get this; the count badge in the toolbar already conveys catalog size.
 *
 * Numerals are mono and tabular so columns align when values change. Each
 * metric is one line; sublabels are demoted to the label tier so the eye
 * tracks values, not adornments.
 */
const MetricStrip: FC<Props> = ({
  metrics,
  className,
  density = 'default',
}) => {
  if (metrics.length === 0) return null;
  const valueSize =
    density === 'compact' ? 'text-lg' : 'text-2xl md:text-[26px]';
  return (
    <div
      className={twMerge(
        chromeHeight.metricStrip,
        'flex flex-wrap items-stretch gap-x-8 gap-y-3 border-b border-mono-60 dark:border-mono-170',
        className,
      )}
      role="group"
      aria-label="Page metrics"
    >
      {metrics.map((metric, i) => {
        const tone = metric.tone ?? 'neutral';
        return (
          <div
            key={`${metric.label}-${i}`}
            className="flex min-w-[140px] flex-col justify-center"
          >
            <div
              className={twMerge(typeRole.label, 'flex items-center gap-1.5')}
            >
              <span
                aria-hidden
                className={twMerge(
                  'inline-block h-1.5 w-1.5 rounded-full',
                  TONE_DOT_CLASS[tone],
                )}
              />
              {metric.label}
            </div>
            {metric.loading ? (
              <Skeleton className="mt-1 h-7 w-20" />
            ) : (
              <div
                className={twMerge(
                  'font-mono font-semibold leading-tight tabular-nums',
                  valueSize,
                  TONE_VALUE_CLASS[tone],
                )}
              >
                {metric.value}
              </div>
            )}
            {metric.sublabel !== undefined && (
              <div className="mt-0.5 text-xs text-mono-100 dark:text-mono-60">
                {metric.sublabel}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MetricStrip;
