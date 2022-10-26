import { useCopyable } from '../../hooks';
import { FileCopyLine } from '../../icons';
import cx from 'classnames';
import { useCallback } from 'react';
import { twMerge } from 'tailwind-merge';

import { Tooltip, TooltipBody, TooltipTrigger } from '../Tooltip';
import { CopyWithTooltipProps } from './types';

/**
 * The `CopyWithTooltip` component
 *
 * @example
 *
 * ```jsx
 *  <CopyWithTooltip textToCopy="0x026d513cf4e5f0e605a6584322382bd5896d4f0dfdd1e9a7" />
 *  <CopyWithTooltip isUseSpan textToCopy="0x026d513cf4e5f0e605a6584322382bd5896d4f0dfdd1e9a7" />
 * ```
 */
export const CopyWithTooltip: React.FC<CopyWithTooltipProps> = ({ className, isUseSpan, textToCopy }) => {
  const { copy, isCopied } = useCopyable();

  const onCopy = useCallback(() => {
    if (isCopied) {
      return;
    }

    copy(textToCopy);
  }, [copy, isCopied, textToCopy]);

  return (
    <Tooltip>
      <TooltipTrigger
        className={twMerge(
          cx('bg-blue-10 dark:bg-blue-120 text-blue-70 dark:text-blue-30', isCopied ? 'cursor-not-allowed' : ''),
          className
        )}
        onClick={onCopy}
        asChild={isUseSpan}
      >
        {isUseSpan ? (
          <span className='!text-inherit'>
            <FileCopyLine className='!fill-current' />
          </span>
        ) : (
          <FileCopyLine className='!fill-current' />
        )}
      </TooltipTrigger>
      <TooltipBody>{isCopied ? 'Copied' : 'Copy'}</TooltipBody>
    </Tooltip>
  );
};
