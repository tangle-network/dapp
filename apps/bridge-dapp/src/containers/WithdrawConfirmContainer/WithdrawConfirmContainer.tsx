import { useWebContext } from '@webb-tools/api-provider-environment';
import { ZERO_BIG_INT, chainsPopulated } from '@webb-tools/dapp-config';
import { useRelayers, useVAnchor } from '@webb-tools/react-hooks';
import { ChainType, Note } from '@webb-tools/sdk-core';
import {
  WithdrawConfirm,
  getRoundedAmountString,
} from '@webb-tools/webb-ui-components';
import { forwardRef, useCallback, useMemo, useState } from 'react';

import {
  NewNotesTxResult,
  Transaction,
  TransactionState,
  WithdrawTransactionPayloadType,
} from '@webb-tools/abstract-api-provider';
import { isViemError } from '@webb-tools/web3-api-provider';
import {
  ContractFunctionRevertedError,
  Hash,
  formatEther,
  formatUnits,
} from 'viem';
import {
  useCurrentTx,
  useEnqueueSubmittedTx,
  useLatestTransactionStage,
} from '../../hooks';
import {
  captureSentryException,
  getCardTitle,
  getErrorMessage,
  getTokenURI,
  getTransactionHash,
  handleMutateNoteIndex,
  handleStoreNote,
} from '../../utils';
import { WithdrawConfirmContainerProps } from './types';

const WithdrawConfirmContainer = forwardRef<
  HTMLDivElement,
  WithdrawConfirmContainerProps
