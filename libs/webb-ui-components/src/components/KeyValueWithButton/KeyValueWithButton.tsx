'use client';

import { FileCopyLine } from '@webb-tools/icons';
import cx from 'classnames';
import {
  forwardRef,
  useCallback,
  useMemo,
  type MouseEventHandler,
} from 'react';
import { twMerge } from 'tailwind-merge';
import { useCopyable } from '../../hooks/useCopyable';
import { shortenHex } from '../../utils/shortenHex';
import { shortenString } from '../../utils/shortenString';

import { isHex } from 'viem';
import { LabelWithValue } from '../LabelWithValue';
import { Tooltip, TooltipBody, TooltipTrigger } from '../Tooltip';
import { KeyValueWithButtonProps } from './types';

/**
 * The `KeyValueWithButton` component contains the key label and the shortened key hash along with a copy button
 *
 * @example
 *
 * ```jsx
 *  <KeyValueWithButton keyValue='0x958aa9ddbd62f989dec2fd1468bf436aebeb8be6' />
 * ```
 */
export const KeyValueWithButton = forwardRef<
  HTMLDivElement,
  KeyValueWithButtonProps
>(
  (
    {
      className,
      hasShortenValue = true,
      isHiddenLabel,
      keyValue,
      labelVariant,
      size = 'md',
      valueFontWeight,
      valueVariant,
      label = '',
      isDisabledTooltip,
      onCopyButtonClick,
      displayCharCount = 5,
      copyProps,
      ...props
    },
    ref,
  ) => {
    const copyableResult = useCopyable();

    const { copy, isCopied } = useMemo(() => {
      if (copyProps) {
        return copyProps;
      }

      return copyableResult;
    }, [copyProps, copyableResult]);

    const onCopy = useCallback<MouseEventHandler<HTMLButtonElement>>(
      (event) => {
        event.stopPropagation();
        if (isCopied) {
          return;
        }

        copy(keyValue);
      },
      [copy, isCopied, keyValue],
    );

    const mergedClsx = useMemo(() => {
      return twMerge(
        'overflow-hidden rounded-lg',
        size === 'md' ? 'bg-mono-20 dark:bg-mono-160' : '',
        className,
      );
    }, [className, size]);

    const value = useMemo(
      () =>
        hasShortenValue
          ? isHex(keyValue)
            ? shortenHex(keyValue, displayCharCount)
            : shortenString(keyValue, displayCharCount)
          : keyValue,
      [displayCharCount, hasShortenValue, keyValue],
    );

    return (
      <div {...props} className={mergedClsx} ref={ref}>
        <div
          className={cx(
            'flex items-center',
            size === 'md' ? 'space-x-2' : 'space-x-1',
          )}
        >
          <div className={size === 'md' ? 'py-1 pl-3' : ''}>
            <Tooltip>
              <TooltipTrigger
                onClick={
                  typeof onCopyButtonClick === 'function'
                    ? onCopyButtonClick
                    : onCopy
                }
                disabled={isDisabledTooltip}
                asChild
              >
                <LabelWithValue
                  tabIndex={0}
                  labelVariant={labelVariant}
                  valueFontWeight={valueFontWeight}
                  valueVariant={valueVariant}
                  isHiddenLabel={isHiddenLabel}
                  label={label}
                  value={value}
                  className={cx(
                    'cursor-default',
                    isDisabledTooltip
                      ? 'pointer-events-none'
                      : 'pointer-events-auto',
                  )}
                />
              </TooltipTrigger>
              <TooltipBody>{keyValue}</TooltipBody>
            </Tooltip>
          </div>
          <Tooltip isOpen={isCopied}>
            <TooltipTrigger
              className={cx(
                size === 'md'
                  ? 'p-2 bg-blue-10 dark:bg-blue-120 text-blue-70 dark:text-blue-30'
                  : '',
                isCopied ? 'cursor-not-allowed' : '',
              )}
              onClick={
                typeof onCopyButtonClick === 'function'
                  ? onCopyButtonClick
                  : onCopy
              }
            >
              <FileCopyLine className={size === 'md' ? '!fill-current' : ''} />
            </TooltipTrigger>
            <TooltipBody>{isCopied ? 'Copied' : 'Copy'}</TooltipBody>
          </Tooltip>
        </div>
      </div>
    );
  },
);
