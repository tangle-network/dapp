import { ChainIcon, ChevronDown, TokenIcon } from '@webb-tools/icons';
import { getFlexBasic } from '@webb-tools/icons/utils';
import cx from 'classnames';
import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { ChainOrTokenButtonProps } from './types';

const ChainOrTokenButton = forwardRef<
  HTMLButtonElement,
  ChainOrTokenButtonProps
>(
  (
    {
      className,
      value,
      status,
      textClassName,
      disabled,
      placeholder = 'Select Chain',
      iconType,
      ...props
    },
    ref,
  ) => {
    const textClsx = useMemo(() => {
      return twMerge('font-bold', textClassName);
    }, [textClassName]);

    const IconCmp = useMemo(() => {
      return iconType === 'chain' ? ChainIcon : TokenIcon;
    }, [iconType]);

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
          className,
        )}
        ref={ref}
      >
        <div className="flex items-center justify-between mr-1">
          <div className="flex items-center gap-2.5">
            {value && (
              <IconCmp
                status={status}
                size="lg"
                className={cx(`shrink-0 grow-0 ${getFlexBasic('lg')}`)}
                name={value}
              />
            )}
            <p className={textClsx}>{value ?? placeholder}</p>
          </div>
          {!disabled && (
            <ChevronDown
              size="lg"
              className={cx(`shrink-0 grow-0 ${getFlexBasic('lg')}`)}
            />
          )}
        </div>
      </button>
    );
  },
);

ChainOrTokenButton.displayName = 'ChainOrTokenButton';

export default ChainOrTokenButton;
