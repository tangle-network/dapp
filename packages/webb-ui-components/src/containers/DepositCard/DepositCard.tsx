import { BridgeInputGroup } from '@webb-dapp/webb-ui-components/components/BridgeInputGroup';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { AmountInput, Button, ChainInput, InfoItem, ShieldedAssetInput, TokenInput } from '../../components';
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
      feeToken,
      sourceChainProps = {},
      token,
      tokenInputProps = {},
      ...props
    },
    ref
  ) => {
    const { amount, fee } = useMemo(() => {
      if (!amountInputProps.amount || !feePercentage) {
        return { amount: '--', fee: '--' };
      }

      return {
        amount: `${amountInputProps.amount} ${token}`,
        fee: `${parseFloat(amountInputProps.amount) * feePercentage * 0.01} ${feeToken}`,
      };
    }, [amountInputProps.amount, feePercentage, feeToken, token]);

    return (
      <div {...props} className={twMerge('flex flex-col space-y-4 max-w-[518px]', className)} ref={ref}>
        <BridgeInputGroup className='flex flex-col space-y-2'>
          <ChainInput {...sourceChainProps} chainType='source' />

          <div className='flex space-x-2'>
            <TokenInput {...tokenInputProps} className='grow shrink-0 basis-1' />

            {bridgingTokenProps && (
              <ShieldedAssetInput asset={bridgingTokenProps} title='Bridging Token' className='grow shrink-0 basis-1' />
            )}
          </div>
        </BridgeInputGroup>

        <BridgeInputGroup className='flex flex-col space-y-2'>
          <ChainInput {...destChainProps} chainType='dest' />
          <AmountInput {...amountInputProps} />
        </BridgeInputGroup>

        {/** Info */}
        <div className='flex flex-col space-y-1'>
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
              title: `Fees ${feePercentage ? `(${feePercentage}%)` : ''}`,
              variant: 'utility',
              info: 'Fees',
            }}
            rightContent={fee}
          />
        </div>

        <Button {...buttonProps} isFullWidth className={twMerge('justify-center', buttonProps.className)}>
          {typeof buttonProps.children === 'string' ? (
            <Typography variant='body1' fw='bold' className='!text-inherit'>
              {buttonProps.children}
            </Typography>
          ) : (
            buttonProps.children
          )}
        </Button>
      </div>
    );
  }
);
