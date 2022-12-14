import { useWebContext } from '@webb-tools/api-provider-environment';
import { downloadString } from '@webb-tools/browser-utils';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { TransactionState } from '@webb-tools/dapp-types';
import { useTransfer } from '@webb-tools/react-hooks';
import { calculateTypedChainId, ChainType } from '@webb-tools/sdk-core';
import { TransferConfirm, useWebbUI } from '@webb-tools/webb-ui-components';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { TransferConfirmContainerProps } from './types';
import { LoggerService } from '@webb-tools/app-util';

const logger = LoggerService.get('ui');

export const TransferConfirmContainer = forwardRef<
  HTMLDivElement,
  TransferConfirmContainerProps
>(
  ({
    amount,
    changeAmount,
    currency,
    destChain,
    recipient,
    relayer,
    note,
    inputNotes,
    ...props
  }) => {
    // State for tracking the status of the change note checkbox
    const [isChecked, setIsChecked] = useState(false);

    // State for progress bar value
    const [progress, setProgress] = useState<null | number>(null);

    const { activeApi, activeChain } = useWebContext();

    const { setMainComponent } = useWebbUI();

    const transferHookArgs = useMemo(
      () => ({
        notes: inputNotes,
        destination: calculateTypedChainId(
          destChain.chainType,
          destChain.chainId
        ),
        recipient,
        amount,
      }),
      [amount, destChain, inputNotes, recipient]
    );

    // The transfer hook
    const { transfer, stage } = useTransfer(transferHookArgs);

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

    const isTransfering = useMemo(
      () => stage !== TransactionState.Ideal,
      [stage]
    );

    // The callback for the transfer button
    const onTransfer = useCallback(async () => {
      if (isTransfering) {
        setMainComponent(undefined);
        return;
      }

      if (note) {
        downloadString(
          JSON.stringify(note),
          note.slice(-note.length) + '.json'
        );
      }

      try {
        await transfer();
      } catch (error) {
        logger.error('Error occured while transfering', error);
      }
    }, [isTransfering, note, setMainComponent, transfer]);

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
      <TransferConfirm
        {...props}
        title={isTransfering ? 'Transfer in Progress' : undefined}
        activeChains={activeChains}
        amount={amount}
        changeAmount={changeAmount}
        sourceChain={activeChain?.name}
        destChain={destChain.name}
        note={note}
        progress={progress}
        recipientPublicKey={recipient}
        relayerAddress={relayer?.beneficiary}
        relayerExternalUrl={relayer?.endpoint}
        governedTokenSymbol={currency.view.symbol}
        relayerAvatarTheme={
          activeChain?.chainType === ChainType.EVM ? 'ethereum' : 'polkadot'
        }
        onClose={() => setMainComponent(undefined)}
        checkboxProps={{
          children: 'I have copied the change note',
          isChecked,
          onChange: () => setIsChecked((prev) => !prev),
        }}
        actionBtnProps={{
          isDisabled: note ? !isChecked : false,
          onClick: onTransfer,
          children: isTransfering ? 'New Transfer' : 'Transfer',
        }}
      />
    );
  }
);
