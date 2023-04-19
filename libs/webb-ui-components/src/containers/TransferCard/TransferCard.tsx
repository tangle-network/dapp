import { InformationLine } from '@webb-tools/icons';
import cx from 'classnames';
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
import { Typography } from '../../typography';
import { TransferCardProps } from './types';

const buttonDescVariantClasses = {
  info: cx('text-mono-100 dark:text-mono-80'),
  error: cx('text-red-70 dark:text-red-50'),
};

export const TransferCard = forwardRef<HTMLDivElement, TransferCardProps>(
  (
    {
      amountInputProps,
      bridgeAssetInputProps,
      className,
      destChainInputProps,
      recipientInputProps,
      relayerInputProps,
      infoItemProps,
      buttonDesc,
      buttonDescVariant = 'info',
      transferBtnProps,
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
          'flex flex-col max-w-[518px] w-full h-full justify-between',
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
            <RelayerInput {...relayerInputProps} />

            <RecipientInput {...recipientInputProps} />
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
          <Button
            {...transferBtnProps}
            isFullWidth
            className={twMerge('justify-center')}
          >
            {transferBtnProps?.children ?? 'Transfer'}
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
