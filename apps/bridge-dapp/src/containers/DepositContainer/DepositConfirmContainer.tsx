import { DepositPayload } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { downloadString } from '@webb-tools/browser-utils';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { TransactionState } from '@webb-tools/dapp-types';
import { useBridgeDeposit } from '@webb-tools/react-hooks';
import { useCopyable } from '@webb-tools/ui-hooks';
import { DepositConfirm, useWebbUI } from '@webb-tools/webb-ui-components';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { DepositConfirmContainerProps } from './types';

export const DepositConfirmContainer = forwardRef<
  HTMLDivElement,
  DepositConfirmContainerProps
>(
  (
    {
      depositPayload,
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

    const { deposit, stage, startNewTransaction } = useBridgeDeposit();
    const { setMainComponent, notificationApi } = useWebbUI();
    const [progress, setProgress] = useState<null | number>(null);
    const depositTxInProgress = useMemo(
      () => stage !== TransactionState.Ideal,
      [stage]
    );
    const { activeApi } = useWebContext();
    // Download for the deposit confirm
    const downloadNote = useCallback((depositPayload: DepositPayload) => {
      const note = depositPayload?.note?.serialize() ?? '';
      downloadString(JSON.stringify(note), note.slice(-note.length) + '.json');
    }, []);

    // Copy for the deposit confirm
    const { copy, isCopied } = useCopyable();
    const handleCopy = useCallback(
      (depositPayload: DepositPayload): void => {
        copy(depositPayload.note.serialize() ?? '');
      },
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
        downloadNote(depositPayload);
        await deposit(depositPayload);
      } catch (error) {
        console.log('Deposit error', error);
        notificationApi({
          variant: 'error',
          message: 'Deposit failed',
          secondaryMessage: 'Something went wrong when depositing',
        });
      } finally {
        setMainComponent(undefined);
      }
    }, [
      amount,
      deposit,
      depositPayload,
      destChain?.symbol,
      downloadNote,
      depositTxInProgress,
      notificationApi,
      setMainComponent,
      sourceChain?.symbol,
      token?.symbol,
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

    // Effect to update the progress bar
    useEffect(() => {
      switch (stage) {
        case TransactionState.FetchingFixtures: {
          setProgress(0);
          break;
        }

        case TransactionState.FetchingLeaves: {
          setProgress(25);
          break;
        }
        case TransactionState.Intermediate: {
          setProgress(40);
          break;
        }

        case TransactionState.GeneratingZk: {
          setProgress(50);
          break;
        }

        case TransactionState.SendingTransaction: {
          setProgress(75);
          break;
        }

        case TransactionState.Done:
        case TransactionState.Failed: {
          setProgress(100);
          break;
        }

        case TransactionState.Cancelling:
        case TransactionState.Ideal: {
          setProgress(null);
          break;
        }

        default: {
          throw new Error(
            'Unknown transaction state in DepositConfirmContainer component'
          );
        }
      }
    }, [stage, setProgress]);

    return (
      <DepositConfirm
        title={
          depositTxInProgress
            ? wrappingFlow
              ? 'Wrap and deposit in progress'
              : 'Deposit in Progress'
            : undefined
        }
        activeChains={activeChains}
        ref={ref}
        note={depositPayload.note.serialize()}
        progress={progress}
        actionBtnProps={{
          isDisabled: !checked,
          children: depositTxInProgress
            ? 'New Transaction'
            : wrappingFlow
            ? 'Wrap And Deposit'
            : 'Deposit',
          onClick,
        }}
        checkboxProps={{
          isChecked: checked,
          onChange: () => setChecked((prev) => !prev),
        }}
        isCopied={isCopied}
        onCopy={() => handleCopy(depositPayload)}
        onDownload={() => downloadNote(depositPayload)}
        amount={amount}
        wrappingAmount={String(amount)}
        governedTokenSymbol={token?.symbol}
        sourceChain={sourceChain?.name}
        destChain={destChain?.name}
        fee={0}
        onClose={() => setMainComponent(undefined)}
        wrappableTokenSymbol={wrappableTokenSymbol}
      />
    );
  }
);
