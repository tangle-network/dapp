import {
  Currency,
  NewNotesTxResult,
  Transaction,
  TransactionState,
} from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { downloadString } from '@webb-tools/browser-utils';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { useTxQueue, useVAnchor } from '@webb-tools/react-hooks';
import { Note } from '@webb-tools/sdk-core';
import { DepositConfirm, useCopyable } from '@webb-tools/webb-ui-components';
import { ethers } from 'ethers';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import {
  useLatestTransactionStage,
  useTransactionProgressValue,
} from '../../hooks';
import {
  captureSentryException,
  getCardTitle,
  getErrorMessage,
  getTokenURI,
  getTransactionHash,
} from '../../utils';
import { DepositConfirmContainerProps } from './types';

export const DepositConfirmContainer = forwardRef<
  HTMLDivElement,
  DepositConfirmContainerProps
>(
  (
    {
      amount,
      destChain,
      feeToken,
      feeValue,
      fungibleTokenId,
      note,
      onResetState,
      resetMainComponent,
      sourceChain,
      wrappableTokenId,
    },
    ref
  ) => {
    const { api: txQueueApi, txPayloads } = useTxQueue();
    const [checked, setChecked] = useState(false);
    const { api, startNewTransaction } = useVAnchor();

    const [txId, setTxId] = useState('');

    const stage = useLatestTransactionStage('Deposit');

    const progress = useTransactionProgressValue(stage);

    const depositTxInProgress = useMemo(
      () => stage !== TransactionState.Ideal,
      [stage]
    );
    const { activeApi, activeChain, noteManager, apiConfig } = useWebContext();

    // Download for the deposit confirm
    const downloadNote = useCallback((note: Note) => {
      const noteStr = note.serialize();
      downloadString(
        JSON.stringify(noteStr),
        noteStr.slice(-noteStr.length) + '.json'
      );
    }, []);

    // Copy for the deposit confirm
    const { copy, isCopied } = useCopyable();
    const handleCopy = useCallback(
      (note: Note): void => copy(note.serialize()),
      [copy]
    );

    const fungibleToken = useMemo(() => {
      return new Currency(apiConfig.currencies[fungibleTokenId]);
    }, [apiConfig.currencies, fungibleTokenId]);

    const wrappableToken = useMemo(() => {
      if (!wrappableTokenId) {
        return;
      }

      return new Currency(apiConfig.currencies[wrappableTokenId]);
    }, [wrappableTokenId, apiConfig.currencies]);

    const wrappingFlow = useMemo(
      () => typeof wrappableTokenId !== 'undefined',
      [wrappableTokenId]
    );

    const handleExecuteDeposit = useCallback(async () => {
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
      if (depositTxInProgress) {
        startNewTransaction();
        resetMainComponent();
        return;
      }

      downloadNote(note);

      const {
        amount,
        denomination,
        sourceChainId: sourceTypedChainId,
        targetChainId: destTypedChainId,
        sourceIdentifyingData,
        tokenSymbol,
      } = note.note;

      // Calculate the amount
      const formattedAmount = ethers.utils.formatUnits(amount, denomination);

      // Get the deposit token symbol
      let srcTokenSymbol = tokenSymbol;

      if (wrappableToken) {
        srcTokenSymbol = wrappableToken.view.symbol;
      }

      // Get the destination token symbol
      const destToken = tokenSymbol;

      const currency = apiConfig.getCurrencyBySymbol(tokenSymbol);
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
      });

      setTxId(tx.id);

      try {
        txQueueApi.registerTransaction(tx);
        const args = await api?.prepareTransaction(
          tx,
          note,
          wrappableToken?.getAddressOfChain(+sourceTypedChainId) ?? ''
        );
        if (!args) {
          return txQueueApi.cancelTransaction(tx.id);
        }

        // Add the note to the noteManager before transaction is sent.
        // This helps to safeguard the user.
        if (noteManager) {
          await noteManager.addNote(note);
        }

        const indexBeforeInsert =
          Number(await api.getNextIndex(+sourceTypedChainId, fungibleTokenId)) -
          1;

        const { transactionHash, receipt } = await api.transact(...args);

        const leaf = note.getLeaf();

        const noteIndex = await api.getLeafIndex(
          receipt ?? leaf,
          receipt ? note : indexBeforeInsert,
          sourceIdentifyingData
        );

        const indexedNote = await Note.deserialize(note.serialize());
        indexedNote.mutateIndex(noteIndex.toString());
        await noteManager?.addNote(indexedNote);
        await noteManager?.removeNote(note);

        // Notification Success Transaction
        tx.txHash = transactionHash;
        tx.next(TransactionState.Done, {
          txHash: transactionHash,
          outputNotes: [indexedNote],
        });
      } catch (error: any) {
        console.error(error);
        noteManager?.removeNote(note);
        tx.txHash = getTransactionHash(error);
        tx.fail(getErrorMessage(error));
        captureSentryException(error, 'transactionType', 'deposit');
      } finally {
        resetMainComponent();
        onResetState?.();
      }
    }, [
      api,
      activeApi,
      activeChain,
      depositTxInProgress,
      downloadNote,
      note,
      wrappableToken,
      apiConfig,
      startNewTransaction,
      resetMainComponent,
      txQueueApi,
      noteManager,
      fungibleTokenId,
      onResetState,
    ]);

    const activeChains = useMemo<string[]>(() => {
      if (!activeApi) {
        return [];
      }

      return Array.from(
        Object.values(activeApi.state.getBridgeOptions())
          .reduce((acc, bridge) => {
            const chains = Object.keys(bridge.targets).map(
              (presetTypeChainId) => {
                const chain = chainsPopulated[Number(presetTypeChainId)];
                return chain;
              }
            );

            chains.forEach((chain) => acc.add(chain.name));

            return acc;
          }, new Set<string>())
          .values()
      );
    }, [activeApi]);

    const cardTitle = useMemo(() => {
      return getCardTitle(stage, wrappingFlow).trim();
    }, [stage, wrappingFlow]);

    const txStatusMessage = useMemo(() => {
      if (!txId) {
        return '';
      }

      const txPayload = txPayloads.find((txPayload) => txPayload.id === txId);
      return txPayload ? txPayload.txStatus.message?.replace('...', '') : '';
    }, [txId, txPayloads]);

    return (
      <DepositConfirm
        title={cardTitle}
        activeChains={activeChains}
        ref={ref}
        note={note.note.serialize()}
        progress={progress}
        actionBtnProps={{
          isDisabled: depositTxInProgress ? false : !checked,
          children: depositTxInProgress
            ? 'Make Another Transaction'
            : wrappingFlow
            ? 'Wrap And Deposit'
            : 'Deposit',
          onClick: handleExecuteDeposit,
        }}
        checkboxProps={{
          isChecked: checked,
          isDisabled: depositTxInProgress,
          onChange: () => setChecked((prev) => !prev),
        }}
        isCopied={isCopied}
        onCopy={() => handleCopy(note)}
        onDownload={() => downloadNote(note)}
        amount={amount}
        wrappingAmount={String(amount)}
        fungibleTokenSymbol={fungibleToken.view.symbol}
        sourceChain={sourceChain}
        destChain={destChain}
        fee={feeValue ?? 0}
        feeToken={feeToken}
        wrappableTokenSymbol={wrappableToken?.view.symbol}
        txStatusMessage={txStatusMessage}
        onClose={() => resetMainComponent()}
      />
    );
  }
);
