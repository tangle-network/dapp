import { useCopyable } from '../../hooks';
import { FileCopyLine } from '@webb-tools/icons';
import { shortenHex } from '../../utils';
import cx from 'classnames';
import { forwardRef, useCallback, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { LabelWithValue } from '../LabelWithValue';
import { Tooltip, TooltipBody, TooltipTrigger } from '../Tooltip';
import { KeyValueWithButtonProps } from './types';
import { Button } from '@webb-tools/webb-ui-components/components';

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
      isHiddenValue,
      size = 'md',
      valueVariant,
      shortenFn,
      copyProps,
      ...props
    },
    ref
  ) => {
    const localCopyProps = useCopyable();
    const { copy, isCopied } = useMemo(
      () => copyProps || localCopyProps,
      [copyProps, localCopyProps]
    );

    const onCopy = useCallback(() => {
      if (isCopied) {
        return;
      }

      copy(keyValue);
    }, [copy, isCopied, keyValue]);

    const mergedClsx = useMemo(() => {
      return twMerge(
        'overflow-hidden rounded-lg',
        size === 'md' ? 'bg-mono-20 dark:bg-mono-180' : '',
        className
      );
    }, [className, size]);

    const value = useMemo(
      () =>
        hasShortenValue
          ? shortenFn
            ? shortenFn(keyValue)
            : shortenHex(keyValue, 3)
          : keyValue,
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
          {isHiddenValue ? null : (
            <div className={size === 'md' ? 'py-1 pl-3' : ''}>
              <Tooltip>
                <TooltipTrigger onClick={() => copy(keyValue)} asChild>
                  <LabelWithValue
                    labelVariant={labelVariant}
                    valueVariant={valueVariant}
                    isHiddenLabel={isHiddenLabel}
                    label="Key"
                    value={value}
                    className="cursor-default pointer-events-auto"
                  />
                </TooltipTrigger>
                <TooltipBody>{keyValue}</TooltipBody>
              </Tooltip>
            </div>
          )}
          <Tooltip isOpen={isCopied}>
            <TooltipTrigger
              className={cx(
                size === 'md'
                  ? 'bg-blue-10 dark:bg-blue-120 text-blue-70 dark:text-blue-30'
                  : '',
                isCopied ? 'cursor-not-allowed' : ''
              )}
              onClick={onCopy}
            >
              <Button variant="utility" size="sm" className="p-2">
                <FileCopyLine
                  className={size === 'md' ? '!fill-current' : ''}
                />
              </Button>
            </TooltipTrigger>
            <TooltipBody>{isCopied ? 'Copied' : 'Copy'}</TooltipBody>
          </Tooltip>
        </div>
      </div>
    );
  }
);
