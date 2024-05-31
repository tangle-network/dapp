import {
  CheckboxCircleLine,
  CloseCircleLineIcon,
  Spinner,
} from '@webb-tools/icons';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { LoadingPillProps } from './types';

const LoadingPill = forwardRef<HTMLButtonElement, LoadingPillProps>(
  ({ className, status = 'loading', ...props }, ref) => {
    return (
      <button
        {...props}
        type="button"
        className={twMerge(
          'rounded-full border-2 py-2 px-4',
          'bg-mono-0/10 border-mono-60',
          'hover:bg-mono-0/30',
          'dark:bg-mono-0/5 dark:border-mono-140',
          'dark:hover:bg-mono-0/10',
          className,
        )}
        ref={ref}
      >
        <div className="flex items-center justify-center">
          {status === 'loading' ? (
            <Spinner size="lg" />
          ) : status === 'success' ? (
            <CheckboxCircleLine
              className="fill-green-70 dark:fill-green-50"
              size="lg"
            />
          ) : (
            status === 'error' && (
              <CloseCircleLineIcon
                className="fill-red-70 dark:fill-red-50"
                size="lg"
              />
            )
          )}
        </div>
      </button>
    );
  },
);

export default LoadingPill;
