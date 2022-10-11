import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { Button, Input, InputWrapper, Label, TitleWithInfo } from '..';
import { AmountInputProps } from './types';

export const AmountInput = forwardRef<HTMLDivElement, AmountInputProps>(
  ({ amount, className, id = 'amount', onAmountChange, onMaxBtnClick, ...props }, ref) => {
    const mergedClsx = useMemo(() => twMerge('cursor-auto', className), [className]);

    return (
      <InputWrapper {...props} className={mergedClsx} ref={ref}>
        <div className='flex flex-col space-y-1'>
          <Label htmlFor={id}>
            <TitleWithInfo
              title='Amount'
              variant='body4'
              titleComponent='span'
              className='text-mono-100 dark:text-mono-80'
              titleClassName='uppercase !text-inherit'
            />
          </Label>

          <Input id={id} name={id} value={amount} onChange={onAmountChange} placeholder='0' size='sm' />
        </div>

        <Button onClick={onMaxBtnClick} variant='utility' size='sm'>
          Max
        </Button>
      </InputWrapper>
    );
  }
);
