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
import { Typography } from '../../typography/Typography';
import {
  formatTokenAmount,
  getRoundedAmountString,
  shortenString,
} from '../../utils';
import { Section, WrapperSection } from './WrapperSection';
import { TransferConfirmProps } from './types';

const defaultRecipientTitleProps: NonNullable<
  TransferConfirmProps['recipientTitleProps']
> = {
  titleComponent: 'h6',
  title: 'Recipient',
  variant: 'utility',
  titleClassName: 'text-mono-100 dark:text-mono-80',
  className: 'text-mono-100 dark:text-mono-80',
};

export const TransferConfirm = forwardRef<HTMLDivElement, TransferConfirmProps>(
  (
    {
      actionBtnProps,
      amount,
      changeAmount,
      checkboxProps,
      className,
      destChain,
      fee,
      feeToken,
      note,
      onClose,
      onDownload,
      progress,
      totalProgress,
      recipientTitleProps,
      recipientPublicKey,
      relayerAddress,
      relayerExternalUrl,
      relayerAvatarTheme,
      sourceChain,
      txStatusColor = 'blue',
      txStatusMessage,
      title = 'Confirm Transfer',
      fungibleTokenSymbol: token1Symbol,
      refundAmount,
      refundToken,
      ...props
    },
    ref
  ) => {
    const amountContent = useMemo(() => {
      if (typeof amount !== 'number') {
        return '--';
      }

      const formated = getRoundedAmountString(amount, 3, {
        roundingFunction: Math.round,
      });
      return `${formated} ${token1Symbol ?? ''}`.trim();
    }, [amount, token1Symbol]);

    const changeAmountContent = useMemo(() => {
      if (typeof changeAmount !== 'number') {
        return '--';
      }

      const formated = getRoundedAmountString(changeAmount, 3, {
        roundingFunction: Math.round,
      });
      return `${formated} ${token1Symbol ?? ''}`.trim();
    }, [changeAmount, token1Symbol]);

    const feeContent = useMemo(() => {
      if (typeof fee === 'string') {
        return `${fee} ${feeToken ?? ''}`;
      }

      if (typeof fee === 'number') {
        const formatedFee = getRoundedAmountString(fee, 3, {
          roundingFunction: Math.round,
        });
        return `${formatedFee} ${feeToken ?? ''}`.trim();
      }

      return '--';
    }, [fee, feeToken]);

    const refundContent = useMemo(() => {
      if (typeof refundAmount === 'undefined') {
        return;
      }

      if (typeof refundAmount === 'string') {
        return `${refundAmount.slice(0, 10)} ${refundToken ?? ''}`.trim();
      }

      const formated = getRoundedAmountString(refundAmount, 3, {
        roundingFunction: Math.round,
      });
      return `${formated} ${refundToken ?? ''}`.trim();
    }, [refundAmount, refundToken]);

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
                <Chip color={txStatusColor}>{txStatusMessage}</Chip>
              </div>
              <SteppedProgress steps={totalProgress} activeStep={progress} />
            </div>
          ) : null}

          <WrapperSection>
            {/* Transfer info */}
            <Section>
              <div className="flex items-end justify-between gap-6">
                <div className="flex flex-col gap-3">
                  <TitleWithInfo
                    title="Source Chain"
                    variant="utility"
                    info="Source Chain"
                    titleClassName="text-mono-100 dark:text-mono-80"
                    className="text-mono-100 dark:text-mono-80"
                  />
                  <ChainChip
                    chainType={sourceChain?.type ?? 'webb-dev'}
                    chainName={sourceChain?.name ?? ''}
                  />
                  <TokenWithAmount
                    token1Symbol={token1Symbol ?? ''}
                    amount={formatTokenAmount(amount?.toString() ?? '')}
                  />
                </div>

                <ArrowRight size="lg" />

                <div className="flex flex-col gap-3">
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
                    token1Symbol={token1Symbol ?? ''}
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
              {recipientPublicKey && (
                <Section>
                  <div className="space-y-1">
                    <TitleWithInfo
                      title="Recipient"
                      {...defaultRecipientTitleProps}
                      {...recipientTitleProps}
                      titleClassName={twMerge(
                        defaultRecipientTitleProps.titleClassName,
                        recipientTitleProps?.titleClassName
                      )}
                      className={twMerge(
                        defaultRecipientTitleProps.className,
                        recipientTitleProps?.className
                      )}
                    />

                    <div className="flex items-center justify-between">
                      <Typography
                        variant="h5"
                        fw="bold"
                        className="block break-words text-mono-140 dark:text-mono-0"
                      >
                        {shortenString(
                          recipientPublicKey,
                          relayerAddress ? 7 : 19
                        )}
                      </Typography>
                      <CopyWithTooltip textToCopy={recipientPublicKey} />
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
                  title: 'Transferring',
                }}
                rightContent={amountContent}
              />
              {refundContent && (
                <InfoItem
                  leftTextProps={{
                    variant: 'body1',
                    title: 'Refund',
                  }}
                  rightContent={refundContent}
                />
              )}
              <InfoItem
                leftTextProps={{
                  variant: 'body1',
                  title: 'Change Amount',
                }}
                rightContent={changeAmountContent}
              />
              <InfoItem
                leftTextProps={{
                  variant: 'body1',
                  title: 'Est. transaction fee',
                }}
                rightContent={feeContent}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button {...actionBtnProps} isFullWidth className="justify-center">
            {actionBtnProps?.children ?? 'Transfer'}
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
