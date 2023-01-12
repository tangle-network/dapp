import { txpayment } from '@polkadot/types/interfaces/definitions';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { downloadString } from '@webb-tools/browser-utils';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { TransactionState } from '@webb-tools/dapp-types';
import { useVAnchor } from '@webb-tools/react-hooks';
import { Note } from '@webb-tools/sdk-core';
import { useCopyable } from '@webb-tools/ui-hooks';
import { DepositConfirm, useWebbUI } from '@webb-tools/webb-ui-components';
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
      wrappingFlow,
      token,
      sourceChain,
      destChain,
      wrappableTokenSymbol,
    },
    ref
  ) => {
    const [checked, setChecked] = useState(false);
    const { api, stage, startNewTransaction } = useVAnchor();
    const { setMainComponent, notificationApi } = useWebbUI();
    const [progress, setProgress] = useState<null | number>(null);

    const depositTxInProgress = useMemo(
      () => stage !== TransactionState.Ideal,
      [stage]
    );
    const { activeApi } = useWebContext();
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

    const onClick = useCallback(async () => {
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
        const args = {
          tx: null,
          contractAddress: null,
          inputs: null,
          outputs: null,
          fee: null,
          refund: null,
          recipient: null,
          relayer: null,
          wrapUnwrapToken: null,
          leavesMap: null,
        };
        await api.transact(
          ...Object.values(args)
        );
      } catch (error) {
        console.log('Deposit error', error);
        notificationApi(DEPOSIT_FAILURE_MSG);
      } finally {
        setMainComponent(undefined);
      }
    }, [
      api,
      note,
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
          onClick,
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
