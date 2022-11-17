import { DepositPayload } from '@webb-tools/abstract-api-provider';
import { downloadString } from '@webb-tools/browser-utils';
import { TransactionState } from '@webb-tools/dapp-types';
import { TokenIcon } from '@webb-tools/icons';
import { useBridgeDeposit } from '@webb-tools/react-hooks';
import { useCopyable } from '@webb-tools/ui-hooks';
import {
  DepositConfirm,
  getTokenRingValue,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { forwardRef, useCallback, useEffect, useState } from 'react';
import { DepositConfirmContainerProps } from './types';

export const DepositConfirmContainer = forwardRef<
  HTMLDivElement,
  DepositConfirmContainerProps
>(
  (
    { depositPayload, amount, token, sourceChain, destChain, setTxPayload },
    ref
  ) => {
    const [checked, setChecked] = useState(false);
    const [isDepositing, setIsDepositing] = useState(false);
    const [progress, setProgress] = useState<number | null>(null);

    const { deposit, stage, setStage } = useBridgeDeposit();
    const { setMainComponent } = useWebbUI();

    // Download for the deposit confirm
    const downloadNote = useCallback((depositPayload: DepositPayload) => {
      const note = depositPayload?.note?.serialize() ?? '';
      downloadString(
        JSON.stringify(note),
        note.slice(-note.length - 10) + '.json'
      );
    }, []);

    // Copy for the deposit confirm
    const { copy } = useCopyable();
    const handleCopy = useCallback(
      (depositPayload: DepositPayload): void => {
        copy(depositPayload.note.serialize() ?? '');
      },
      [copy]
    );

    const onClick = useCallback(async () => {
      // Set transaction payload for transaction processing card
      setTxPayload((prev) => ({
        ...prev,
        id: prev.id ? '1' : (parseInt(prev.id!) + 1).toString(),
        amount: amount.toString(),
        timestamp: new Date(),
        method: 'Deposit',
        txStatus: {
          status: 'in-progress',
        },
        token: token?.symbol,
        tokens: [sourceChain?.symbol ?? 'default', destChain?.symbol ?? 'default'],
        wallets: {
          src: <TokenIcon name={sourceChain?.symbol || 'default'} />,
          dist: <TokenIcon name={destChain?.symbol || 'default'} />,
        },
      }));

      if (isDepositing) {
        setMainComponent(undefined);
      } else {
        setIsDepositing(true);
        downloadNote(depositPayload);
        await deposit(depositPayload);
        setStage(TransactionState.Done);
        setIsDepositing(false);
        setMainComponent(undefined);
        setStage(TransactionState.Ideal);
      }
    }, [amount, deposit, depositPayload, destChain?.symbol, downloadNote, isDepositing, setMainComponent, setStage, setTxPayload, sourceChain?.symbol, token?.symbol]);

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
        title={isDepositing ? 'Deposit in Progress' : undefined}
        ref={ref}
        note={depositPayload.note.serialize()}
        progress={progress}
        actionBtnProps={{
          isDisabled: !checked,
          children: isDepositing ? 'New Transaction' : 'Deposit',
          onClick,
        }}
        checkboxProps={{
          isChecked: checked,
          onChange: () => setChecked((prev) => !prev),
        }}
        onCopy={() => handleCopy(depositPayload)}
        onDownload={() => downloadNote(depositPayload)}
        amount={amount}
        governedTokenSymbol={token?.symbol}
        sourceChain={getTokenRingValue(sourceChain?.symbol || 'default')}
        destChain={getTokenRingValue(destChain?.symbol || 'default')}
        fee={0}
        onClose={() => setMainComponent(undefined)}
      />
    );
  }
);
