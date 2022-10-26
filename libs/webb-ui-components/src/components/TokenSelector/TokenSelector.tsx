import { TokenIcon } from '../../icons';
import cx from 'classnames';
import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { TokenSelectorProps } from './types';

export const TokenSelector = forwardRef<HTMLButtonElement, TokenSelectorProps>(
  ({ children, className, disabled, isActive, ...props }, ref) => {
    const mergedClsx = useMemo(
      () =>
        twMerge(
          cx(
            'px-3 py-2 flex items-center space-x-2 max-w-fit',
            'bg-mono-0 dark:bg-mono-160',
            'border rounded-lg border-mono-60 dark:border-mono-120',
            'text-mono-120 dark:text-mono-0',
            'hover:bg-mono-20 dark:hover:bg-mono-120',
            'disabled:opacity-50 disabled:pointer-events-none dark:disabled:border-mono-60'
          ),
          className
        ),
      [className]
    );

    const isDisabled = useMemo(() => isActive || disabled, [disabled, isActive]);

    return (
      <button {...props} disabled={isDisabled} className={mergedClsx} ref={ref}>
        <TokenIcon name={children.toLowerCase()} size='lg' />

        <span className='inline-block text-inherit'>{children}</span>
      </button>
    );
  }
);
