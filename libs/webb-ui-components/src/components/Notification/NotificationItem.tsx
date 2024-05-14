import {
  Alert,
  CheckboxCircleLine,
  Close,
  InformationLine,
} from '@webb-tools/icons';
import {
  SnackbarContent,
  closeSnackbar,
  type CustomContentProps,
} from 'notistack';
import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography/Typography/index.js';

interface Props extends CustomContentProps {
  Icon?: JSX.Element;
  secondaryMessage?: JSX.Element | string;
}

export const NotificationItem = forwardRef<HTMLDivElement, Props>(
  (props, ref) => {
    const { id, message, Icon, secondaryMessage, style, variant, className } =
      props;

    const DefaultIcon = useMemo(() => {
      switch (variant) {
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
    }, [variant]);

    return (
      <SnackbarContent
        ref={ref}
        role="alert"
        style={style}
        className={twMerge(
          'p-4 w-[420px] rounded-lg',
          'bg-mono-0 dark:bg-mono-140',
          'flex items-start justify-between',
          'shadow-md',
          className
        )}
      >
        <div className="flex space-x-3">
          <div className="pt-0.5">{Icon ?? DefaultIcon}</div>

          <div className="space-y-1 max-w-[313px] overflow-x-hidden">
            {typeof message === 'string' ? (
              <Typography variant="h5" fw="bold">
                {message}
              </Typography>
            ) : (
              message
            )}

            {typeof secondaryMessage === 'string' ? (
              <Typography variant="body1">{secondaryMessage}</Typography>
            ) : (
              secondaryMessage
            )}
          </div>
        </div>

        {/** Close button */}
        <button onClick={() => closeSnackbar(id)}>
          <Close size="lg" />
        </button>
      </SnackbarContent>
    );
  }
);
