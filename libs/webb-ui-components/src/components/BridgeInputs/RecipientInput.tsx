import { forwardRef, useCallback, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { Button } from '../Button';
import { Input } from '../Input';
import { Label } from '../Label';
import { TitleWithInfo } from '../TitleWithInfo';
import { InputWrapper } from './InputWrapper';
import { RecipientInputProps } from './types';

/**
 * The `RecipientInput` component
 *
 * Props:
 *
 * - `value`: The input value
 * - `onChange`: Callback function to control the input value
 *
 * @example
 *
 * ```jsx
 *   <RecipientInput {...recipientInputProps} />
 *  <RecipientInput value={recipient} onChange={(nextVal) => setRecipient(nextVal.toString())} />
 * ```
 */

export const RecipientInput = forwardRef<HTMLDivElement, RecipientInputProps>(
  ({ className, id = 'recipient', info, onChange: onChangeProp, value, ...props }, ref) => {
    const [address, setAddress] = useState<string | undefined>(() => value);

    const onClick = useCallback(async () => {
      const addr = await window.navigator.clipboard.readText();

      setAddress(addr);
    }, [setAddress]);

    const onChange = useCallback(
      (nextVal: string) => {
        setAddress(nextVal.toString());
        onChangeProp?.(nextVal);
      },
      [onChangeProp, setAddress]
    );

    useEffect(() => {
      setAddress(value);
    }, [value, setAddress]);

    return (
      <InputWrapper {...props} className={twMerge('cursor-auto space-x-2', className)} ref={ref}>
        <div className='flex flex-col w-full space-y-1'>
          <Label htmlFor={id}>
            <TitleWithInfo
              title='Recipient'
              info={info}
              variant='body4'
              titleComponent='span'
              className='text-mono-100 dark:text-mono-80'
              titleClassName='uppercase !text-inherit'
            />
          </Label>
          <Input placeholder='Enter recipient wallet address' id={id} size='sm' value={address} onChange={onChange} />
        </div>

        {!address && (
          <Button variant='utility' size='sm' onClick={onClick}>
            Paste
          </Button>
        )}
      </InputWrapper>
    );
  }
);
