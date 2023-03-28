import {
  ArrowRight,
  Close,
  Download,
  ExternalLinkLine,
} from '@webb-tools/icons';
import cx from 'classnames';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  Avatar,
  Button,
  ChainChip,
  ChainsRing,
  ChainType,
  CheckBox,
  Chip,
  CopyWithTooltip,
  InfoItem,
  Progress,
  TitleWithInfo,
  TokenWithAmount,
} from '../../components';
import { Typography } from '../../typography';
import { formatTokenAmount, shortenString } from '../../utils';
import { Section, WrapperSection } from './WrapperSection';
import { WithdrawConfirmationProps } from './types';

export const WithdrawConfirm = forwardRef<
  HTMLDivElement,
  WithdrawConfirmationProps
>(
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
      relayerAddress,
      relayerExternalUrl,
      relayerAvatarTheme,
      txStatusMessage,
      sourceChain,
      title = 'Confirm Withdrawal',
      fungibleTokenSymbol: token1Symbol,
      wrappableTokenSymbol: token2Symbol,
      recipientAddress,
      ...props
    },
    ref
  ) => {
    return (
      <div
        {...props}
        className={twMerge(
          'p-4 rounded-lg bg-mono-0 dark:bg-mono-180 min-w-[550px] min-h-[700px] flex flex-col justify-between',
          className
        )}
        ref={ref}
      >
        <div className="space-y-6">
          {/** Title */}
          <div className="flex items-center justify-between p-2">
            <Typography variant="h5" fw="bold">
              {title}
            </Typography>
            <button onClick={onClose}>
              <Close size="lg" />
            </button>
          </div>

          {/** Transaction progress */}
          {typeof progress === 'number' ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <TitleWithInfo
                  title="Status:"
                  variant="utility"
                  titleClassName="text-mono-200 dark:text-mono-0"
                />
                <Chip color="blue">{txStatusMessage}</Chip>
              </div>
              <Progress value={progress} />
            </div>
          ) : null}

          <WrapperSection>
            {/** Unwrapping\Withdrawing info */}
            <Section>
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-3">
                  <TitleWithInfo
                    title={'Withdrawing from'}
                    variant="utility"
                    info={'Withdrawing'}
                    titleClassName="text-mono-100 dark:text-mono-80"
                    className="text-mono-100 dark:text-mono-80"
                  />
                  <ChainChip
                    type={(destChain?.type as ChainType) ?? 'webb-dev'}
                    name={destChain?.name ?? ''}
                  />
                  <TokenWithAmount
                    token1Symbol={token1Symbol}
                    amount={formatTokenAmount(amount?.toString() ?? '')}
                  />
                </div>

                <ArrowRight size="lg" />

                <div className="flex flex-col gap-3">
                  <TitleWithInfo
                    title={token2Symbol ? 'Unwraping to' : 'Withdrawing to'}
                    variant="utility"
                    info={token2Symbol ? 'Unwraping to' : 'Withdrawing to'}
                    titleClassName="text-mono-100 dark:text-mono-80"
                    className="text-mono-100 dark:text-mono-80"
                  />
                  <ChainChip
                    type={(destChain?.type as ChainType) ?? 'webb-dev'}
                    name={destChain?.name ?? ''}
                  />
                  <TokenWithAmount
                    token1Symbol={token2Symbol ?? token1Symbol}
                    amount={formatTokenAmount(amount?.toString() ?? '')}
                  />
                </div>
              </div>
            </Section>

            <div
              className={cx(
                'grid gap-2',
                relayerAddress ? 'grid-cols-2' : 'grid-cols-1'
              )}
            >
              {/** Relayer */}
              {relayerAddress && (
                <Section>
                  <div className="space-y-1">
                    <TitleWithInfo
                      titleComponent="h6"
                      title="Relayer"
                      info="Relayer"
                      variant="utility"
                      titleClassName="text-mono-100 dark:text-mono-80"
                      className="text-mono-100 dark:text-mono-80"
                    />

                    <div className="flex items-center space-x-1">
                      <Avatar
                        theme={relayerAvatarTheme}
                        value={relayerAddress}
                      />
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

              {/** Unshielded address */}
              {recipientAddress && (
                <Section>
                  <div className="space-y-1">
                    <TitleWithInfo
                      titleComponent="h6"
                      title="Recipient address"
                      variant="utility"
                      titleClassName="text-mono-100 dark:text-mono-80"
                      className="text-mono-100 dark:text-mono-80"
                    />
                    <Typography
                      variant="body1"
                      fw="bold"
                      className="block break-words"
                    >
                      {recipientAddress}
                    </Typography>
                  </div>
                </Section>
              )}
            </div>

            {/** The change note */}
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
                  title: 'Receiving',
                }}
                rightContent={amount?.toString()}
              />
              <InfoItem
                leftTextProps={{
                  variant: 'body1',
                  title: 'Change Amount',
                  info: 'Change Amount',
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
        </div>

        <div className="flex flex-col gap-2">
          <Button {...actionBtnProps} isFullWidth className="justify-center">
            {actionBtnProps?.children ?? 'Withdraw'}
          </Button>

          {!progress && (
            <Button
              variant="secondary"
              isFullWidth
              className="justify-center"
              onClick={onClose}
            >
              Back
            </Button>
          )}
        </div>
      </div>
    );
  }
);
