import { ChainIcon, ChevronDown } from '@webb-tools/icons';
import { getFlexBasic } from '@webb-tools/icons/utils';
import cx from 'classnames';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { ChainButtonProps } from './types';

const ChainButton = forwardRef<HTMLButtonElement, ChainButtonProps>(
  ({ className, chain, status, ...props }, ref) => {
    // Get last word of chain name to prevent long names from overflowing
    const shortName = chain.name.split(' ').pop() ?? 'Unknown';

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
        <div className="flex items-center gap-1">
          <ChainIcon
            status={status}
            size="lg"
            className={cx(`shrink-0 grow-0 ${getFlexBasic('lg')}`)}
            name={chain.name}
          />
          <p>{shortName}</p>
          <ChevronDown
            size="lg"
            className={cx(`shrink-0 grow-0 ${getFlexBasic('lg')}`)}
          />
        </div>
      </button>
    );
  }
);

ChainButton.displayName = 'ChainButton';

export default ChainButton;
