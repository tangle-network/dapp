import React, { forwardRef, useCallback, useEffect, useState } from 'react';

import { Button } from '../Button';
import { Label } from '../Label';
import { TitleWithInfo } from '../TitleWithInfo';
import { FixedAmountProps } from './types';
import { InputWrapper } from '.';

export const FixedAmount = forwardRef<HTMLDivElement, FixedAmountProps>(
  ({ id, info, onChange: onChangeProp, value: valueProp, values, ...props }, ref) => {
    const [value, setValue] = useState(() => valueProp);

    const onClick = useCallback(
      (nextVal: number) => {
        setValue(nextVal);
        onChangeProp?.(nextVal);
      },
      [onChangeProp, setValue]
    );

    useEffect(() => {
      setValue(valueProp);
    }, [valueProp]);

    return (
      <InputWrapper {...props} ref={ref}>
        <div className='flex flex-col w-full space-y-2'>
          <Label htmlFor={id}>
            <TitleWithInfo
              title='Fixed amount'
              info={info}
              variant='body4'
              titleComponent='span'
              className='text-mono-100 dark:text-mono-80'
              titleClassName='uppercase !text-inherit'
            />
          </Label>

          <div className='flex space-x-2'>
            {values.map((val, idx) => (
              <div key={`${val}-${idx}`} className='cursor-pointer grow shrink basis-0'>
                <Button
                  isFullWidth
                  size='sm'
                  variant='utility'
                  className='justify-center'
                  isDisabled={value === val}
                  onClick={() => onClick(val)}
                >
                  {val.toFixed(2)}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </InputWrapper>
    );
  }
);
