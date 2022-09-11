import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { ChevronDown } from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import cx from 'classnames';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { CollapsibleButtonProps } from './types';

export const CollapsibleButton = forwardRef<HTMLButtonElement, CollapsibleButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <CollapsiblePrimitive.Trigger
        {...props}
        className={twMerge(cx('group flex w-full select-none items-center justify-between px-4 py-2'), className)}
        ref={ref}
      >
        <Typography variant='body1' component='span' fw='bold' className='block'>
          {children}
        </Typography>
        <ChevronDown className='block duration-300 ease-in-out transform group-radix-state-open:rotate-180' />
      </CollapsiblePrimitive.Trigger>
    );
  }
);
