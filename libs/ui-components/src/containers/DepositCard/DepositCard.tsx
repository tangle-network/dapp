import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography';

import {
  AmountInput,
  BridgeInputGroup,
  Button,
  ChainInput,
  InfoItem,
  TokenInput,
} from '../../components';
import { getRoundedAmountString } from '../../utils';
import { DepositCardProps } from './types';
import { EMPTY_VALUE_PLACEHOLDER } from '../../constants';

export const DepositCard = forwardRef<HTMLDivElement, DepositCardProps>(
  (
    {
      amountInputProps = {},
      bridgingTokenProps,
      buttonProps = {},
      className,
      destChainProps = {},
      feePercentage,
      feeToken: feeTokenProp,
      feeValue,
      sourceChainProps = {},
      token,
      tokenInputProps = {},
      ...props
    },
    ref,
  ) => {
    const { amount } = useMemo(() => {
      const amount = !amountInputProps.amount
        ? EMPTY_VALUE_PLACEHOLDER
        : `${getRoundedAmountString(Number(amountInputProps.amount), 3, {
            roundingFunction: Math.round,
          })} ${token ?? ''}`;

      let fee = EMPTY_VALUE_PLACEHOLDER;
      const feeToken = feeTokenProp ?? '';

      if (feePercentage) {
        fee = `${
          parseFloat(amountInputProps.amount ?? '0') * feePercentage * 0.01
        } ${feeToken}`;
      } else if (feeValue && feeValue > 0) {
        const fmtFee = getRoundedAmountString(feeValue, 3, {
          roundingFunction: Math.round,
        });

        fee = `${fmtFee} ${feeToken}`;
      }

      return { amount, fee };
    }, [amountInputProps.amount, feePercentage, feeTokenProp, feeValue, token]);

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
            <ChainInput {...sourceChainProps} chainType="source" />

            <div className="hidden space-x-2 lg:!flex">
              <TokenInput
                {...tokenInputProps}
                className="grow shrink-0 basis-1"
              />

              {bridgingTokenProps && (
                <TokenInput
                  {...bridgingTokenProps}
                  title="Shielded Pool"
                  info="Shielded pools hold shielded cryptocurrency and are used to maintain privacy of the transaction."
                  className="grow shrink-0 basis-1"
                />
              )}
            </div>

            <div className="flex gap-2 lg:hidden">
              <TokenInput title="Deposit" className="grow shrink-0 basis-1" />
              <TokenInput
                title="Shielded Pool"
                className="lg:hidden grow shrink-0 basis-1"
              />
            </div>
          </BridgeInputGroup>

          <BridgeInputGroup className="flex flex-col space-y-2">
            <ChainInput {...destChainProps} chainType="dest" />
            <AmountInput {...amountInputProps} />
          </BridgeInputGroup>

          {/** Info */}
          <div className="flex flex-col space-y-1">
            <InfoItem
              leftTextProps={{
                title: 'Depositing',
                variant: 'utility',
                info: 'Depositing',
              }}
              rightContent={amount}
            />
          </div>
        </div>

        <Button
          {...buttonProps}
          isFullWidth
          className={twMerge('flex justify-center', buttonProps.className)}
        >
          {typeof buttonProps.children === 'string' ? (
            <Typography variant="body1" fw="bold" className="!text-inherit">
              {buttonProps.children}
            </Typography>
          ) : (
            (buttonProps.children ?? 'Deposit')
          )}
        </Button>
      </div>
    );
  },
);
