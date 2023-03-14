import { InformationLine } from '@webb-tools/icons';
import cx from 'classnames';
import { FC, forwardRef, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

const buttonDescVariantClasses = {
  info: cx('text-mono-100 dark:text-mono-80'),
  error: cx('text-red-70 dark:text-red-50'),
};

import {
  AmountInput,
  BridgeInputGroup,
  Button,
  FixedAmount,
  InfoItem,
  RecipientInput,
  RefundInput,
  RelayerInput,
  Switcher,
  TokenInput,
} from '../../components';
import { Typography } from '../../typography';
import { WithdrawCardProps } from './types';

export const WithdrawCard = forwardRef<HTMLDivElement, WithdrawCardProps>(
  (
    {
      buttonDesc,
      buttonDescVariant = 'info',
      className,
      customAmountInputProps,
      feeAmount,
      feePercentage,
      fixedAmountInputProps,
      isFetchingFee,
      receivedAmount,
      receivedInfo,
      receivedToken,
      recipientInputProps,
      refundAmount,
      refundInputProps,
      refundToken,
      relayerInputProps,
      remainderAmount,
      remainderToken,
      tokenInputProps,
      unwrappingAssetInputProps,
      unwrapSwitcherProps,
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
        setSwitcherChecked(
          unwrapSwitcherProps?.defaultChecked || unwrapSwitcherProps?.checked
        );
      }

      return () => {
        isSub = false;
      };
    }, [unwrapSwitcherProps]);

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

    const feeContent = useMemo(() => {
      if (isFetchingFee) {
        return 'Calculating...';
      }

      if (feeAmount && remainderToken) {
        return `${feeAmount} ${remainderToken}`;
      }

      return feeAmount?.toString();
    }, [feeAmount, isFetchingFee, remainderToken]);

    const receivedContent = useMemo(() => {
      if (!receivedAmount) {
        return undefined;
      }

      if (refundAmount) {
        return `${receivedAmount} ${receivedToken ?? ''} + ${refundAmount} ${
          refundToken ?? ''
        }`;
      }

      return `${receivedAmount} ${receivedToken ?? ''}`;
    }, [receivedAmount, receivedToken, refundAmount, refundToken]);

    return (
      <div
        {...props}
        className={twMerge(
          'flex flex-col justify-between max-w-[518px] w-full',
          className
        )}
        ref={ref}
      >
        <div className="space-y-4">
          <BridgeInputGroup className="flex flex-col space-y-2">
            <div className="flex space-x-2">
              <TokenInput
                {...tokenInputProps}
                className="grow shrink-0 basis-1"
              />
              <TokenInput
                {...unwrappingAssetProps}
                className={cx('grow shrink-0 basis-1', {
                  hidden: !switcherChecked,
                })}
                hidden={!switcherChecked}
              />
            </div>
            <div className="self-end py-1 space-x-2">
              <Typography
                component="span"
                variant="body3"
                fw="bold"
                className="text-mono-100 dark:text-mono-80"
              >
                Unwrap
              </Typography>
              <Switcher {...switcherProps} />
            </div>
            <WithdrawAmountInput
              fixedAmountInputProps={fixedAmountInputProps}
              customAmountInputProps={customAmountInputProps}
            />
          </BridgeInputGroup>
          <BridgeInputGroup className="flex flex-col space-y-2">
            <RelayerInput {...relayerInputProps} />
            <RecipientInput {...recipientInputProps} />
            <RefundInput {...refundInputProps} />
          </BridgeInputGroup>
          {/** Info */}
          <div className="flex flex-col space-y-1">
            <InfoItem
              leftTextProps={{
                title: 'Receiving',
                variant: 'utility',
                info: receivedInfo,
              }}
              rightContent={receivedContent}
            />
            <InfoItem
              leftTextProps={{
                title: 'Remainder',
                variant: 'utility',
              }}
              rightContent={
                remainderAmount
                  ? `${remainderAmount} ${remainderToken}`
                  : undefined
              }
            />
            <InfoItem
              leftTextProps={{
                title: `Fees ${feePercentage ? `(${feePercentage})` : ''}`,
                variant: 'utility',
              }}
              rightContent={feeContent}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Button
            {...withdrawBtnProps}
            isFullWidth
            className={twMerge('justify-center')}
          >
            {withdrawBtnProps?.children ?? 'Withdraw'}
          </Button>

          {buttonDesc && (
            <Typography
              variant="body1"
              fw="semibold"
              className={cx(
                'flex items-center',
                buttonDescVariantClasses[buttonDescVariant]
              )}
            >
              <InformationLine className="!fill-current shrink-0 mr-1" />
              {buttonDesc}
            </Typography>
          )}
        </div>
      </div>
    );
  }
);

/***********************
 * Internal components *
 ***********************/

export const WithdrawAmountInput: FC<
  Pick<WithdrawCardProps, 'fixedAmountInputProps' | 'customAmountInputProps'>
> = ({ customAmountInputProps, fixedAmountInputProps }) => {
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
