import { Transition } from '@headlessui/react';
import { InformationLine } from '@webb-tools/icons';
import cx from 'classnames';
import { FC, useEffect, useState } from 'react';

import { twMerge } from 'tailwind-merge';
import { Button } from '../Button';
import { CheckBox } from '../CheckBox';
import { Tooltip, TooltipBody, TooltipTrigger } from '../Tooltip';
import { AmountInput } from './AmountInput';
import { RefundInputProps } from './types';

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
        >
          {children}
        </CheckBox>

        <Tooltip>
          <TooltipTrigger className="text-center" asChild>
            <span className="cursor-pointer !text-inherit">
              <InformationLine className="!fill-current pointer-events-none" />
            </span>
          </TooltipTrigger>
          <TooltipBody
            title="Refund Support"
            className="max-w-[185px] break-normal"
            button={
              <Button variant="utility" size="sm">
                Learn more
              </Button>
            }
          >
            Once a relayer is added, enable refund to receive native tokens on
            the destination chain for future transactions to preserve privacy.
            Refunds will be sent to the recipient address.
          </TooltipBody>
        </Tooltip>
      </div>

      <Transition
        show={isChecked}
        enter={cx('transition-opacity')}
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave={cx('transition-opacity')}
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <AmountInput
          {...refundAmountInputProps}
          className={refundAmountInputProps.className}
          id={id}
          title={title}
        />
      </Transition>
    </>
  );
};
