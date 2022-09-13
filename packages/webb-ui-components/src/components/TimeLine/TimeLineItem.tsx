import { CheckboxCircleLine, ExternalLinkLine, Spinner } from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { shortenHex } from '@webb-dapp/webb-ui-components/utils';
import { formatDistanceToNow } from 'date-fns';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { LabelWithValue } from '../LabelWithValue';
import { TimeLineItemProps } from './types';

/**
 * The `TimeLineItem`, must use inside `<TimeLine></TimeLine>` component
 *
 * @example
 *
 * ```jsx
 *    <TimeLineItem
 *      title='Proposed'
 *      time={randRecentDate()}
 *      txHash={randEthereumAddress()}
 *      externalUrl='https://webb.tools'
 *    />
 * ```
 */
export const TimeLineItem = forwardRef<HTMLDivElement, TimeLineItemProps>(
  ({ className, externalUrl, extraContent, isLoading, time, title, txHash, ...props }, ref) => {
    return (
      <div {...props} className={twMerge('flex flex-col -ml-3 -mt-0.5 space-y-1', className)} ref={ref}>
        <div className='flex items-center space-x-2'>
          {isLoading ? (
            <Spinner size='lg' className='inline-block rounded-full fill-mono-0 dark:fill-mono-180' />
          ) : (
            <CheckboxCircleLine
              size='lg'
              className='inline-block rounded-full fill-blue dark:fill-blue-30 bg-mono-0 dark:bg-mono-180'
            />
          )}
          <Typography component='span' variant='body1' fw='bold' className='inline-block text-blue dark:text-blue-30'>
            {title}
          </Typography>
          <Typography variant='body4' fw='bold' className='inline-block uppercase'>
            {formatDistanceToNow(time, { addSuffix: true })}
          </Typography>
        </div>

        <div className='flex items-center ml-8 space-x-1'>
          <LabelWithValue labelVariant='body3' label='tx hash:' value={shortenHex(txHash, 3)} valueTooltip={txHash} />
          <a href={externalUrl} target='_blank'>
            <ExternalLinkLine />
          </a>
        </div>

        <div className='ml-8'>{extraContent}</div>
      </div>
    );
  }
);
