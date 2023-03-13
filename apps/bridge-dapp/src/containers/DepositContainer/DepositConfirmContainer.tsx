import {
  Currency,
  NewNotesTxResult,
  Transaction,
  TransactionState,
} from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { downloadString } from '@webb-tools/browser-utils';
import { VAnchor__factory } from '@webb-tools/contracts';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { useTxQueue, useVAnchor } from '@webb-tools/react-hooks';
import { Note } from '@webb-tools/sdk-core';
import { Web3Provider } from '@webb-tools/web3-api-provider';
import { DepositConfirm, useCopyable } from '@webb-tools/webb-ui-components';
import { ethers } from 'ethers';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import {
  getCardTitle,
  getErrorMessage,
  getTokenURI,
  getTransactionHash,
} from '../../utils';

import {
  useLatestTransactionStage,
  useTransactionProgressValue,
} from '../../hooks';
import { DepositConfirmContainerProps } from './types';

export const DepositConfirmContainer = forwardRef<
  HTMLDivElement,
  DepositConfirmContainerProps
>(
  (
    {
      note,
      amount,
      sourceChain,
      destChain,
      fungibleTokenId,
      wrappableTokenId,
      resetMainComponent,
      onResetState,
    },
    ref
  ) => {
    const { api: txQueueApi } = useTxQueue();
    const [checked, setChecked] = useState(false);
    const { api, startNewTransaction } = useVAnchor();

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
        sourceIdentifyingData,
        targetChainId: destTypedChainId,
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

        const receipt = await api.transact(...args);

        const srcContract = VAnchor__factory.connect(
          sourceIdentifyingData,
          Web3Provider.fromUri(activeChain.url).intoEthersProvider()
        );

        // TODO: Make this parse the receipt for the index data
        const noteIndex = (await srcContract.getNextIndex()) - 1;
        const indexedNote = await Note.deserialize(note.serialize());
        indexedNote.mutateIndex(noteIndex.toString());
        await noteManager?.addNote(indexedNote);
        await noteManager?.removeNote(note);

        // Notification Success Transaction
        tx.txHash = receipt.transactionHash;
        tx.next(TransactionState.Done, {
          txHash: receipt.transactionHash,
          outputNotes: [indexedNote],
        });
      } catch (error) {
        console.error(error);
        noteManager?.removeNote(note);
        tx.txHash = getTransactionHash(error);
        tx.fail(getErrorMessage(error));
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
            ? 'New Transaction'
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
        sourceChain={sourceChain?.name}
        destChain={destChain?.name}
        fee={0}
        wrappableTokenSymbol={wrappableToken?.view.symbol}
        onClose={() => resetMainComponent()}
      />
    );
  }
);
