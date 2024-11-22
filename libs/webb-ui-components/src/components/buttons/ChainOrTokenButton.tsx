import { ChainIcon, ChevronDown, TokenIcon } from '@webb-tools/icons';
import { getFlexBasic } from '@webb-tools/icons/utils';
import cx from 'classnames';
import { forwardRef, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';
import { ChainOrTokenButtonProps } from './types';
import { EventFor } from '../../types';

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
      onClick,
      ...props
    },
    ref,
  ) => {
    const IconCmp = iconType === 'chain' ? ChainIcon : TokenIcon;

    const handleClick = useCallback(
      (e: EventFor<'button', 'onClick'>) => {
        if (disabled || onClick === undefined) {
          return;
        }

        onClick(e);
      },
      [disabled, onClick],
    );

    return (
      <button
        {...props}
        onClick={handleClick}
        type="button"
        className={twMerge(
          'rounded-lg px-4 py-2',
          'bg-mono-40 dark:bg-mono-170',
          onClick === undefined || disabled
            ? 'cursor-default'
            : 'hover:bg-mono-20 hover:dark:bg-mono-160',
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
            <p className={twMerge('font-bold', textClassName)}>
              {value ?? placeholder}
            </p>
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
