import { txpayment } from '@polkadot/types/interfaces/definitions';
import { NewNotesTxResult, Transaction } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { downloadString } from '@webb-tools/browser-utils';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { TransactionState } from '@webb-tools/dapp-types';
import { useVAnchor } from '@webb-tools/react-hooks';
import { calculateTypedChainId, Note } from '@webb-tools/sdk-core';
import { useCopyable } from '@webb-tools/ui-hooks';
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
      wrappedAsset,
      token,
      sourceChain,
      destChain,
      wrappableTokenSymbol,
    },
    ref
  ) => {
    const wrappingFlow = Boolean(wrappedAsset);
    const [checked, setChecked] = useState(false);
    const { api, stage, startNewTransaction } = useVAnchor();
    const { setMainComponent, notificationApi } = useWebbUI();
    const [progress, setProgress] = useState<null | number>(null);

    const depositTxInProgress = useMemo(
      () => stage !== TransactionState.Ideal,
      [stage]
    );
    const { activeApi, activeAccount, activeChain, noteManager } = useWebContext();
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

    const currentWebbToken = useMemo(() => {
      if (!activeApi || !activeChain) return;

      return activeApi.state.activeBridge?.currency.getAddress(
        calculateTypedChainId(activeChain.chainType, activeChain.chainId)
      );
    }, [activeApi, activeChain]);

    const onClickExecuteDeposit = useCallback(async () => {
      if (!api || !activeApi || !activeAccount || !activeChain || !currentWebbToken) return;

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
          sourceChainId,
          sourceIdentifyingData,
          targetChainId,
          tokenSymbol,
        } = note.note;
        // Calculate the amount
        const formattedAmount = ethers.utils.formatUnits(amount, denomination);

        // Get the deposit token symbol
        let srcToken = tokenSymbol;
        console.log('wrappedAsset', wrappedAsset)
        if (wrappedAsset) {
          const currencyFromConfig = activeApi?.config.getCurrencyByAddress(wrappedAsset);
          if (!currencyFromConfig) {
            throw new Error('Token not found in the api config');
          }

          srcToken = currencyFromConfig.symbol;
        }

        // Get the destination token symbol
        const destToken = tokenSymbol;
        const tx = Transaction.new<NewNotesTxResult>('Deposit', {
          amount: +formattedAmount,
          tokens: [srcToken, destToken],
          wallets: {
            src: +sourceChainId,
            dest: +targetChainId,
          },
          token: tokenSymbol,
        });
        const args = await api?.prepareTransaction(tx, note, wrappedAsset);
        if (args) {
          await api.transact(...args);
        }
      } catch (error) {
        console.log('Deposit error', error);
        notificationApi(DEPOSIT_FAILURE_MSG);
      } finally {
        setMainComponent(undefined);
      }
    }, [
      api,
      note,
      wrappedAsset,
      activeApi,
      activeChain,
      activeAccount,
      currentWebbToken,
      downloadNote,
      depositTxInProgress,
      notificationApi,
      setMainComponent,
      startNewTransaction,
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
        wrappableTokenSymbol={wrappableTokenSymbol}
      />
    );
  }
);
