import { useCopyable } from '@webb-dapp/webb-ui-components/hooks';
import { FileCopyLine } from '@webb-dapp/webb-ui-components/icons';
import cx from 'classnames';
import { useCallback } from 'react';
import { twMerge } from 'tailwind-merge';

import { Tooltip, TooltipBody, TooltipTrigger } from '../Tooltip';
import { CopyWithTooltipProps } from './types';

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
