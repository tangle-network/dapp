import { ChevronDown, InformationLine } from '@webb-tools/icons';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography/Typography';
import {
  AmountMenu,
  Button,
  Input,
  InputWrapper,
  Label,
  TitleWithInfo,
} from '..';
import { AmountInputComponentProps } from './types';
import { Dropdown, DropdownBody } from '../Dropdown';
import { Trigger as DropdownTrigger } from '@radix-ui/react-dropdown-menu';

export const AmountInput = forwardRef<
  HTMLDivElement,
  AmountInputComponentProps
>(
  (
    {
      amount,
      amountMenuProps,
      className,
      errorMessage,
      id = 'amount',
      info = 'Amount',
      isDisabled: isDisabledProp,
      onAmountChange,
      onMaxBtnClick,
      overrideInputProps,
      title = 'Amount',
      ...props
    },
    ref
  ) => {
    // State to disable the the input when the dropdown is open
    // (to prevent the re-rendering of the dropdown)
    const [isDisabled, setIsDisabled] = useState(false);

    const mergedClsx = useMemo(
      () => twMerge('cursor-auto select-none space-x-2', className),
      [className]
    );

    // The amount menu callback
    const onAmountTypeChange = useCallback(
      (nextVal: 'fixed' | 'custom') => {
        amountMenuProps?.onChange?.(nextVal);
      },
      [amountMenuProps]
    );

    return (
      <>
        <InputWrapper {...props} className={mergedClsx} ref={ref}>
          <div className="flex flex-col space-y-1 grow">
            <Label htmlFor={id} className="flex items-center space-x-2">
              {amountMenuProps ? (
                <Dropdown
                  radixRootProps={{
                    onOpenChange: (open) => setIsDisabled(open),
                    open: isDisabled,
                  }}
                >
                  <DropdownTrigger
                    asChild
                    className="flex items-start space-x-1"
                  >
                    <span className="flex items-center cursor-pointer">
                      <TitleWithInfo
                        title={title}
                        variant="utility"
                        titleComponent="span"
                        className="text-mono-100 dark:text-mono-80"
                        titleClassName="capitalize !text-inherit"
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
              ) : (
                <TitleWithInfo
                  title={title}
                  variant="utility"
                  info={info}
                  titleComponent="span"
                  className="text-mono-100 dark:text-mono-80"
                  titleClassName="capitalize !text-inherit"
                />
              )}
            </Label>

            <Input
              id={id}
              name={id}
              value={amount}
              type="number"
              onChange={onAmountChange}
              placeholder="0"
              size="sm"
              autoComplete="off"
              isDisabled={isDisabledProp || isDisabled}
              min={0}
              {...overrideInputProps}
            />
          </div>

          <Button
            isDisabled={isDisabledProp}
            onClick={onMaxBtnClick}
            variant="utility"
            size="sm"
          >
            Max
          </Button>
        </InputWrapper>

        {errorMessage && (
          <span className="flex items-center text-red-70 dark:text-red-50">
            <InformationLine className="!fill-current mr-1" />
            <Typography variant="body1" fw="bold" className="!text-current">
              {errorMessage}
            </Typography>
          </span>
        )}
      </>
    );
  }
);
