import {
  Currency,
  NewNotesTxResult,
  Transaction,
} from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { downloadString } from '@webb-tools/browser-utils';
import { VAnchor__factory } from '@webb-tools/contracts';
import { chainsPopulated, currenciesConfig } from '@webb-tools/dapp-config';
import { TransactionState } from '@webb-tools/dapp-types';
import { useTxQueue, useVAnchor } from '@webb-tools/react-hooks';
import { Note, calculateTypedChainId } from '@webb-tools/sdk-core';
import { useCopyable } from '@webb-tools/ui-hooks';
import { Web3Provider } from '@webb-tools/web3-api-provider';
import { DepositConfirm, useWebbUI } from '@webb-tools/webb-ui-components';
import { ethers } from 'ethers';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { DEPOSIT_FAILURE_MSG, getCardTitle } from '../../utils';
import { updateProgress } from '../../utils/setProgress';

import { DepositConfirmContainerProps } from './types';

export const DepositConfirmContainer = forwardRef<
  HTMLDivElement,
  DepositConfirmContainerProps
>(
  (
    {
      note,
      amount,
      token,
      sourceChain,
      destChain,
      fungibleTokenId,
      wrappedTokenId,
    },
    ref
  ) => {
    const { api: txQueueApi } = useTxQueue();
    const [checked, setChecked] = useState(false);
    const { api, stage, startNewTransaction } = useVAnchor();
    const { setMainComponent, notificationApi } = useWebbUI();
    const [progress, setProgress] = useState<null | number>(null);

    const depositTxInProgress = useMemo(
      () => stage !== TransactionState.Ideal,
      [stage]
    );
    const { activeApi, activeAccount, activeChain, noteManager } =
      useWebContext();
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
      return new Currency(currenciesConfig[fungibleTokenId]);
    }, [fungibleTokenId]);

    const wrappableToken = useMemo(() => {
      if (!wrappedTokenId) {
        return;
      }

      return new Currency(currenciesConfig[wrappedTokenId]);
    }, [wrappedTokenId]);

    const wrappingFlow = useMemo(
      () => typeof wrappedTokenId !== 'undefined',
      [wrappedTokenId]
    );

    const currentWebbToken = useMemo(() => {
      if (!activeApi || !activeChain) return;

      return activeApi.state.activeBridge?.currency.getAddress(
        calculateTypedChainId(activeChain.chainType, activeChain.chainId)
      );
    }, [activeApi, activeChain]);

    const onClickExecuteDeposit = useCallback(async () => {
      if (
        !api ||
        !activeApi ||
        !activeAccount ||
        !activeChain ||
        !currentWebbToken
      )
        return;

      // Set transaction payload for transaction processing card
      // Start a new transaction
      if (depositTxInProgress) {
        console.log('Start a new transaction');
        startNewTransaction();
        setMainComponent(undefined);
        return;
      }

      try {
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
        console.log('wrappableTokenSymbol', wrappableToken);

        if (wrappableToken) {
          srcTokenSymbol = wrappableToken.view.symbol;
        }

        // Get the destination token symbol
        const destToken = tokenSymbol;

        const tx = Transaction.new<NewNotesTxResult>('Deposit', {
          amount: +formattedAmount,
          tokens: [srcTokenSymbol, destToken],
          wallets: {
            src: +sourceTypedChainId,
            dest: +destTypedChainId,
          },
          token: tokenSymbol,
        });
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
        tx.next(TransactionState.Done, {
          txHash: receipt.transactionHash,
          outputNotes: [indexedNote],
        });
      } catch (error) {
        console.log('Deposit error', error);
        noteManager?.removeNote(note);
        notificationApi(DEPOSIT_FAILURE_MSG);
      } finally {
        setMainComponent(undefined);
      }
    }, [
      api,
      activeApi,
      activeAccount,
      activeChain,
      currentWebbToken,
      depositTxInProgress,
      startNewTransaction,
      setMainComponent,
      downloadNote,
      note,
      wrappableToken,
      txQueueApi,
      noteManager,
      notificationApi,
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

    // Effect to update the progress bar
    useEffect(() => {
      updateProgress(stage, setProgress);
    }, [stage, setProgress]);

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
          onClick: onClickExecuteDeposit,
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
        fungibleTokenSymbol={token?.symbol}
        sourceChain={sourceChain?.name}
        destChain={destChain?.name}
        fee={0}
        onClose={() => setMainComponent(undefined)}
        wrappableTokenSymbol={wrappableToken?.view.symbol}
      />
    );
  }
);
