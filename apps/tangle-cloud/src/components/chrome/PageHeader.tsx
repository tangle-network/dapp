import { Typography } from '@tangle-network/ui-components/typography/Typography/Typography';
import type { FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

type Density = 'compact' | 'default' | 'hero';

type Props = {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  eyebrow?: ReactNode;
  density?: Density;
  className?: string;
};

/**
 * Minimal page header — matches the staking dapp's pattern of using
 * Typography h4 for headings. No density system, no custom type roles.
 */
const PageHeader: FC<Props> = ({
  title,
  subtitle,
  action,
  eyebrow: _eyebrow,
  density: _density,
  className,
}) => {
  return (
    <div
      className={twMerge(
        'flex flex-col gap-3 md:flex-row md:items-center md:justify-between',
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <Typography variant="h4" fw="bold">
          {title}
        </Typography>
        {subtitle !== undefined && (
          <p className="max-w-2xl text-sm leading-relaxed text-mono-120 dark:text-mono-100">
            {subtitle}
          </p>
        )}
      </div>
      {action !== undefined && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
