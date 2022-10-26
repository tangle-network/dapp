import { Typography } from '../../typography';
import React, { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { Button } from '../Button';
import { CopyWithTooltip } from '../CopyWithTooltip';
import { KeyCardProps } from './types';

/**
 * The `KeyCard` component, uses to display the key with the copy button
 *
 * @example
 *
 * ```jsx
 *  <KeyCard title='Compressed Key:' keyValue='0x026d513cf4e5f0e605a6584322382bd5896d4f0dfdd1e9a7' />
 * ```
 */
export const KeyCard = forwardRef<HTMLDivElement, KeyCardProps>(({ className, keyValue, title, ...props }, ref) => {
  const mergedClsx = useMemo(() => twMerge('max-w-[343px] break-all', className), [className]);
  return (
    <div {...props} className={mergedClsx} ref={ref}>
      {/** Top */}
      <div className='flex items-center justify-between'>
        <Typography variant='utility' className='uppercase'>
          {title}
        </Typography>

        <Button variant='utility' size='sm'>
          <CopyWithTooltip textToCopy={keyValue} isUseSpan />
        </Button>
      </div>

      {/** Bottom */}
      <div className='p-3 mt-4 rounded-md bg-mono-20 dark:bg-mono-160'>
        <Typography variant='mono1'>{keyValue}</Typography>
      </div>
    </div>
  );
});
