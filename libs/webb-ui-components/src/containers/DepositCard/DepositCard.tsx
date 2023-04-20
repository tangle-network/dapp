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
    ref
  ) => {
    const { amount, fee } = useMemo(() => {
      const amount = !amountInputProps.amount
        ? '--'
        : `${getRoundedAmountString(
            Number(amountInputProps.amount),
            3,
            Math.round
          )} ${token ?? ''}`;

      let fee = '--';
      const feeToken = feeTokenProp ?? '';
      if (feePercentage) {
        fee = `${
          parseFloat(amountInputProps.amount ?? '0') * feePercentage * 0.01
        } ${feeToken}`;
      } else if (feeValue && feeValue > 0) {
        const formatedFee = getRoundedAmountString(feeValue, 3, Math.round);
        fee = `${formatedFee} ${feeToken}`;
      }

      return { amount, fee };
    }, [amountInputProps.amount, feePercentage, feeTokenProp, feeValue, token]);

    return (
      <div
        {...props}
        className={twMerge(
          'flex flex-col justify-between max-w-[518px] w-full h-full',
          className
        )}
        ref={ref}
      >
        <div className="space-y-4">
          <BridgeInputGroup className="flex flex-col space-y-2">
            <ChainInput {...sourceChainProps} chainType="source" />

            <div className="flex space-x-2">
              <TokenInput
                {...tokenInputProps}
                className="grow shrink-0 basis-1"
              />

              {bridgingTokenProps && (
                <TokenInput
                  {...bridgingTokenProps}
                  title="Bridging Token"
                  className="grow shrink-0 basis-1"
                />
              )}
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

            <InfoItem
              leftTextProps={{
                title: feePercentage ? `Fee (${feePercentage}%)` : `Max fee`,
                variant: 'utility',
              }}
              rightContent={fee}
            />
          </div>
        </div>

        <Button
          {...buttonProps}
          isFullWidth
          className={twMerge('justify-center', buttonProps.className)}
        >
          {typeof buttonProps.children === 'string' ? (
            <Typography variant="body1" fw="bold" className="!text-inherit">
              {buttonProps.children}
            </Typography>
          ) : (
            buttonProps.children ?? 'Deposit'
          )}
        </Button>
      </div>
    );
  }
);
