import {
  NewNotesTxResult,
  Transaction,
  TransactionState,
  TransferTransactionPayloadType,
} from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { LoggerService } from '@webb-tools/app-util';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config';
import { useRelayers, useVAnchor } from '@webb-tools/react-hooks';
import { ChainType, Note, calculateTypedChainId } from '@webb-tools/sdk-core';
import { ZERO_ADDRESS } from '@webb-tools/utils';
import { isViemError } from '@webb-tools/web3-api-provider';
import {
  TransferConfirm,
  getRoundedAmountString,
} from '@webb-tools/webb-ui-components';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import type { Hash } from 'viem';
import { ContractFunctionRevertedError, formatEther } from 'viem';
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
import { RecipientPublicKeyTooltipContent } from './shared';
import { TransferConfirmContainerProps } from './types';

const logger = LoggerService.get('TransferConfirmContainer');

const TransferConfirmContainer = forwardRef<
  HTMLDivElement,
  TransferConfirmContainerProps
>(
  (
    {
      amount,
      changeAmount,
      currency,
      destChain,
      recipient,
      relayer,
      note: changeNote,
      changeUtxo,
      transferUtxo,
      inputNotes,
      onResetState,
      onClose,
      feeInWei: feeAmount,
      feeToken,
      refundRecipient,
      refundAmount,
      refundToken,
      ...props
    },
    ref
  ) => {
    // State for tracking the status of the change note checkbox
    const [isChecked, setIsChecked] = useState(false);

    const {
      api: vAnchorApi,
      addNoteToNoteManager,
      removeNoteFromNoteManager,
    } = useVAnchor();

    const enqueueSubmittedTx = useEnqueueSubmittedTx();

    const { activeApi, activeChain, apiConfig, txQueue, noteManager } =
      useWebContext();

    const { api: txQueueApi, txPayloads } = txQueue;

    const [txId, setTxId] = useState('');
    const [totalStep, setTotalStep] = useState<number | undefined>();

    const stage = useLatestTransactionStage(txId);

    const targetChainId = useMemo(
      () => calculateTypedChainId(destChain.chainType, destChain.id),
      [destChain]
    );

    const {
      relayersState: { activeRelayer },
    } = useRelayers({
      typedChainId: targetChainId,
      target: activeApi?.state.activeBridge
        ? activeApi.state.activeBridge.targets[targetChainId]
        : undefined,
    });

    const isTransferring = useMemo(
      () => stage !== TransactionState.Ideal,
      [stage]
    );

    // The callback for the transfer button
    const handleTransferExecute = useCallback(
      async () => {
        if (inputNotes.length === 0) {
          logger.error('No input notes provided');
          captureSentryException(
            new Error('No input notes provided'),
            'transactionType',
            'transfer'
          );
          return;
        }

        if (!vAnchorApi || !activeApi) {
          logger.error('No vAnchor API provided');
          captureSentryException(
            new Error('No vAnchor API provided'),
            'transactionType',
            'transfer'
          );
          return;
        }

        if (isTransferring) {
          txQueueApi.startNewTransaction();
          onResetState?.();
          return;
        }

        const note: Note = inputNotes[0];
        const {
          sourceChainId: sourceTypedChainId,
          targetChainId: destTypedChainId,
          sourceIdentifyingData,
          tokenSymbol,
        } = note.note;

        const destCurrency = apiConfig.getCurrencyBySymbolAndTypedChainId(
          tokenSymbol,
          +destTypedChainId
        );
        if (!destCurrency) {
          console.error(`Currency not found for symbol ${tokenSymbol}`);
          captureSentryException(
            new Error(`Currency not found for symbol ${tokenSymbol}`),
            'transactionType',
            'transfer'
          );
          return;
        }
        const tokenURI = getTokenURI(destCurrency, destTypedChainId);

        const tx = Transaction.new<NewNotesTxResult>('Transfer', {
          amount,
          tokens: [tokenSymbol, tokenSymbol],
          wallets: {
            src: +sourceTypedChainId,
            dest: +destTypedChainId,
          },
          token: tokenSymbol,
          tokenURI,
          providerType: activeApi.type,
          address: noteManager?.getKeypair().toString(),
          recipient,
        });

        setTxId(tx.id);
        setTotalStep(tx.totalSteps);
        txQueueApi.registerTransaction(tx);

        try {
          const txPayload: TransferTransactionPayloadType = {
            notes: inputNotes,
            changeUtxo,
            transferUtxo,
            feeAmount: feeAmount ?? ZERO_BIG_INT,
            refundAmount: refundAmount ?? ZERO_BIG_INT,
            refundRecipient: refundRecipient ?? ZERO_ADDRESS,
          };

          const args = await vAnchorApi.prepareTransaction(tx, txPayload, '');

          console.log('args', args);

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
              apiConfig.chains[+sourceTypedChainId],
              'transfer'
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
          for (const note of inputNotes) {
            await removeNoteFromNoteManager(note);
          }
        } catch (error) {
          console.error('Error occured while transferring', error);
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

          captureSentryException(error, 'transactionType', 'transfer');
        }
      },
      // prettier-ignore
      [activeApi, activeRelayer, addNoteToNoteManager, amount, apiConfig, changeNote, changeUtxo, currency.id, enqueueSubmittedTx, feeAmount, inputNotes, isTransferring, noteManager, onResetState, recipient, refundAmount, refundRecipient, removeNoteFromNoteManager, transferUtxo, txQueueApi, vAnchorApi]
    );

    const currentTx = useCurrentTx(txQueue.txQueue, txId);

    const cardTitle = useMemo(() => {
      if (!currentTx) {
        return;
      }

      return getCardTitle(stage, currentTx.name);
    }, [currentTx, stage]);

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
      if (!feeAmount) {
        return undefined;
      }

      const amountNum = Number(formatEther(feeAmount));

      return getRoundedAmountString(amountNum, 3, {
        roundingFunction: Math.round,
      });
    }, [feeAmount]);

    return (
      <TransferConfirm
        {...props}
        className="min-h-[var(--card-height)]"
        ref={ref}
        title={cardTitle}
        totalProgress={totalStep}
        progress={currentStep}
        amount={amount}
        changeAmount={changeAmount}
        sourceChain={{
          name: activeChain?.name ?? '',
          type: activeChain?.group ?? 'webb-dev',
        }}
        destChain={{
          name: destChain.name,
          type: destChain.group ?? 'webb-dev',
        }}
        note={changeNote?.serialize()}
        recipientTitleProps={{
          info: <RecipientPublicKeyTooltipContent />,
        }}
        recipientPublicKey={recipient}
        relayerAddress={relayer?.beneficiary}
        relayerExternalUrl={relayer?.endpoint}
        fungibleTokenSymbol={currency.view.symbol}
        relayerAvatarTheme={
          activeChain?.chainType === ChainType.EVM ? 'ethereum' : 'polkadot'
        }
        fee={formattedFee}
        feeToken={feeToken}
        onClose={onClose}
        checkboxProps={{
          children: 'I have copied the change note',
          isChecked,
          onChange: () => setIsChecked((prev) => !prev),
        }}
        actionBtnProps={{
          isDisabled: changeNote ? !isChecked : false,
          onClick: handleTransferExecute,
          children: isTransferring ? 'Make Another Transaction' : 'Transfer',
        }}
        txStatusMessage={txStatusMessage}
        refundAmount={
          typeof refundAmount === 'bigint'
            ? formatEther(refundAmount)
            : undefined
        }
        refundToken={refundToken}
      />
    );
  }
);

export default TransferConfirmContainer;
