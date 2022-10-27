import { InformationLine } from '@webb-tools/icons';
import { Typography } from '../../typography';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { Button, Chip, Divider } from '../';
import { AmountMenuProps } from './types';

/**
 * The Webb AmountMenu Component
 *
 * Props:
 *
 * - `selected`: Represents the selected value - 'fixed' | 'custom';
 * - `onChange`: Callback when user hits change input button
 *
 * @example
 *
 * ```jsx
 *  <AmountMenu {...amountMenuProps} onChange={onAmountTypeChange} />
 * ```
 */

export const AmountMenu = forwardRef<HTMLDivElement, AmountMenuProps>(
  ({ className, onChange, selected, ...props }, ref) => {
    return (
      <div {...props} className={twMerge('flex flex-col p-2 space-y-2', className)} ref={ref}>
        <div>
          <Button
            variant='link'
            className='inline-block mr-2'
            isDisabled={selected === 'fixed'}
            onClick={() => onChange?.('fixed')}
          >
            Fixed Amount
          </Button>
          <Chip color='purple'>Max privacy</Chip>
        </div>

        <Button variant='link' isDisabled={selected === 'custom'} onClick={() => onChange?.('custom')}>
          Custom Amount
        </Button>

        <Divider className='bg-mono-40 dark:bg-mono-140' />

        {/** Disclaimer */}
        <div>
          <Typography variant='body3' fw='bold' className='flex items-center mb-2'>
            <InformationLine className='inline-block mr-1' /> Withrawals Impact Privacy
          </Typography>

          <Typography variant='body4' className='max-w-[253px]'>
            Using fixed amounts maximizes your privacy, making it harder for address to be statistically linked. Learn
            more here.
          </Typography>
        </div>
      </div>
    );
  }
);
