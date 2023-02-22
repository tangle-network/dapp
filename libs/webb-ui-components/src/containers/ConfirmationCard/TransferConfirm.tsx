import { Close, Download, ExternalLinkLine } from '@webb-tools/icons';
import cx from 'classnames';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  Avatar,
  Button,
  ChainsRing,
  CheckBox,
  CopyWithTooltip,
  InfoItem,
  Progress,
  TitleWithInfo,
} from '../../components';
import { Typography } from '../../typography';
import { shortenString } from '../../utils';
import { Section, WrapperSection } from './WrapperSection';
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
      isCopied,
      onCopy,
      onDownload,
      progress,
      recipientPublicKey,
      relayerAddress,
      relayerExternalUrl,
      relayerAvatarTheme,
      sourceChain,
      title = 'Confirm Transfer',
      fungibleTokenSymbol: token1Symbol,
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
            sourceLabel={
              sourceChain && sourceChain === destChain
                ? 'Sender & Recipient'
                : 'Sender'
            }
            destLabel={
              destChain && sourceChain === destChain ? undefined : 'Recipient'
            }
            sourceChain={sourceChain}
            destChain={destChain}
            amount={amount}
            tokenPairString={token1Symbol}
          />
        </div>

        {/** Transaction progress */}
        {typeof progress === 'number' && <Progress value={progress} />}

        <WrapperSection>
          <div
            className={cx(
              'grid gap-2',
              relayerAddress ? 'grid-cols-2' : 'grid-cols-1'
            )}
          >
            {/** Relayer */}
            {relayerAddress && (
              <Section>
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
                    <Avatar theme={relayerAvatarTheme} value={relayerAddress} />

                    <Typography variant="body1" fw="bold">
                      {relayerAddress.toLowerCase().startsWith('0x')
                        ? shortenString(relayerAddress.substring(2), 5)
                        : shortenString(relayerAddress, 5)}
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
              </Section>
            )}

            {/** Recipient public key */}
            {recipientPublicKey && (
              <Section>
                <div className="space-y-4">
                  <TitleWithInfo
                    titleComponent="h6"
                    title="Recipient"
                    variant="utility"
                    titleClassName="text-mono-100 dark:text-mono-80"
                    className="text-mono-100 dark:text-mono-80"
                  />

                  <Typography
                    variant="body1"
                    fw="bold"
                    className="block break-words"
                  >
                    {recipientPublicKey}
                  </Typography>
                </div>
              </Section>
            )}
          </div>

          {/** New spend note */}
          {note && (
            <Section>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <TitleWithInfo
                    titleComponent="h6"
                    title="Change note"
                    info="Change note"
                    variant="utility"
                    titleClassName="text-mono-100 dark:text-mono-80"
                    className="text-mono-100 dark:text-mono-80"
                  />
                  <div className="flex space-x-2">
                    <CopyWithTooltip textToCopy={note ?? ''} />
                    <Button
                      variant="utility"
                      size="sm"
                      className="p-2"
                      onClick={onDownload}
                    >
                      <Download className="!fill-current" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between max-w-[470px]">
                  <Typography
                    variant="mono1"
                    fw="bold"
                    className="block truncate text-mono-140 dark:text-mono-0"
                  >
                    {note}
                  </Typography>
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
            </Section>
          )}
        </WrapperSection>

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

        <Button {...actionBtnProps} isFullWidth className="justify-center">
          {actionBtnProps?.children ?? 'Transfer'}
        </Button>
      </div>
    );
  }
);
