import {
  Close,
  Download,
  ExternalLinkLine,
  FileCopyLine,
} from '@webb-tools/icons';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography';

import {
  Avatar,
  Button,
  ChainsRing,
  CheckBox,
  InfoItem,
  Progress,
  TitleWithInfo,
} from '../../components';
import { TransferConfirmProps } from './types';

export const TransferConfirm = forwardRef<HTMLDivElement, TransferConfirmProps>(
  (
    {
      activeChains,
      actionBtnProps,
      amount,
      changeAmount,
      checkboxProps,
      className,
      destChain,
      fee,
      note,
      onClose,
      onCopy,
      onDownload,
      progress,
      recipientAddress,
      relayerAddress,
      relayerExternalUrl,
      sourceChain,
      title = 'Confirm Transfer',
      governedTokenSymbol: token1Symbol,
      ...props
    },
    ref
  ) => {
    return (
      <div
        {...props}
        className={twMerge(
          'p-4 rounded-lg bg-mono-0 dark:bg-mono-180 min-w-[550px] space-y-6',
          className
        )}
        ref={ref}
      >
        {/** Title */}
        <div className="flex items-center justify-between p-2">
          <Typography variant="h5" fw="bold">
            {title}
          </Typography>
          <button onClick={onClose}>
            <Close size="lg" />
          </button>
        </div>

        {/** Token ring */}
        <div>
          <ChainsRing
            activeChains={activeChains}
            sourceLabel="Sender"
            destLabel="Recipient"
            sourceChain={sourceChain}
            destChain={destChain}
            amount={amount}
            tokenPairString={token1Symbol}
          />
        </div>

        {/** Transaction progress */}
        {progress && <Progress value={progress} />}

        {/** Relayer */}
        {relayerAddress && (
          <div className="space-y-4">
            <TitleWithInfo
              titleComponent="h6"
              title="Relayer"
              info="Relayer"
              variant="utility"
              titleClassName="text-mono-100 dark:text-mono-80"
              className="text-mono-100 dark:text-mono-80"
            />

            <div className="flex items-center space-x-1">
              <Avatar value={relayerAddress} />

              <Typography variant="body1" fw="bold">
                {relayerAddress}
              </Typography>

              <a
                target="_blank"
                href={relayerExternalUrl}
                rel="noreferrer noopener"
              >
                <ExternalLinkLine />
              </a>
            </div>
          </div>
        )}

        {/** Recipient address */}
        {recipientAddress && (
          <div className="space-y-4">
            <TitleWithInfo
              titleComponent="h6"
              title="Recipient address"
              variant="utility"
              titleClassName="text-mono-100 dark:text-mono-80"
              className="text-mono-100 dark:text-mono-80"
            />

            <Typography variant="body1" fw="bold">
              {recipientAddress}
            </Typography>
          </div>
        )}

        {/** Transaction Details */}
        <div className="space-y-2">
          <TitleWithInfo
            titleComponent="h6"
            title={`Transaction Details`}
            variant="utility"
            titleClassName="text-mono-100 dark:text-mono-80"
            className="text-mono-100 dark:text-mono-80"
          />
          <div className="space-y-1">
            <InfoItem
              leftTextProps={{
                variant: 'body1',
                title: 'Transfering',
              }}
              rightContent={amount?.toString()}
            />
            <InfoItem
              leftTextProps={{
                variant: 'body1',
                title: 'Change Amount',
              }}
              rightContent={changeAmount?.toString()}
            />
            <InfoItem
              leftTextProps={{
                variant: 'body1',
                title: 'Fees',
                info: 'Fees',
              }}
              rightContent={fee?.toString()}
            />
          </div>
        </div>

        {/** New spend note */}
        <div className="space-y-2">
          <TitleWithInfo
            titleComponent="h6"
            title="New Spend Note"
            info="New Spend Note"
            variant="utility"
            titleClassName="text-mono-100 dark:text-mono-80"
            className="text-mono-100 dark:text-mono-80"
          />

          <div className="flex items-center justify-between">
            <div className="px-4 py-1.5 bg-mono-20 dark:bg-mono-160 rounded-lg grow max-w-[438px] truncate">
              <Typography
                variant="mono1"
                fw="bold"
                className="text-mono-140 dark:text-mono-0"
              >
                {note}
              </Typography>
            </div>
            <Button
              variant="utility"
              size="sm"
              className="p-2"
              onClick={onCopy}
            >
              <FileCopyLine className="!fill-current" />
            </Button>
            <Button
              variant="utility"
              size="sm"
              className="p-2"
              onClick={onDownload}
            >
              <Download className="!fill-current" />
            </Button>
          </div>
          <CheckBox
            {...checkboxProps}
            wrapperClassName={twMerge(
              'flex items-center',
              checkboxProps?.wrapperClassName
            )}
          >
            {checkboxProps?.children ?? 'I have copied the spend note'}
          </CheckBox>
        </div>

        <Button {...actionBtnProps} isFullWidth className="justify-center">
          {actionBtnProps?.children ?? 'Transfer'}
        </Button>
      </div>
    );
  }
);
