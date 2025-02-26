import {
  InfoIconWithTooltip,
  notificationApi,
  SkeletonLoader,
  Typography,
} from '@tangle-network/ui-components';
import { FC, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { KeyStatsItemProps } from './types';
import { isPrimitive } from '@tangle-network/dapp-types';

export const KeyStatsItem: FC<KeyStatsItemProps> = ({
  title,
  tooltip,
  className,
  showDataBeforeLoading,
  hideErrorNotification = false,
  prefix,
  suffix,
  children,
  error,
  isLoading,
}) => {
  // If present, report errors to the user via a toast
  // notification.
  useEffect(() => {
    if (error !== null && !hideErrorNotification) {
      notificationApi({
        variant: 'error',
        message: error.message,
      });
    }
  }, [error, hideErrorNotification]);

  return (
    <div
      className={twMerge(
        'flex flex-col gap-2 justify-center px-2 py-2 md:px-2 lg:px-4',
        className,
      )}
    >
      <div className="flex items-center gap-0.5">
        <Typography
          variant="body1"
          className="text-mono-140 dark:text-mono-80 whitespace-nowrap"
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
          ) : isPrimitive(children) ? (
            children === null ? null : (
              <Typography
                variant="h4"
                fw="bold"
                className="text-mono-140 dark:text-mono-40"
              >
                {prefix}

                {children}

                {suffix}
              </Typography>
            )
          ) : (
            <Typography
              variant="h4"
              fw="bold"
              className="text-mono-140 dark:text-mono-40"
            >
              {children}
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
};
