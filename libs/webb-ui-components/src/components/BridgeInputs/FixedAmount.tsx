import { ChevronDown } from '@webb-tools/icons';
import cx from 'classnames';
import { forwardRef, useCallback, useEffect, useState } from 'react';
import { AmountMenu } from '../AmountMenu';
import { Button } from '../Button';
import { Label } from '../Label';
import { TitleWithInfo } from '../TitleWithInfo';
import { InputWrapper } from './InputWrapper';
import { FixedAmountProps } from './types';
import { Dropdown, DropdownBody } from '../Dropdown';
import { Trigger as DropdownTrigger } from '@radix-ui/react-dropdown-menu';

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
      amountMenuProps,
      id,
      info,
      isDisabled,
      onChange: onChangeProp,
      title = 'Fixed amount',
      value: valueProp,
      values,
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

    // The amount menu callback
    const onAmountTypeChange = useCallback(
      (nextVal: 'fixed' | 'custom') => {
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
          <Label htmlFor={id} className="flex items-center space-x-2">
            {amountMenuProps && (
              <Dropdown>
                <DropdownTrigger asChild className="flex items-start space-x-1">
                  <span>
                    <TitleWithInfo
                      title={title}
                      info={info}
                      variant="utility"
                      titleComponent="span"
                      className="text-mono-100 dark:text-mono-80"
                      titleClassName="uppercase !text-inherit"
                    />
                    <ChevronDown />
                  </span>
                </DropdownTrigger>
                <DropdownBody
                  isPorttal={false}
                  align="start"
                  className="z-10 mt-1"
                >
                  <AmountMenu
                    {...amountMenuProps}
                    onChange={onAmountTypeChange}
                  />
                </DropdownBody>
              </Dropdown>
            )}
          </Label>

          <div className="flex space-x-2">
            {values.map((val, idx) => (
              <div
                key={`${val}-${idx}`}
                className="grow shrink basis-0"
              >
                <Button
                  isFullWidth
                  size="md"
                  variant="utility"
                  className={cx(
                    'justify-center',
                    {
                      'disabled:border disabled:border-solid disabled:border-blue-90 dark:disabled:border-blue-30':
                        !isDisabled,
                    },
                    {
                      'disabled:bg-blue-10 dark:disabled:bg-blue-120':
                        !isDisabled,
                    },
                    {
                      'disabled:text-blue-90 dark:disabled:text-blue-30':
                        !isDisabled,
                    }
                  )}
                  isDisabled={isDisabled || value === val}
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
