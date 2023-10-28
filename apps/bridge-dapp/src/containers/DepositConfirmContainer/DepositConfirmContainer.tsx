import {
  Currency,
  NewNotesTxResult,
  Transaction,
  TransactionState,
} from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { downloadString } from '@webb-tools/browser-utils';
import { useVAnchor } from '@webb-tools/react-hooks';
import { Note } from '@webb-tools/sdk-core';
import { isViemError } from '@webb-tools/web3-api-provider';
import { DepositConfirm } from '@webb-tools/webb-ui-components';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { ContractFunctionRevertedError, formatUnits } from 'viem';
import { useEnqueueSubmittedTx } from '../../hooks';
import useInProgressTxInfo from '../../hooks/useInProgressTxInfo';
import {
  captureSentryException,
  getErrorMessage,
  getTokenURI,
  getTransactionHash,
  handleMutateNoteIndex,
} from '../../utils';
import { DepositConfirmContainerProps } from './types';

const DepositConfirmContainer = forwardRef<
  HTMLDivElement,
  DepositConfirmContainerProps
>(
  (
    {
      amount,
      fungibleTokenId,
      note,
      onResetState,
      onClose,
      sourceTypedChainId,
      destTypedChainId,
      wrappableTokenId,
    },
    ref
  ) => {
    const [checked, setChecked] = useState(false);
    const {
      api,
      startNewTransaction,
      addNoteToNoteManager,
      removeNoteFromNoteManager,
    } = useVAnchor();

    const { activeApi, activeAccount, activeChain, apiConfig, txQueue } =
      useWebContext();

    const enqueueSubmittedTx = useEnqueueSubmittedTx();

    const { api: txQueueApi } = txQueue;

    const fungibleToken = useMemo(() => {
      return new Currency(apiConfig.currencies[fungibleTokenId]);
    }, [apiConfig.currencies, fungibleTokenId]);

    const wrappableToken = useMemo(() => {
      if (typeof wrappableTokenId === 'undefined') {
        return;
      }

      return new Currency(apiConfig.currencies[wrappableTokenId]);
    }, [wrappableTokenId, apiConfig.currencies]);

    const wrappingFlow = useMemo(
      () => typeof wrappableTokenId !== 'undefined',
      [wrappableTokenId]
    );

    const {
      cardTitle,
      currentStep,
      inProgressTxId,
      setInProgressTxId,
      setTotalStep,
      totalStep,
      txStatus,
      txStatusMessage,
    } = useInProgressTxInfo(wrappingFlow, onResetState);

    // Download for the deposit confirm
    const downloadNote = useCallback((note: Note) => {
      const noteStr = note.serialize();
      downloadString(
        JSON.stringify(noteStr),
        noteStr.slice(-noteStr.length) + '.json'
      );
    }, []);

    const handleExecuteDeposit = useCallback(
      async () => {
        if (!api || !activeApi || !activeChain) {
          captureSentryException(
            new Error('No api or chain found'),
            'transactionType',
            'deposit'
          );
          return;
        }

        // Set transaction payload for transaction processing card
        // Start a new transaction
        if (inProgressTxId.length > 0) {
          startNewTransaction();
          onResetState?.();
          return;
        }

        const {
          amount,
          denomination,
          sourceChainId: sourceTypedChainId,
          targetChainId: destTypedChainId,
          sourceIdentifyingData,
          targetIdentifyingData,
          tokenSymbol,
        } = note.note;

        // Calculate the amount
        const formattedAmount = formatUnits(BigInt(amount), +denomination);

        // Get the deposit token symbol
        let srcTokenSymbol = tokenSymbol;

        if (wrappableToken) {
          srcTokenSymbol = wrappableToken.view.symbol;
        }

        // Get the destination token symbol
        const destToken = tokenSymbol;

        const currency = apiConfig.getCurrencyBySymbolAndTypedChainId(
          tokenSymbol,
          +destTypedChainId
        );
        if (!currency) {
          console.error(`Currency not found for symbol ${tokenSymbol}`);
          captureSentryException(
            new Error(`Currency not found for symbol ${tokenSymbol}`),
            'transactionType',
            'deposit'
          );
          return;
        }

        const tokenURI = getTokenURI(currency, destTypedChainId);

        const tx = Transaction.new<NewNotesTxResult>('Deposit', {
          amount: +formattedAmount,
          tokens: [srcTokenSymbol, destToken],
          wallets: {
            src: +sourceTypedChainId,
            dest: +destTypedChainId,
          },
          token: tokenSymbol,
          tokenURI,
          providerType: activeApi.type,
          address: activeAccount?.address,
          recipient: targetIdentifyingData,
        });
        setInProgressTxId(tx.id);
        setTotalStep(tx.totalSteps);
        txQueueApi.registerTransaction(tx);

        try {
          const args = await api?.prepareTransaction(
            tx,
            note,
            wrappableToken?.getAddressOfChain(+sourceTypedChainId) ?? ''
          );
          if (!args) {
            return txQueueApi.cancelTransaction(tx.id);
          }

          const nextIdx = Number(
            await api.getNextIndex(+sourceTypedChainId, fungibleTokenId)
          );

          const indexBeforeInsert = nextIdx === 0 ? nextIdx : nextIdx - 1;

          const transactionHash = await api.transact(...args);

          downloadNote(note);
          await addNoteToNoteManager(note);

          enqueueSubmittedTx(
            transactionHash,
            apiConfig.chains[+sourceTypedChainId],
            'deposit'
          );

          await api.waitForFinalization(transactionHash);

          const indexedNote = await handleMutateNoteIndex(
            api,
            transactionHash,
            note,
            indexBeforeInsert,
            sourceIdentifyingData
          );

          await removeNoteFromNoteManager(note);
          await addNoteToNoteManager(indexedNote);

          // Notification Success Transaction
          tx.next(TransactionState.Done, {
            txHash: transactionHash,
            outputNotes: [indexedNote],
          });
        } catch (error) {
          console.error(error);
          removeNoteFromNoteManager(note);
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

          captureSentryException(error, 'transactionType', 'deposit');
        }
      },
      // prettier-ignore
      [activeAccount?.address, activeApi, activeChain, addNoteToNoteManager, api, apiConfig, downloadNote, enqueueSubmittedTx, fungibleTokenId, inProgressTxId.length, note, onResetState, removeNoteFromNoteManager, setInProgressTxId, setTotalStep, startNewTransaction, txQueueApi, wrappableToken]
    );

    return (
      <DepositConfirm
        className="min-h-[var(--card-height)]"
        title={cardTitle}
        ref={ref}
        note={note.note.serialize()}
        actionBtnProps={{
          isDisabled: inProgressTxId ? false : !checked,
          children: inProgressTxId
            ? 'Make Another Transaction'
            : wrappingFlow
            ? 'Wrap And Deposit'
            : 'Deposit',
          onClick: handleExecuteDeposit,
        }}
        checkboxProps={{
          isChecked: checked,
          isDisabled: Boolean(inProgressTxId),
          onChange: () => setChecked((prev) => !prev),
        }}
        totalProgress={totalStep}
        progress={currentStep}
        onDownload={() => downloadNote(note)}
        amount={amount}
        wrappingAmount={amount}
        fungibleTokenSymbol={fungibleToken.view.symbol}
        sourceTypedChainId={sourceTypedChainId ?? +note.note.sourceChainId}
        destTypedChainId={destTypedChainId ?? +note.note.targetChainId}
        sourceAddress={activeAccount?.address ?? ''}
        destAddress={note.note.targetIdentifyingData}
        poolAddress={
          apiConfig.anchors[fungibleTokenId][+note.note.targetChainId]
        }
        wrappableTokenSymbol={wrappableToken?.view.symbol}
        txStatusColor={
          txStatus === 'completed'
            ? 'green'
            : txStatus === 'warning'
            ? 'red'
            : undefined
        }
        txStatusMessage={txStatusMessage}
        onClose={onClose}
      />
    );
  }
);

export default DepositConfirmContainer;
