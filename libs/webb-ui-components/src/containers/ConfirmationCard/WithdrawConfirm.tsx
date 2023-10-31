import { Close, FileShieldLine } from '@webb-tools/icons';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { Chip } from '../../components/Chip/Chip';
import { CheckBox } from '../../components/CheckBox/Checkbox';
import SteppedProgress from '../../components/Progress/SteppedProgress';
import { TitleWithInfo } from '../../components/TitleWithInfo/TitleWithInfo';
import Button from '../../components/buttons/Button';
import { Typography } from '../../typography';
import { TxProgressorBody } from '../../components/TxProgressor';
import TxConfirmationRing from '../../components/TxConfirmationRing';
import { formatTokenAmount } from './utils';
import AmountInfo from './AmountInfo';
import RefundAmount from './RefundAmount';
import SpendNoteInput from './SpendNoteInput';
import { Section } from './WrapperSection';
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
      fee,
      feeInfo,
      fungibleTokenSymbol: token1Symbol,
      wrappableTokenSymbol: token2Symbol,
      note,
      onClose,
      onDownload,
      progress,
      totalProgress,
      receivingInfo,
      refundAmount,
      refundToken,
      relayerAddress,
      relayerAvatarTheme,
      txStatusMessage,
      txStatusColor = 'blue',
      relayerExternalUrl,
      remainingAmount,
      title = 'Confirm Withdrawal',
      sourceAddress,
      destAddress,
      sourceTypedChainId,
      destTypedChainId,
      poolAddress,
      newBalance,
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

          {/** Withdraw info */}
          <Section>
            <TxProgressorBody
              txSourceInfo={{
                isSource: true,
                typedChainId: sourceTypedChainId,
                amount: amount * -1,
                tokenSymbol: token1Symbol,
                walletAddress: sourceAddress,
                accountType: 'note',
                tokenType: 'shielded',
              }}
              txDestinationInfo={{
                typedChainId: destTypedChainId,
                amount: amount,
                tokenSymbol: token2Symbol ?? token1Symbol,
                walletAddress: destAddress,
                accountType: 'wallet',
                tokenType: 'unshielded',
              }}
            />
          </Section>

          <TxConfirmationRing
            source={{
              address: sourceAddress,
              typedChainId: sourceTypedChainId,
              isNoteAccount: true,
            }}
            dest={{
              address: destAddress,
              typedChainId: destTypedChainId,
              isNoteAccount: false,
            }}
            poolAddress={poolAddress}
            poolName={token1Symbol}
          />

          {/** Change Note info */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-0.5">
              <FileShieldLine className="fill-mono-120 dark:fill-mono-100" />
              <TitleWithInfo
                title="Change Note"
                info="Unique identifier for the remaining shielded funds after transfer."
                variant="utility"
                titleClassName="text-mono-120 dark:text-mono-100"
                className="text-mono-120 dark:text-mono-100"
              />
            </div>

            {typeof note === 'string' && (
              <Section>
                <SpendNoteInput note={note} />
              </Section>
            )}
          </div>

          {/** Amount Details */}
          <div className="flex flex-col gap-2">
            <AmountInfo
              label="Change Amount"
              amount={formatTokenAmount(changeAmount)}
              tokenSymbol={token1Symbol}
              tooltipContent="The value associated with the change note."
            />
            <AmountInfo
              label="New Balance"
              amount={formatTokenAmount(newBalance)}
              tokenSymbol={token1Symbol}
              tooltipContent={`Your updated shielded balance of ${token1Symbol} on destination chain after deposit.`}
            />
          </div>

          {/* Refund */}
          {refundAmount && (
            <RefundAmount
              tokenSymbol={refundToken ?? ''}
              amount={formatTokenAmount(refundAmount)}
              refundAddress={destAddress}
            />
          )}

          {/* Copy Spend Note Checkbox */}
          <CheckBox
            {...checkboxProps}
            wrapperClassName={twMerge(
              'flex items-start',
              checkboxProps?.wrapperClassName
            )}
          >
            {checkboxProps?.children ??
              "I acknowledge that I've saved the change note note (if applicable), essential for future transactions and fund access."}
          </CheckBox>
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
