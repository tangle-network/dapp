import { useCopyable } from '../../hooks';
import { FileCopyLine } from '../../icons';
import { shortenHex } from '../../utils';
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
export const KeyValueWithButton = forwardRef<HTMLDivElement, KeyValueWithButtonProps>(
  (
    { className, hasShortenValue = true, isHiddenLabel, keyValue, labelVariant, size = 'md', valueVariant, ...props },
    ref
  ) => {
    const { copy, isCopied } = useCopyable();

    const onCopy = useCallback(() => {
      if (isCopied) {
        return;
      }

      copy(keyValue);
    }, [copy, isCopied, keyValue]);

    const mergedClsx = useMemo(() => {
      return twMerge('overflow-hidden rounded-lg', size === 'md' ? 'bg-mono-20 dark:bg-mono-180' : '', className);
    }, [className, size]);

    const value = useMemo(() => (hasShortenValue ? shortenHex(keyValue, 3) : keyValue), [hasShortenValue, keyValue]);

    return (
      <div {...props} className={mergedClsx} ref={ref}>
        <div className={cx('flex items-center', size === 'md' ? 'space-x-2' : 'space-x-1')}>
          <div className={size === 'md' ? 'py-1 pl-3' : ''}>
            <Tooltip>
              <TooltipTrigger onClick={() => copy(keyValue)} asChild>
                <LabelWithValue
                  labelVariant={labelVariant}
                  valueVariant={valueVariant}
                  isHiddenLabel={isHiddenLabel}
                  label='Key'
                  value={value}
                  className='cursor-default pointer-events-auto'
                />
              </TooltipTrigger>
              <TooltipBody>{keyValue}</TooltipBody>
            </Tooltip>
          </div>
          <Tooltip>
            <TooltipTrigger
              className={cx(
                size === 'md' ? 'p-2 bg-blue-10 dark:bg-blue-120 text-blue-70 dark:text-blue-30' : '',
                isCopied ? 'cursor-not-allowed' : ''
              )}
              onClick={onCopy}
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
