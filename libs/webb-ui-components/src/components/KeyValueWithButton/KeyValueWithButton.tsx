import { useCopyable } from '../../hooks/useCopyable';
import { FileCopyLine } from '@webb-tools/icons';
import { shortenHex } from '../../utils/shortenHex';
import cx from 'classnames';
import { forwardRef, useCallback, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

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
      shortenFn,
      isDisabledTooltip,
      onCopyButtonClick,
      copyProps,
      ...props
    },
    ref
  ) => {
    const copyableResult = useCopyable();

    const { copy, isCopied } = useMemo(() => {
      if (copyProps) {
        return copyProps;
      }

      return copyableResult;
    }, [copyProps, copyableResult]);

    const onCopy = useCallback(() => {
      if (isCopied) {
        return;
      }

      copy(keyValue);
    }, [copy, isCopied, keyValue]);

    const mergedClsx = useMemo(() => {
      return twMerge(
        'overflow-hidden rounded-lg',
        size === 'md' ? 'bg-mono-20 dark:bg-mono-160' : '',
        className
      );
    }, [className, size]);

    const value = useMemo(
      () =>
        hasShortenValue
          ? shortenFn
            ? shortenFn(keyValue)
            : shortenHex(keyValue, 5)
          : shortenHex(keyValue, 5).replace('0x', ''),
      [hasShortenValue, keyValue, shortenFn]
    );

    return (
      <div {...props} className={mergedClsx} ref={ref}>
        <div
          className={cx(
            'flex items-center',
            size === 'md' ? 'space-x-2' : 'space-x-1'
          )}
        >
          <div className={size === 'md' ? 'py-1 pl-3' : ''}>
            <Tooltip>
              <TooltipTrigger
                onClick={() => copy(keyValue)}
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
                      : 'pointer-events-auto'
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
                isCopied ? 'cursor-not-allowed' : ''
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
  }
);
