import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { TitleWithInfo } from '../TitleWithInfo';
import { InfoItemProps } from './types';

/**
 * The `InfoItem` component
 *
 * Props:
 *
 * - `leftTextProps`: The left text props (props of TitleWithInfo component)
 * - `rightContent`: Right-sided content
 *
 * @example
 *
 * ```jsx
 *   <InfoItem
 *     leftTextProps={{
 *      title: 'Depositing',
 *      variant: 'utility',
 *      info: 'Depositing',
 *     }}
 *    rightContent={amount}
 *  />
 * ```
 */

export const InfoItem = forwardRef<HTMLDivElement, InfoItemProps>(
  ({ className, leftTextProps, rightContent, ...props }, ref) => {
    return (
      <div {...props} className={twMerge('flex items-center justify-between', className)} ref={ref}>
        <TitleWithInfo
          {...leftTextProps}
          className={twMerge('text-mono-140 dark:text-mono-60', leftTextProps.className)}
        />

        {!rightContent ? (
          <Typography variant='body3' fw='bold' className='text-mono-140 dark:text-mono-60'>
            --
          </Typography>
        ) : typeof rightContent === 'string' ? (
          <Typography variant='body3' fw='bold' className='text-mono-140 dark:text-mono-60'>
            {rightContent}
          </Typography>
        ) : null}
      </div>
    );
  }
);
