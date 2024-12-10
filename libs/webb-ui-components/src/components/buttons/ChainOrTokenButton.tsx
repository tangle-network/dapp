import { ChainIcon, ChevronDown, TokenIcon } from '@webb-tools/icons';
import { getFlexBasic } from '@webb-tools/icons/utils';
import cx from 'classnames';
import { forwardRef, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';
import { ChainOrTokenButtonProps } from './types';
import { EventFor } from '../../types';
import { Typography } from '@webb-tools/webb-ui-components';

const ChainOrTokenButton = forwardRef<
  HTMLButtonElement,
  ChainOrTokenButtonProps
>(
  (
    {
      className,
      value,
      displayValue,
      status,
      textClassName,
      disabled,
      placeholder = 'Select Chain',
      iconType,
      onClick,
      showChevron = true,
      ...props
    },
    ref,
  ) => {
    const IconCmp = iconType === 'chain' ? ChainIcon : TokenIcon;
    const isToken = iconType === 'token';

    const handleClick = useCallback(
      (e: EventFor<'button', 'onClick'>) => {
        if (disabled || onClick === undefined) {
          return;
        }

        onClick(e);
      },
      [disabled, onClick],
    );

    const isClickable = onClick !== undefined && !disabled;

    return (
      <button
        {...props}
        onClick={handleClick}
        type="button"
        className={twMerge(
          'rounded-lg px-4 py-2',
          !isClickable && 'cursor-default',
          // Use a different background for embedded icon buttons
          // for contrast.
          isToken
            ? 'bg-mono-40 dark:bg-mono-170'
            : 'bg-mono-20 dark:bg-mono-180',
          isClickable &&
            (isToken
              ? 'hover:bg-mono-60 hover:dark:bg-mono-160'
              : 'hover:bg-mono-40 hover:dark:bg-mono-170'),
          className,
        )}
        ref={ref}
      >
        <div className="flex items-center justify-between mr-1">
          <div className="flex items-center gap-3 min-w-[120px]">
            {value && (
              <IconCmp
                status={status}
                size="xl"
                spinnerSize="lg"
                className={cx(`shrink-0 grow-0 ${getFlexBasic('xl')}`)}
                name={value}
              />
            )}

            <Typography variant="h5" fw="bold" className={textClassName}>
              {displayValue ?? value ?? placeholder}
            </Typography>
          </div>

          {!disabled && showChevron && (
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
