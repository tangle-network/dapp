import {
  InfoIconWithTooltip,
  SkeletonLoader,
  Typography,
} from '@tangle-network/ui-components';
import type { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { StatsItemProps } from './types';

export const StatsItem: FC<StatsItemProps> = ({
  title,
  tooltip,
  className,
  children,
  isError,
}) => {
  return (
    <div className={twMerge('flex flex-col gap-2', className)}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
        <div className="flex items-center gap-0.5">
          {children === null ? (
            <SkeletonLoader className="w-[100px]" size="lg" />
          ) : isError ? (
            'Error'
          ) : (
            <div className="flex items-center gap-2">
              <Typography
                variant="h4"
                fw="bold"
                className="text-mono-140 dark:text-mono-40"
              >
                {children}
              </Typography>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0.5">
        <Typography variant="body1" className="text-mono-140 dark:text-mono-40">
          {title}
        </Typography>

        {tooltip && <InfoIconWithTooltip content={tooltip} />}
      </div>
    </div>
  );
};
