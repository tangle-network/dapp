import { forwardRef, useCallback, useEffect, useState } from 'react';
import { InputWrapper } from './InputWrapper';
import { FixedAmountProps } from './types';

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
    {
      id,
      info,
      isDisabled,
      onChange: onChangeProp,
      title = 'Fixed amount',
      value: valueProp,
      step = 0.5,
      min,
      max,
      ...props
    },
    ref
  ) => {
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
        <div className="flex flex-col w-full space-y-2">
          <div className="flex space-x-2"></div>
        </div>
      </InputWrapper>
    );
  }
);
