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
      resetMainComponent,
    },
    ref
  ) => {
    const [checked, setChecked] = useState(false);

    const { deposit, stage, startNewTransaction } = useBridgeDeposit();

    const { notificationApi } = useWebbUI();

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
        resetMainComponent();
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
        resetMainComponent();
      }
    }, [
      deposit,
      depositPayload,
      downloadNote,
      depositTxInProgress,
      notificationApi,
      resetMainComponent,
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
      let status = '';

      switch (stage) {
        case TransactionState.Ideal: {
          break;
        }

        case TransactionState.Done: {
          status = 'Completed';
          break;
        }

        case TransactionState.Failed: {
          status = 'Failed';
          break;
        }

        default: {
          status = 'In-Progress';
          break;
        }
      }

      if (wrappingFlow) {
        if (
          status !== 'Completed' &&
          status !== 'Failed' &&
          status !== 'In-Progress'
        ) {
          return `Confirm Wrap and Deposit`;
        } else {
          return `Wrap and Deposit ${status}`;
        }
      } else if (
        status !== 'Completed' &&
        status !== 'Failed' &&
        status !== 'In-Progress'
      ) {
        return `Confirm Deposit`;
      } else {
        return `Deposit ${status}`;
      }
    }, [stage, wrappingFlow]);

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
        title={cardTitle.trim()}
        activeChains={activeChains}
        ref={ref}
        note={depositPayload.note.serialize()}
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
        onCopy={() => handleCopy(depositPayload)}
        onDownload={() => downloadNote(depositPayload)}
        amount={amount}
        wrappingAmount={String(amount)}
        fungibleTokenSymbol={token?.symbol}
        sourceChain={sourceChain?.name}
        destChain={destChain?.name}
        fee={0}
        onClose={() => resetMainComponent()}
        wrappableTokenSymbol={wrappableTokenSymbol}
      />
    );
  }
);
