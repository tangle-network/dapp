import { ChainIcon, ChevronDown } from '@webb-tools/icons';
import { getFlexBasic } from '@webb-tools/icons/utils';
import cx from 'classnames';
import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { ChainButtonProps } from './types';

const ChainButton = forwardRef<HTMLButtonElement, ChainButtonProps>(
  (
    {
      className,
      chain,
      status,
      textClassName,
      disabled,
      placeholder = 'Select Chain',
      ...props
    },
    ref
  ) => {
    const textClsx = useMemo(() => {
      return twMerge('font-bold', textClassName);
    }, [textClassName]);

    return (
      <button
        {...props}
        type="button"
        className={twMerge(
          'rounded-lg border-2 p-2 pl-4',
          'bg-mono-0/10 border-mono-60',
          'hover:bg-mono-0/30',
          'dark:bg-mono-0/5 dark:border-mono-140',
          'dark:hover:bg-mono-0/10',
          className
        )}
        ref={ref}
      >
        <div className="flex items-center gap-1.5 mr-1 justify-between">
          {chain && (
            <ChainIcon
              status={status}
              size="lg"
              className={cx(`shrink-0 grow-0 ${getFlexBasic('lg')}`)}
              name={chain.name}
            />
          )}
          <p className={textClsx}>{chain?.name ?? placeholder}</p>
          {!disabled && (
            <ChevronDown
              size="lg"
              className={cx(`shrink-0 grow-0 ${getFlexBasic('lg')}`)}
            />
          )}
        </div>
      </button>
    );
  }
);

ChainButton.displayName = 'ChainButton';

export default ChainButton;
