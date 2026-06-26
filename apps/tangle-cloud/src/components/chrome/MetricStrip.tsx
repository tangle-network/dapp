import { Card, CardVariant } from '@tangle-network/ui-components';
import { Typography } from '@tangle-network/ui-components/typography/Typography/Typography';
import type { FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

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
  density?: 'default' | 'compact';
};

const TONE_VALUE: Record<MetricTone, string> = {
  neutral: 'text-mono-200 dark:text-mono-0',
  accent: 'text-mono-200 dark:text-mono-0',
  success: 'text-green-60 dark:text-green-40',
  warning: 'text-yellow-60 dark:text-yellow-40',
};

/**
 * Metrics rendered inside a shared GLASS card — same pattern as the staking
 * dapp's ProtocolStatisticCard and TntBreakdownCard.
 */
const MetricStrip: FC<Props> = ({ metrics, className }) => {
  if (metrics.length === 0) return null;

  return (
    <Card
      variant={CardVariant.GLASS}
      withShadow
      className={twMerge('w-full', className)}
    >
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {metrics.map((metric, i) => {
          const tone = metric.tone ?? 'neutral';
          return (
            <div key={`${metric.label}-${i}`} className="flex flex-col gap-1">
              <Typography
                variant="body2"
                className="text-mono-120 dark:text-mono-100"
              >
                {metric.label}
              </Typography>
              {metric.loading ? (
                <div className="h-7 w-20 animate-pulse rounded bg-mono-40 dark:bg-mono-170" />
              ) : (
                <Typography
                  variant="h4"
                  fw="bold"
                  className={twMerge('tabular-nums', TONE_VALUE[tone])}
                >
                  {metric.value}
                </Typography>
              )}
              {metric.sublabel !== undefined && (
                <Typography
                  variant="body2"
                  className="text-mono-120 dark:text-mono-100"
                >
                  {metric.sublabel}
                </Typography>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default MetricStrip;
