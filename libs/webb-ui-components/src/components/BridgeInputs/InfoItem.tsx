import { Typography } from '../../typography';
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
      <div
        {...props}
        className={twMerge('flex items-center justify-between', className)}
        ref={ref}
      >
        <TitleWithInfo
          {...leftTextProps}
          variant={leftTextProps.variant ?? 'utility'}
          className={twMerge(
            'text-mono-100 dark:text-mono-80',
            leftTextProps.className
          )}
        />

        {!rightContent ? (
          <Typography
            variant="body3"
            fw="bold"
            className="text-mono-180 dark:text-mono-80"
          >
            --
          </Typography>
        ) : typeof rightContent === 'string' ? (
          <Typography
            variant="body3"
            fw="bold"
            className="text-mono-180 dark:text-mono-80"
          >
            {rightContent}
          </Typography>
        ) : null}
      </div>
    );
  }
);
