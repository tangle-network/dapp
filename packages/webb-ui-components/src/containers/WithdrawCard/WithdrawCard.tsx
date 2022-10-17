import {
  AmountInput,
  BridgeInputGroup,
  Button,
  FixedAmount,
  InfoItem,
  RecipientInput,
  RelayerInput,
  ShieldedAssetInput,
  Switcher,
  TokenInput,
} from '@webb-dapp/webb-ui-components/components';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import cx from 'classnames';
import { FC, forwardRef, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { WithdrawCardProps } from './types';

export const WithdrawCard = forwardRef<HTMLDivElement, WithdrawCardProps>(
  (
    {
      bridgeAssetInputProps,
      className,
      customAmountInputProps,
      feeAmount,
      feePercentage,
      fixedAmountInputProps,
      receivedAmount,
      receivedToken,
      recipientInputProps,
      relayerInputProps,
      remainderAmount,
      unwrapSwitcherProps,
      unwrappingAssetInputProps,
      withdrawBtnProps,
      ...props
    },
    ref
  ) => {
    // Internal switcher state
    const [switcherChecked, setSwitcherChecked] = useState(
      () => unwrapSwitcherProps?.defaultChecked || unwrapSwitcherProps?.checked
    );

    // Effect to reset the switcher state when props change
    useEffect(() => {
      let isSub = true;

      if (isSub) {
        setSwitcherChecked(unwrapSwitcherProps?.defaultChecked || unwrapSwitcherProps?.checked);
      }

      return () => {
        isSub = false;
      };
    }, [unwrapSwitcherProps]);

    const bridgeAssetProps = useMemo(
      () => ({
        ...bridgeAssetInputProps,
        title: bridgeAssetInputProps?.title ?? 'Bridging Asset',
        info: bridgeAssetInputProps?.info ?? 'Bridging Asset',
      }),
      [bridgeAssetInputProps]
    );

    const unwrappingAssetProps = useMemo(
      () => ({
        ...unwrappingAssetInputProps,
        title: 'Unwrapping Asset',
        info: 'Unwrapping Asset',
      }),
      [unwrappingAssetInputProps]
    );

    const switcherProps = useMemo<typeof unwrapSwitcherProps>(
      () => ({
        ...unwrapSwitcherProps,
        checked: switcherChecked,
        onCheckedChange: (checked) => {
          unwrapSwitcherProps?.onCheckedChange?.(checked);
          setSwitcherChecked(checked);
        },
      }),
      [switcherChecked, unwrapSwitcherProps]
    );

    return (
      <div {...props} className={twMerge('flex flex-col space-y-4 max-w-[518px]', className)} ref={ref}>
        <BridgeInputGroup className='flex flex-col space-y-2'>
          <div className='flex space-x-2'>
            <ShieldedAssetInput {...bridgeAssetProps} className='grow shrink-0 basis-1' />

            <TokenInput
              {...unwrappingAssetProps}
              className={cx('grow shrink-0 basis-1', { hidden: !switcherChecked })}
              hidden={!switcherChecked}
            />
          </div>

          <div className='self-end py-1 space-x-2'>
            <Typography component='span' variant='body3' fw='bold' className='text-mono-100 dark:text-mono-80'>
              Unwrap
            </Typography>

            <Switcher {...switcherProps} />
          </div>

          <WithdrawAmountInput
            fixedAmountInputProps={fixedAmountInputProps}
            customAmountInputProps={customAmountInputProps}
          />
        </BridgeInputGroup>

        <BridgeInputGroup className='flex flex-col space-y-2'>
          <RelayerInput {...relayerInputProps} />

          <RecipientInput {...recipientInputProps} />
        </BridgeInputGroup>

        {/** Info */}
        <div className='flex flex-col space-y-1'>
          <InfoItem
            leftTextProps={{
              title: 'Receiving',
              variant: 'utility',
              info: 'Receiving',
            }}
            rightContent={receivedAmount ? `${receivedAmount} ${receivedToken}` : undefined}
          />

          <InfoItem
            leftTextProps={{
              title: 'Remainder',
              variant: 'utility',
              info: 'Remainder',
            }}
            rightContent={remainderAmount ? `${remainderAmount} ${receivedToken}` : undefined}
          />

          <InfoItem
            leftTextProps={{
              title: `Fees ${feePercentage ? `(${feePercentage})` : ''}`,
              variant: 'utility',
              info: 'Fees',
            }}
            rightContent={feeAmount ? `${feeAmount} ${receivedToken}` : undefined}
          />
        </div>

        <Button {...withdrawBtnProps} isFullWidth className={twMerge('justify-center')}>
          {withdrawBtnProps?.children ?? 'Withdraw'}
        </Button>
      </div>
    );
  }
);

/***********************
 * Internal components *
 ***********************/

export const WithdrawAmountInput: FC<Pick<WithdrawCardProps, 'fixedAmountInputProps' | 'customAmountInputProps'>> = ({
  customAmountInputProps,
  fixedAmountInputProps,
}) => {
  const [amountType, setAmountType] = useState<'fixed' | 'custom'>('fixed');

  const fixedAmountProps = useMemo<NonNullable<typeof fixedAmountInputProps>>(
    () => ({
      ...fixedAmountInputProps,
      values: fixedAmountInputProps?.values ?? [0.1, 0.25, 0.5, 1],
      amountMenuProps: {
        selected: 'fixed',
        onChange: () => setAmountType('custom'),
      },
    }),
    [fixedAmountInputProps]
  );

  const customAmountProps = useMemo<typeof customAmountInputProps>(
    () => ({
      ...customAmountInputProps,
      amountMenuProps: {
        selected: 'custom',
        onChange: () => setAmountType('fixed'),
      },
    }),
    [customAmountInputProps]
  );

  return (
    <>
      <FixedAmount
        {...fixedAmountProps}
        className={cx({ hidden: amountType !== 'fixed' })}
        hidden={amountType !== 'fixed'}
      />

      <AmountInput
        {...customAmountProps}
        className={cx({ hidden: amountType !== 'custom' })}
        hidden={amountType !== 'custom'}
      />
    </>
  );
};
