'use client';

import { InformationLine } from '@webb-tools/icons';
import cx from 'classnames';
import { FC, forwardRef, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
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
  ConnectWalletMobileButton,
} from '../../components';
import { useCheckMobile } from '../../hooks';
import { Typography } from '../../typography';
import { WithdrawCardProps } from './types';

const buttonDescVariantClasses = {
  info: cx('text-mono-100 dark:text-mono-80'),
  error: cx('text-red-70 dark:text-red-50'),
};

export const WithdrawCard = forwardRef<HTMLDivElement, WithdrawCardProps>(
  (
    {
      buttonDesc,
      buttonDescVariant = 'info',
      className,
      customAmountInputProps,
      fixedAmountInputProps,
      infoItemProps,
      recipientInputProps,
      refundInputProps,
      relayerInputProps,
      tokenInputProps,
      unwrappingAssetInputProps,
      unwrapSwitcherProps,
      withdrawBtnProps,
      ...props
    },
    ref,
  ) => {
    const { isMobile } = useCheckMobile();
    // Internal switcher state
    const [switcherChecked, setSwitcherChecked] = useState(
      () => unwrapSwitcherProps?.defaultChecked || unwrapSwitcherProps?.checked,
    );

    // Effect to reset the switcher state when props change
    useEffect(() => {
      let isSub = true;

      if (isSub) {
        setSwitcherChecked(
          unwrapSwitcherProps?.defaultChecked || unwrapSwitcherProps?.checked,
        );
      }

      return () => {
        isSub = false;
      };
    }, [unwrapSwitcherProps]);

    const unwrappingAssetProps = useMemo(
      () => ({
        ...unwrappingAssetInputProps,
        title: 'Unwrap Token',
      }),
      [unwrappingAssetInputProps],
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
      [switcherChecked, unwrapSwitcherProps],
    );

    return (
      <div
        {...props}
        className={twMerge(
          'flex flex-col justify-between max-w-[518px] w-full h-full',
          className,
        )}
        ref={ref}
      >
        <div className="space-y-4">
          <BridgeInputGroup className="flex flex-col space-y-2">
            <div className="flex space-x-2">
              <TokenInput
                {...tokenInputProps}
                title="Shielded Pool"
                info="Shielded pools hold shielded cryptocurrency and are used to maintain privacy of the transaction."
                className="grow shrink-0 basis-1"
              />
              <TokenInput
                {...unwrappingAssetProps}
                title="Token"
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
          {infoItemProps && (
            <div className="flex flex-col space-y-1">
              {infoItemProps.map((itemProps, index) => (
                <InfoItem key={index} {...itemProps} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {!isMobile ? (
            <Button
              {...withdrawBtnProps}
              isFullWidth
              className={twMerge(
                'flex justify-center',
                withdrawBtnProps?.className,
              )}
            >
              {withdrawBtnProps?.children ?? 'Withdraw'}
            </Button>
          ) : (
            <ConnectWalletMobileButton isFullWidth />
          )}

          {buttonDesc && (
            <Typography
              variant="body1"
              fw="semibold"
              className={cx(
                'flex items-center',
                buttonDescVariantClasses[buttonDescVariant],
              )}
            >
              <InformationLine className="!fill-current shrink-0 mr-1" />
              {buttonDesc}
            </Typography>
          )}
        </div>
      </div>
    );
  },
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
    [fixedAmountInputProps],
  );

  const customAmountProps = useMemo<typeof customAmountInputProps>(
    () => ({
      ...customAmountInputProps,
      amountMenuProps: {
        selected: 'custom',
        onChange: () => setAmountType('fixed'),
      },
    }),
    [customAmountInputProps],
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
