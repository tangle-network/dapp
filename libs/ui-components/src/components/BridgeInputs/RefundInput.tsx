'use client';

import { ComponentProps, FC, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { CheckBox } from '../CheckBox';
import { AmountInput } from './AmountInput';
import { RefundInputProps } from './types';

const defaultInfo: ComponentProps<typeof CheckBox>['info'] = {
  title: 'Refund Support',
  content:
    'Once a relayer is added, enable refund to receive native tokens on the destination chain for future transactions to preserve privacy. Refunds will be sent to the recipient address.',
  // TODO: update this link
  // buttonProps: {
  //   target: '_blank',
  // },
};

export const RefundInput: FC<RefundInputProps> = ({
  refundCheckboxProps: {
    wrapperClassName,
    children = 'Refund tx tokens',
    defaultChecked = false,
    isChecked: isCheckedProp = false,
    onChange,
    ...refundCheckboxProps
  } = {},
  refundAmountInputProps: {
    id = 'refund-amount',
    title = 'Refund Amount',
    ...refundAmountInputProps
  } = {},
}) => {
  const [isChecked, setIsChecked] = useState(defaultChecked ?? isCheckedProp);

  useEffect(() => {
    if (isCheckedProp !== undefined) {
      setIsChecked(isCheckedProp);
    }
  }, [isCheckedProp]);

  return (
    <>
      <div className="flex items-center self-end space-x-1">
        <CheckBox
          {...refundCheckboxProps}
          isChecked={isChecked}
          onChange={(eve) => {
            setIsChecked((prev) => !prev);
            onChange?.(eve);
          }}
          wrapperClassName={twMerge(wrapperClassName, 'items-center')}
          info={defaultInfo}
        >
          {children}
        </CheckBox>
      </div>

      {isChecked && (
        <AmountInput
          {...refundAmountInputProps}
          className={twMerge(
            'animate-in fade-in-0 animate-out fade-out-0',
            refundAmountInputProps.className,
          )}
          id={id}
          title={title}
        />
      )}
    </>
  );
};
