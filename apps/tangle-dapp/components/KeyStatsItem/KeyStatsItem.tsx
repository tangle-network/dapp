'use client';

import {
  InfoIconWithTooltip,
  notificationApi,
  SkeletonLoader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, ReactNode, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

export enum KeyStatsItemVariant {
  Left,
  Center,
  Right,
}

export type KeyStatsItemProps = {
  title: string;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
  className?: string;
  showDataBeforeLoading?: boolean;
  children?: ReactNode;
  error: Error | null;
  isLoading: boolean;
  variant?: KeyStatsItemVariant;
};

const KeyStatsItem: FC<KeyStatsItemProps> = ({
  title,
  tooltip,
  className,
  showDataBeforeLoading,
  prefix,
  suffix,
  children,
  error,
  isLoading,
}) => {
  // If present, report errors to the user via a toast
  // notification.
  useEffect(() => {
    if (error !== null) {
      notificationApi({
        variant: 'error',
        message: error.message,
      });
    }
  }, [error]);

  return (
    <div
      className={twMerge(
        'flex flex-col gap-2 justify-center px-2 py-2 md:px-2 lg:px-4',
        className
      )}
    >
      <div className="flex items-center gap-0.5">
        <Typography
          variant="body1"
          className="text-mono-140 dark:text-mono-40 whitespace-nowrap"
        >
          {title}
        </Typography>

        {tooltip !== undefined && <InfoIconWithTooltip content={tooltip} />}
      </div>

      <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
        <div className="flex items-center gap-0.5">
          {isLoading && !showDataBeforeLoading ? (
            <SkeletonLoader className="w-20 h-8" />
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

export default KeyStatsItem;
