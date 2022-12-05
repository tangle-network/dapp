import { useWebContext } from '@webb-tools/api-provider-environment';
import { downloadString } from '@webb-tools/browser-utils';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { TransactionState } from '@webb-tools/dapp-types';
import { useTransfer } from '@webb-tools/react-hooks';
import { calculateTypedChainId, ChainType } from '@webb-tools/sdk-core';
import { TransferConfirm, useWebbUI } from '@webb-tools/webb-ui-components';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { TransferConfirmContainerProps } from './types';

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
      if (note) {
        downloadString(
          JSON.stringify(note),
          note.slice(-note.length) + '.json'
        );
      }

      await transfer();
    }, [note, transfer]);

    // Close the confirm modal if the transfer is successful or failed
    useEffect(() => {
      if (
        stage === TransactionState.Done ||
        stage === TransactionState.Failed
      ) {
        setMainComponent(undefined);
      }
    }, [setMainComponent, stage]);

    return (
      <TransferConfirm
        {...props}
        activeChains={activeChains}
        amount={amount}
        changeAmount={changeAmount}
        sourceChain={activeChain?.name}
        destChain={destChain.name}
        note={note}
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
          isLoading: isTransfering,
          loadingText: 'Transfering...',
          isDisabled: note ? !isChecked : false,
          onClick: onTransfer,
        }}
      />
    );
  }
);
