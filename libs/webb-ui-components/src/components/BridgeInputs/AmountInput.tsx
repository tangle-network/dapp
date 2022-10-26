import { ChevronDown } from '../../icons';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  AmountMenu,
  Button,
  Input,
  InputWrapper,
  Label,
  TitleWithInfo,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '..';
import { AmountInputProps } from './types';

export const AmountInput = forwardRef<HTMLDivElement, AmountInputProps>(
  (
    {
      amount,
      amountMenuProps,
      className,
      id = 'amount',
      info,
      onAmountChange,
      onMaxBtnClick,
      title = 'Amount',
      ...props
    },
    ref
  ) => {
    const mergedClsx = useMemo(() => twMerge('cursor-auto select-none space-x-2', className), [className]);

    // Tooltip state
    const [isOpen, setIsOpen] = useState(false);

    // The amount menu callback
    const onAmountTypeChange = useCallback(
      (nextVal: 'fixed' | 'custom') => {
        setIsOpen(false);
        amountMenuProps?.onChange?.(nextVal);
      },
      [amountMenuProps]
    );

    return (
      <InputWrapper {...props} className={mergedClsx} ref={ref}>
        <div className="flex flex-col space-y-1 grow">
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

          <Input
            id={id}
            name={id}
            value={amount}
            onChange={onAmountChange}
            placeholder="0"
            size="sm"
          />
        </div>

        <Button onClick={onMaxBtnClick} variant="utility" size="sm">
          Max
        </Button>
      </InputWrapper>
    );
  }
);
