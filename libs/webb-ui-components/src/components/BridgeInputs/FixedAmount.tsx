import { ChevronDown } from '@webb-tools/icons';
import { forwardRef, useCallback, useEffect, useState } from 'react';

import { AmountMenu } from '../AmountMenu';
import { Button } from '../Button';
import { Label } from '../Label';
import { TitleWithInfo } from '../TitleWithInfo';
import { Tooltip, TooltipBody, TooltipTrigger } from '../Tooltip';
import { FixedAmountProps } from './types';
import { InputWrapper } from './InputWrapper';

/**
 * The `FixedAmount` component
 *
 * Props:
 *
 * - `id`: The `id` prop for label and input (defaults to "amount")
 * - `values`:  The fixed number list to display
 * - `value`: The value prop
 * - `onChange`: The callback function to control the component
 * - `amountMenuProps`: The amount menu props to pass into the AmountMenu component
 *
 * @example
 *
 * ```jsx
 * <FixedAmount info='Fix amount' values={values} value={value} onChange={(nextVal) => setValue(nextVal)} />
 * <FixedAmount {...fixedAmountProps} className={cx({ hidden: amountType !== 'fixed' })} hidden={amountType !== 'fixed'} />
 * ```
 */

export const FixedAmount = forwardRef<HTMLDivElement, FixedAmountProps>(
  (
    { amountMenuProps, id, info, onChange: onChangeProp, title = 'Fixed amount', value: valueProp, values, ...props },
    ref
  ) => {
    const [value, setValue] = useState(() => valueProp);

    // Tooltip state
    const [isOpen, setIsOpen] = useState(false);

    const onClick = useCallback(
      (nextVal: number) => {
        setValue(nextVal);
        onChangeProp?.(nextVal);
      },
      [onChangeProp, setValue]
    );

    // The amount menu callback
    const onAmountTypeChange = useCallback(
      (nextVal: 'fixed' | 'custom') => {
        setIsOpen(false);
        amountMenuProps?.onChange?.(nextVal);
      },
      [amountMenuProps]
    );    

    useEffect(() => {
      setValue(valueProp);
    }, [valueProp]);

    return (
      <InputWrapper {...props} ref={ref}>
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor={id} className='flex items-center space-x-2'>
            <TitleWithInfo
              title={title}
              info={info}
              variant="body4"
              titleComponent="span"
              className="text-mono-100 dark:text-mono-80"
              titleClassName="uppercase !text-inherit"
            />
            {amountMenuProps && (
              <Tooltip isOpen={isOpen} onChange={(next) => setIsOpen(next)}>
                <TooltipTrigger>
                  <ChevronDown />
                </TooltipTrigger>

                <TooltipBody>
                  <AmountMenu {...amountMenuProps} onChange={onAmountTypeChange} />
                </TooltipBody>
              </Tooltip>
            )}
          </Label>

          <div className="flex space-x-2">
            {values.map((val, idx) => (
              <div
                key={`${val}-${idx}`}
                className="cursor-pointer grow shrink basis-0"
              >
                <Button
                  isFullWidth
                  size="sm"
                  variant="utility"
                  className="justify-center"
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
