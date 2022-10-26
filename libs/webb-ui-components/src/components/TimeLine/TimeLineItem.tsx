import { CheckboxCircleLine, ExternalLinkLine, Spinner } from '../../icons';
import { Typography } from '../../typography';
import { shortenHex } from '../../utils';
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
 *
 *    <TimeLineItem
 *      title='Signed'
 *      time={randRecentDate()}
 *      txHash={randEthereumAddress()}
 *      externalUrl='https://webb.tools'
 *      extraContent={
 *        <div className='flex items-center space-x-2'>
 *          <KeyValueWithButton keyValue={randEthereumAddress()} size='sm' />
 *          <Button variant='link' size='sm' className='uppercase'>
 *            Detail
 *          </Button>
 *        </div>
 *       }
 *     />
 *
 *    <TimeLineItem
 *      title='Key Rotated'
 *      time={randRecentDate()}
 *      txHash={randEthereumAddress()}
 *      externalUrl='https://webb.tools'
 *      extraContent={
 *        <div className='flex items-center space-x-4'>
 *          <LabelWithValue label='Height' value={1000654} />
 *          <LabelWithValue label='Proposal' value='KeyRotation' />
 *          <LabelWithValue
 *            label='Proposers'
 *            value={
 *              <AvatarGroup total={randNumber({ min: 10, max: 20 })}>
 *                {Object.values(keygen.authorities).map((au) => (
 *                   <Avatar key={au.id} src={au.avatarUrl} alt={au.id} />
 *                ))}
 *              </AvatarGroup>
 *            }
 *          />
 *          <Button size='sm' variant='link' className='uppercase'>
 *            Details
 *          </Button>
 *        </div>
 *      }
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
          <Typography variant='utility' className='inline-block uppercase'>
            {formatDistanceToNow(time, { addSuffix: true })}
          </Typography>
        </div>

        {txHash && (
          <div className='flex items-center ml-8 space-x-1'>
            <LabelWithValue labelVariant='body3' label='tx hash:' value={shortenHex(txHash, 3)} valueTooltip={txHash} />
            <a href={externalUrl} target='_blank' rel='noopener noreferrer'>
              <ExternalLinkLine />
            </a>
          </div>
        )}

        <div className='ml-8'>{extraContent}</div>
      </div>
    );
  }
);
