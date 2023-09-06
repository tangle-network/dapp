import {
  ArrowRight,
  Close,
  Download,
  ExternalLinkLine,
} from '@webb-tools/icons';
import cx from 'classnames';
import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { Avatar } from '../../components/Avatar/Avatar';
import { InfoItem } from '../../components/BridgeInputs/InfoItem';
import { ChainChip } from '../../components/ChainChip/ChainChip';
import { CheckBox } from '../../components/CheckBox/Checkbox';
import { Chip } from '../../components/Chip/Chip';
import { CopyWithTooltip } from '../../components/CopyWithTooltip/CopyWithTooltip';
import SteppedProgress from '../../components/Progress/SteppedProgress';
import { TitleWithInfo } from '../../components/TitleWithInfo/TitleWithInfo';
import { TokenWithAmount } from '../../components/TokenWithAmount/TokenWithAmount';
import Button from '../../components/buttons/Button';
import { Typography } from '../../typography';
import {
  formatTokenAmount,
  getRoundedAmountString,
  shortenString,
} from '../../utils';
import { Section, WrapperSection } from './WrapperSection';
import { WithdrawConfirmationProps } from './types';

export const WithdrawConfirm = forwardRef<
  HTMLDivElement,
  WithdrawConfirmationProps
>(
  (
    {
      actionBtnProps,
      amount,
      changeAmount,
      checkboxProps,
      className,
      destChain,
      fee,
      feeInfo,
      fungibleTokenSymbol: token1Symbol,
      note,
      onClose,
      onDownload,
      progress,
      totalProgress,
      receivingInfo,
      recipientAddress,
      refundAmount,
      refundToken,
      relayerAddress,
      relayerAvatarTheme,
      txStatusMessage,
      relayerExternalUrl,
      remainingAmount,
      sourceChain,
      title = 'Confirm Withdrawal',
      wrappableTokenSymbol: token2Symbol,
      ...props
    },
    ref
  ) => {
    const receivingContent = useMemo(() => {
      if (!remainingAmount) {
        return undefined;
      }

      if (refundAmount) {
        return `${remainingAmount} ${
          token2Symbol ?? token1Symbol
        } + ${refundAmount} ${refundToken ?? ''}`;
      }

      return `${remainingAmount} ${token2Symbol ?? token1Symbol}`.trim();
    }, [
      remainingAmount,
      refundAmount,
      refundToken,
      token1Symbol,
      token2Symbol,
    ]);

    const changeAmountContent = useMemo(() => {
      if (typeof changeAmount === 'undefined') {
        return '--';
      }

      if (typeof changeAmount === 'string') {
        return `${changeAmount.slice(0, 10)} ${token1Symbol}`.trim();
      }

      const formated = getRoundedAmountString(changeAmount, 3, {
        roundingFunction: Math.round,
      });
      return `${formated} ${token1Symbol ?? ''}`.trim();
    }, [changeAmount, token1Symbol]);

    return (
      <div
        {...props}
        className={twMerge(
          'p-4 rounded-lg bg-mono-0 dark:bg-mono-180 flex flex-col justify-between gap-9',
          className
        )}
        ref={ref}
      >
        <div className="space-y-4">
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
          {typeof progress === 'number' && typeof totalProgress === 'number' ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <TitleWithInfo
                  title="Status:"
                  variant="utility"
                  titleClassName="text-mono-200 dark:text-mono-0"
                />
                <Chip color="blue">{txStatusMessage}</Chip>
              </div>
              <SteppedProgress steps={totalProgress} activeStep={progress} />
            </div>
          ) : null}

          <WrapperSection>
            {/** Unwrapping\Withdrawing info */}
            <Section>
              <div className="flex items-end justify-between">
                <div className="flex flex-col max-w-[200px] gap-y-3">
                  <TitleWithInfo
                    title="Source Chain"
                    variant="utility"
                    info="Souce Chain"
                    titleClassName="text-mono-100 dark:text-mono-80"
                    className="text-mono-100 dark:text-mono-80"
                  />
                  <ChainChip
                    chainType={sourceChain?.type ?? 'webb-dev'}
                    chainName={sourceChain?.name ?? ''}
                  />
                  <TokenWithAmount
                    token1Symbol={token1Symbol}
                    amount={formatTokenAmount(amount?.toString() ?? '')}
                  />
                </div>

                <div className="h-full">
                  <ArrowRight size="lg" />
                </div>

                <div className="flex flex-col max-w-[200px] gap-y-3">
                  <TitleWithInfo
                    title="Destination Chain"
                    variant="utility"
                    info="Destination Chain"
                    titleClassName="text-mono-100 dark:text-mono-80"
                    className="text-mono-100 dark:text-mono-80"
                  />
                  <ChainChip
                    chainType={destChain?.type ?? 'webb-dev'}
                    chainName={destChain?.name ?? ''}
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

              {/** Recipient public key */}
              {recipientAddress && (
                <Section>
                  <div className="space-y-1">
                    <TitleWithInfo
                      titleComponent="h6"
                      title="Recipient"
                      info="Recipient"
                      variant="utility"
                      titleClassName="text-mono-100 dark:text-mono-80"
                      className="text-mono-100 dark:text-mono-80"
                    />

                    <div className="flex items-center justify-between">
                      <Typography
                        variant="h5"
                        fw="bold"
                        className="block break-words text-mono-140 dark:text-mono-0"
                      >
                        {shortenString(
                          recipientAddress,
                          relayerAddress ? 6 : 17
                        )}
                      </Typography>
                      <CopyWithTooltip textToCopy={recipientAddress} />
                    </div>
                  </div>
                </Section>
              )}
            </div>

            {/** New spend note */}
            {note && (
              <Section>
                <div className="space-y-1">
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
                      variant="h5"
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
          <div className="px-4 space-y-2">
            <div className="space-y-1">
              <InfoItem
                leftTextProps={{
                  variant: 'body1',
                  title: 'Receiving',
                  info: receivingInfo,
                }}
                rightContent={receivingContent}
              />
              <InfoItem
                leftTextProps={{
                  variant: 'body1',
                  title: 'Change Amount',
                  info: 'Change Amount',
                }}
                rightContent={changeAmountContent}
              />
              <InfoItem
                leftTextProps={{
                  variant: 'body1',
                  title: 'Est. transaction fee',
                  info: feeInfo,
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
