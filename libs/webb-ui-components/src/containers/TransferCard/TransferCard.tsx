import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  AmountInput,
  BridgeInputGroup,
  Button,
  ChainInput,
  InfoItem,
  RecipientInput,
  RelayerInput,
  TokenInput,
} from '../../components';
import { TransferCardProps } from './types';

export const TransferCard = forwardRef<HTMLDivElement, TransferCardProps>(
  (
    {
      amountInputProps,
      bridgeAssetInputProps,
      changeAmount,
      className,
      destChainInputProps,
      feeAmount,
      feePercentage,
      feeToken,
      recipientInputProps,
      relayerInputProps,
      transferAmount,
      transferBtnProps,
      transferToken,
      ...props
    },
    ref
  ) => {
    const bridgeAssetProps = useMemo(
      () => ({
        ...bridgeAssetInputProps,
        title: bridgeAssetInputProps?.title ?? 'Bridging Token',
        info: bridgeAssetInputProps?.info ?? 'Bridging Token',
      }),
      [bridgeAssetInputProps]
    );

    return (
      <div
        {...props}
        className={twMerge(
          'flex flex-col max-w-[518px] w-full pb-4 justify-between',
          className
        )}
        ref={ref}
      >
        <div className="space-y-4">
          <BridgeInputGroup className="flex flex-col space-y-2">
            <TokenInput {...bridgeAssetProps} />
          </BridgeInputGroup>

          <BridgeInputGroup className="flex flex-col space-y-2">
            <ChainInput {...destChainInputProps} chainType="dest" />

            <AmountInput {...amountInputProps} />
          </BridgeInputGroup>

          <BridgeInputGroup className="flex flex-col space-y-2">
            {/* Temporary comment until the relayer supports */}
            {/* <RelayerInput {...relayerInputProps} /> */}

            <RecipientInput {...recipientInputProps} />
          </BridgeInputGroup>

          {/** Info */}
          <div className="flex flex-col space-y-1">
            <InfoItem
              leftTextProps={{
                title: 'Transfering',
                variant: 'utility',
                info: 'Transfering',
              }}
              rightContent={
                transferAmount
                  ? `${transferAmount} ${transferToken}`
                  : undefined
              }
            />

            <InfoItem
              leftTextProps={{
                title: 'Change Amount',
                variant: 'utility',
                info: 'Change Amount',
              }}
              rightContent={
                changeAmount ? `${changeAmount} ${transferToken}` : undefined
              }
            />

            <InfoItem
              leftTextProps={{
                title: feePercentage ? `Fees ${feePercentage}` : 'Max fees',
                variant: 'utility',
              }}
              rightContent={
                feeAmount ? `${feeAmount} ${feeToken ?? ''}` : undefined
              }
            />
          </div>
        </div>

        <Button
          {...transferBtnProps}
          isFullWidth
          className={twMerge('justify-center')}
        >
          {transferBtnProps?.children ?? 'Transfer'}
        </Button>
      </div>
    );
  }
);
