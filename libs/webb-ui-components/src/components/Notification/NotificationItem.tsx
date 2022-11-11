import { Alert, CheckboxCircleLine, Close } from '@webb-tools/icons';
import { FC, useEffect, useMemo } from 'react';
import { Typography } from '../../typography/Typography';
import { NotificationItemProps } from './types';

export const NotificationItem: FC<NotificationItemProps> = ({
  $key,
  opts,
  onUnmount,
  onClose,
}) => {
  useEffect(
    () => () => {
      onUnmount?.($key);
    },
    [$key, onUnmount]
  );

  const Icon = useMemo(() => {
    switch (opts.variant) {
      case 'success': {
        return (
          <CheckboxCircleLine
            size="lg"
            className="fill-green-70 dark:fill-green-30"
          />
        );
      }

      default: {
        return <Alert size="lg" className="!fill-yellow-70" />;
      }
    }
  }, [opts.variant]);

  return (
    <div className="p-4  w-[420px] rounded-lg bg-mono-0 dark:bg-mono-140 flex items-start justify-between">
      <div className="flex space-x-3">
        <div>{Icon}</div>

        <div className="space-y-1 max-w-[313px]">
          {typeof opts.message === 'string' ? (
            <Typography variant="h5" fw="bold">
              {opts.message}
            </Typography>
          ) : (
            opts.message
          )}

          {typeof opts.secondaryMessage === 'string' ? (
            <Typography variant="body1">{opts.secondaryMessage}</Typography>
          ) : (
            opts.secondaryMessage
          )}
        </div>
      </div>

      {/** Close button */}
      <button onClick={onClose}>
        <Close size="lg" />
      </button>
    </div>
  );
};
