import {
  Alert,
  CheckboxCircleLine,
  Close,
  InformationLine,
} from '@webb-tools/icons';
import cx from 'classnames';
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

      case 'error':
      case 'warning': {
        return <Alert size="lg" className="!fill-yellow-70" />;
      }

      default: {
        return (
          <InformationLine
            size="lg"
            className="fill-blue-70 dark:fill-blue-50"
          />
        );
      }
    }
  }, [opts.variant]);

  return (
    <div
      className={cx(
        'p-4 w-[420px] rounded-lg',
        'bg-mono-0 dark:bg-mono-140',
        'flex items-start justify-between',
        'shadow-md'
      )}
    >
      <div className="flex space-x-3">
        <div>{opts.Icon ?? Icon}</div>

        <div className="space-y-1 max-w-[313px] overflow-x-hidden">
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