>(
  (
    {
      amount,
      amountAfterFee,
      availableNotes,
      changeAmount,
      changeNote,
      changeUtxo,
      fee,
      feeInfo,
      fungibleCurrency: fungibleCurrencyProp,
      isRefund,
      onResetState,
      receivingInfo,
      recipient,
      refundAmount,
      refundToken,
      sourceTypedChainId,
      targetTypedChainId,
      unwrapCurrency: { value: unwrapCurrency } = {},
      onClose,
      ...props
    },
    ref
  ) => {
    const { value: fungibleCurrency } = fungibleCurrencyProp;

    const {
      api: vAnchorApi,
      addNoteToNoteManager,
      removeNoteFromNoteManager,
    } = useVAnchor();

    const enqueueSubmittedTx = useEnqueueSubmittedTx();

    const { activeApi, apiConfig, txQueue } = useWebContext();

    const { api: txQueueApi, txPayloads } = txQueue;

    const [txId, setTxId] = useState('');
    const [totalStep, setTotalStep] = useState<number | undefined>();

    const stage = useLatestTransactionStage(txId);

    const {
      relayersState: { activeRelayer },
    } = useRelayers({
      typedChainId: targetTypedChainId,
      target: activeApi?.state.activeBridge
        ? activeApi.state.activeBridge.targets[targetTypedChainId]
        : undefined,
    });

    const [checked, setChecked] = useState(false);

    const withdrawTxInProgress = useMemo(() => {
      return stage !== TransactionState.Ideal;
    }, [stage]);

    const avatarTheme = useMemo(() => {
      return chainsPopulated[targetTypedChainId].chainType === ChainType.EVM
        ? 'ethereum'
        : 'substrate';
    }, [targetTypedChainId]);

    const currentTx = useCurrentTx(txQueue.txQueue, txId);

    const cardTitle = useMemo(() => {
      if (!currentTx) {
        return;
      }

      return getCardTitle(stage, currentTx.name, Boolean(unwrapCurrency));
    }, [currentTx, stage, unwrapCurrency]);

    // The main action onClick handler
    const handleExecuteWithdraw = useCallback(
      async () => {
        if (availableNotes.length === 0 || !vAnchorApi || !activeApi) {
          captureSentryException(
            new Error(
              'No notes available to withdraw or vAnchorApi not available'
            ),
            'transactionType',
            'withdraw'
          );
          return;
        }

        if (withdrawTxInProgress) {
          txQueueApi.startNewTransaction();
          onResetState?.();
          return;
        }

        const note: Note = availableNotes[0];
        const {
          sourceChainId: sourceTypedChainId,
          sourceIdentifyingData,
          targetChainId: destTypedChainId,
          denomination,
          tokenSymbol,
        } = note.note;

        const unwrapTokenSymbol = unwrapCurrency?.view.symbol ?? tokenSymbol;

        const currency = apiConfig.getCurrencyBySymbolAndTypedChainId(
          tokenSymbol,
          +destTypedChainId
        );
        if (!currency) {
          console.error(`Currency not found for symbol ${tokenSymbol}`);
          captureSentryException(
            new Error(`Currency not found for symbol ${tokenSymbol}`),
            'transactionType',
            'withdraw'
          );
          return;
        }
        const tokenURI = getTokenURI(currency, destTypedChainId);

        const amount = Number(formatUnits(amountAfterFee, +denomination));

        const tx = Transaction.new<NewNotesTxResult>('Withdraw', {
          amount,
          tokens: [tokenSymbol, unwrapTokenSymbol],
          wallets: {
            src: +sourceTypedChainId,
            dest: +destTypedChainId,
          },
          token: tokenSymbol,
          tokenURI,
          providerType: activeApi.type,
          address: sourceIdentifyingData,
          recipient,
        });
        setTxId(tx.id);
        setTotalStep(tx.totalSteps);
        txQueueApi.registerTransaction(tx);

        try {
          const refund = refundAmount ?? ZERO_BIG_INT;

          const txPayload: WithdrawTransactionPayloadType = {
            notes: availableNotes,
            changeUtxo,
            recipient,
            refundAmount: refund,
            feeAmount: fee,
          };

          const args = await vAnchorApi.prepareTransaction(
            tx,
            txPayload,
            unwrapCurrency?.getAddressOfChain(+destTypedChainId) ?? ''
          );

          const outputNotes = changeNote ? [changeNote] : [];

          let indexBeforeInsert: number | undefined;
          if (changeNote) {
            const nextIdx = Number(
              await vAnchorApi.getNextIndex(+sourceTypedChainId, currency.id)
            );

            indexBeforeInsert = nextIdx === 0 ? nextIdx : nextIdx - 1;
          }

          let transactionHash: Hash;

          if (activeRelayer) {
            transactionHash = await vAnchorApi.transactWithRelayer(
              activeRelayer,
              args,
              outputNotes
            );

            await handleStoreNote(changeNote, addNoteToNoteManager);

            enqueueSubmittedTx(
              transactionHash,
              apiConfig.chains[+destTypedChainId],
              'withdraw'
            );
          } else {
            transactionHash = await vAnchorApi.transact(...args);

            enqueueSubmittedTx(
              transactionHash,
              apiConfig.chains[+sourceTypedChainId],
              'transfer'
            );

            await handleStoreNote(changeNote, addNoteToNoteManager);

            await vAnchorApi.waitForFinalization(transactionHash);

            // Notification Success Transaction
            tx.txHash = transactionHash;
            tx.next(TransactionState.Done, {
              txHash: transactionHash,
              outputNotes,
            });
          }

          if (typeof indexBeforeInsert === 'number' && changeNote) {
            const noteWithIdx = await handleMutateNoteIndex(
              vAnchorApi,
              transactionHash,
              changeNote,
              indexBeforeInsert,
              sourceIdentifyingData
            );

            await removeNoteFromNoteManager(changeNote);
            await addNoteToNoteManager(noteWithIdx);
          }

          // Cleanup NoteAccount state
          await Promise.all(
            availableNotes.map((note) => removeNoteFromNoteManager(note))
          );
        } catch (error) {
          console.log('Error while executing withdraw', error);
          changeNote && (await removeNoteFromNoteManager(changeNote));
          tx.txHash = getTransactionHash(error);

          let errorMessage = getErrorMessage(error);
          if (isViemError(error)) {
            errorMessage = error.shortMessage;

            const revertError = error.walk(
              (err) => err instanceof ContractFunctionRevertedError
            );

            if (revertError instanceof ContractFunctionRevertedError) {
              errorMessage = revertError.reason ?? revertError.shortMessage;
            }
          }

          tx.fail(errorMessage);

          captureSentryException(error, 'transactionType', 'withdraw');
        }
      },
      // prettier-ignore
      [activeApi, activeRelayer, addNoteToNoteManager, amountAfterFee, apiConfig, availableNotes, changeNote, changeUtxo, enqueueSubmittedTx, fee, onResetState, recipient, refundAmount, removeNoteFromNoteManager, txQueueApi, unwrapCurrency, vAnchorApi, withdrawTxInProgress]
    );

    const [txStatusMessage, currentStep] = useMemo(() => {
      if (!txId) {
        return ['', undefined];
      }

      const txPayload = txPayloads.find((txPayload) => txPayload.id === txId);
      const message = txPayload
        ? txPayload.txStatus.message?.replace('...', '')
        : '';
      return [message, txPayload?.currentStep];
    }, [txId, txPayloads]);

    const formattedFee = useMemo(() => {
      const feeInEthers = formatEther(fee);

      if (activeRelayer) {
        const formattedRelayerFee = getRoundedAmountString(
          Number(feeInEthers),
          3,
          { roundingFunction: Math.round }
        );
        return `${formattedRelayerFee} ${fungibleCurrency.view.symbol}`;
      }

      return `${feeInEthers} ${refundToken ?? ''}`; // Refund token here is the native token
    }, [activeRelayer, fee, fungibleCurrency.view.symbol, refundToken]);

    const formattedRefund = useMemo(() => {
      if (!refundAmount) {
        return undefined;
      }

      const refundInEthers = Number(formatEther(refundAmount));

      return getRoundedAmountString(refundInEthers, 3, {
        roundingFunction: Math.round,
      });
    }, [refundAmount]);

    const remainingAmount = useMemo(() => {
      const amountInEthers = Number(formatEther(amountAfterFee));

      return getRoundedAmountString(amountInEthers, 3, {
        roundingFunction: Math.round,
      });
    }, [amountAfterFee]);

    return (
      <WithdrawConfirm
        {...props}
        className="min-h-[var(--card-height)]"
        ref={ref}
        title={cardTitle}
        totalProgress={totalStep}
        progress={currentStep}
        sourceChain={{
          name: chainsPopulated[sourceTypedChainId].name,
          type: chainsPopulated[sourceTypedChainId].group ?? 'webb-dev',
        }}
        destChain={{
          name: chainsPopulated[targetTypedChainId].name,
          type: chainsPopulated[targetTypedChainId].group ?? 'webb-dev',
        }}
        actionBtnProps={{
          isDisabled: withdrawTxInProgress
            ? false
            : changeAmount
            ? !checked
            : false,
          children: withdrawTxInProgress
            ? 'Make Another Transaction'
            : unwrapCurrency
            ? 'Unwrap And Withdraw'
            : 'Withdraw',
          onClick: handleExecuteWithdraw,
        }}
        checkboxProps={{
          isChecked: checked,
          isDisabled: withdrawTxInProgress,
          children: 'I have copied the change note',
          onChange: () => setChecked((prev) => !prev),
        }}
        refundAmount={isRefund ? formattedRefund : undefined}
        refundToken={isRefund ? refundToken : undefined}
        receivingInfo={receivingInfo}
        amount={amount}
        remainingAmount={remainingAmount}
        feeInfo={feeInfo}
        fee={formattedFee}
        note={changeNote?.serialize()}
        changeAmount={changeAmount}
        recipientAddress={recipient}
        relayerAddress={activeRelayer?.beneficiary}
        relayerExternalUrl={activeRelayer?.endpoint}
        relayerAvatarTheme={avatarTheme}
        fungibleTokenSymbol={fungibleCurrency.view.symbol}
        wrappableTokenSymbol={unwrapCurrency?.view.symbol}
        txStatusMessage={txStatusMessage}
        onClose={onClose}
      />
    );
  }
);

export default WithdrawConfirmContainer;
