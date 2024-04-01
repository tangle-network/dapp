import {
  notificationApi,
  SkeletonLoader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, ReactNode, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import { InfoIconWithTooltip } from '../InfoIconWithTooltip';

export type KeyStatsItemProps2 = {
  title: string;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
  className?: string;
  children?: ReactNode;
  error: Error | null;
  isLoading: boolean;
};

const KeyStatsItem2: FC<KeyStatsItemProps2> = ({
  title,
  tooltip,
  className,
  prefix,
  suffix,
  children,
  error,
  isLoading,
}) => {
  // If present, report errors to the user via a
  // toast notification.
  useEffect(() => {
    if (error !== null) {
      notificationApi({
        variant: 'error',
        message: error.message,
      });
    }
  }, [error]);

  return (
    <div className={twMerge('px-2 py-2 space-y-2 md:px-2 lg:px-4', className)}>
      <div className="flex items-center gap-0.5">
        <Typography variant="body1" className="text-mono-140 dark:text-mono-40">
          {title}
        </Typography>

        {tooltip !== undefined && <InfoIconWithTooltip content={tooltip} />}
      </div>

      <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
        <div className="flex items-center gap-0.5">
          {isLoading ? (
            <SkeletonLoader className="w-[80px]" size="lg" />
          ) : error !== null ? (
            'Error'
          ) : children === null ? null : (
            <>
              <Typography
                variant="h4"
                fw="bold"
                className="text-mono-140 dark:text-mono-40"
              >
                {prefix}

                {children}

                {suffix}
              </Typography>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default KeyStatsItem2;
