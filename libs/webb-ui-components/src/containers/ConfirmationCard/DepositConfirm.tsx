import { ArrowRight, Close, Download } from '@webb-tools/icons';
import { TxProgressorBody } from '@webb-tools/webb-ui-components/components';
import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
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
import TxConfirmationRing from '../../components/ConfirmationRing';
import { formatTokenAmount, getRoundedAmountString } from '../../utils';
import { Section } from './WrapperSection';
import { DepositConfirmProps } from './types';

export const DepositConfirm = forwardRef<HTMLDivElement, DepositConfirmProps>(
  (
    {
      actionBtnProps,
      amount,
      wrappingAmount,
      checkboxProps,
      className,
      fee,
      feeToken,
      note,
      onClose,
      onDownload,
      txStatusMessage,
      txStatusColor = 'blue',
      progress = null,
      totalProgress,
      sourceAddress,
      destAddress,
      sourceTypedChainId,
      destTypedChainId,
      title = 'Confirm Deposit',
      fungibleTokenSymbol,
      poolAddress,
      wrappableTokenSymbol,
      ...props
    },
    ref
  ) => {
    const depositingInfoStr = useMemo(() => {
      let symbolStr = '';
      if (wrappableTokenSymbol) {
        symbolStr += `${wrappableTokenSymbol.trim()}/`;
      }

      symbolStr += fungibleTokenSymbol;

      const formatedAmount =
        typeof amount === 'number'
          ? getRoundedAmountString(amount, 3, { roundingFunction: Math.round })
          : amount ?? '0';

      return `${formatedAmount} ${symbolStr}`;
    }, [amount, fungibleTokenSymbol, wrappableTokenSymbol]);

    return (
      <div
        {...props}
        className={twMerge(
          'p-4 rounded-lg bg-mono-0 dark:bg-mono-190 flex flex-col justify-between gap-9',
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

          {/** Wrapping info */}
          <Section>
            <TxProgressorBody
              txSourceInfo={{
                isSource: true,
                typedChainId: sourceTypedChainId,
                amount: amount * -1,
                tokenSymbol: wrappableTokenSymbol ?? fungibleTokenSymbol,
                walletAddress: sourceAddress,
                accountType: 'wallet',
                tokenType: 'unshielded',
              }}
              txDestinationInfo={{
                typedChainId: destTypedChainId,
                amount: wrappingAmount ?? amount,
                tokenSymbol: fungibleTokenSymbol,
                walletAddress: destAddress,
                accountType: 'note',
                tokenType: 'shielded',
              }}
            />
          </Section>

          <TxConfirmationRing
            source={{
              address: sourceAddress,
              typedChainId: sourceTypedChainId,
              isNoteAccount: false,
            }}
            dest={{
              address: destAddress,
              typedChainId: destTypedChainId,
              isNoteAccount: true,
            }}
            poolAddress={poolAddress}
            poolName={fungibleTokenSymbol}
          />

          <Section>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <TitleWithInfo
                  title="New Spend Note"
                  info="New Spend Note"
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

          {/** Transaction Details */}
          <div className="px-4 space-y-2">
            <div className="space-y-1">
              <InfoItem
                leftTextProps={{
                  variant: 'utility',
                  title: 'Depositing',
                  info: 'Depositing',
                }}
                rightContent={depositingInfoStr}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button {...actionBtnProps} isFullWidth className="justify-center">
            {actionBtnProps?.children ?? 'Deposit'}
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
