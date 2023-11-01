import { Close, FileShieldLine, GasStationFill } from '@webb-tools/icons';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { TxProgressorBody } from '../../components/TxProgressor';
import { CheckBox } from '../../components/CheckBox/Checkbox';
import { Chip } from '../../components/Chip/Chip';
import SteppedProgress from '../../components/Progress/SteppedProgress';
import { TitleWithInfo } from '../../components/TitleWithInfo/TitleWithInfo';
import Button from '../../components/buttons/Button';
import { Typography } from '../../typography';
import FeeDetails from '../../components/FeeDetails/FeeDetails';
import TxConfirmationRing from '../../components/TxConfirmationRing';
import { formatTokenAmount } from './utils';
import AmountInfo from './AmountInfo';
import SpendNoteInput from './SpendNoteInput';
import WrapperSection from './WrapperSection';
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
      poolExplorerUrl,
      wrappableTokenSymbol,
      newBalance,
      feesSection,
      ...props
    },
    ref
  ) => {
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
          <WrapperSection>
            <TxProgressorBody
              txSourceInfo={{
                isSource: true,
                typedChainId: sourceTypedChainId,
                amount: amount * -1,
                tokenSymbol: wrappableTokenSymbol ?? fungibleTokenSymbol,
                walletAddress: sourceAddress,
                accountType: 'wallet',
                tokenType: 'unshielded',
                tooltipContent:
                  'Originating chain & wallet address of depositing funds.',
              }}
              txDestinationInfo={{
                typedChainId: destTypedChainId,
                amount: wrappingAmount ?? amount,
                tokenSymbol: fungibleTokenSymbol,
                walletAddress: destAddress,
                accountType: 'note',
                tokenType: 'shielded',
                tooltipContent:
                  'Target chain & note account of shielded funds being deposited to.',
              }}
            />
          </WrapperSection>

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
            poolExplorerUrl={poolExplorerUrl}
          />

          {/** Spend Note info */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-0.5">
              <FileShieldLine className="fill-mono-120 dark:fill-mono-100" />
              <TitleWithInfo
                title="Spend Note"
                info="Unique identifier for your deposit in the shielded pool."
                variant="utility"
                titleClassName="text-mono-120 dark:text-mono-100"
                className="text-mono-120 dark:text-mono-100"
              />
            </div>

            <WrapperSection>
              <SpendNoteInput note={note ?? ''} />
            </WrapperSection>
          </div>

          {/** Amount Details */}
          <div className="flex flex-col gap-2">
            <AmountInfo
              label="Note Amount"
              amount={formatTokenAmount(amount)}
              tokenSymbol={fungibleTokenSymbol}
              tooltipContent="The value associated with the spend note."
            />
            <AmountInfo
              label="New Balance"
              amount={formatTokenAmount(newBalance)}
              tokenSymbol={fungibleTokenSymbol}
              tooltipContent={`Your updated shielded balance of ${fungibleTokenSymbol} on destination chain after deposit.`}
            />
          </div>

          {/* Fees */}
          {feesSection}

          {/* Copy Spend Note Checkbox */}
          <CheckBox
            {...checkboxProps}
            wrapperClassName={twMerge(
              'flex items-start',
              checkboxProps?.wrapperClassName
            )}
          >
            {checkboxProps?.children ??
              "I acknowledge that I've saved the spend note, essential for future transactions and fund access."}
          </CheckBox>
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
