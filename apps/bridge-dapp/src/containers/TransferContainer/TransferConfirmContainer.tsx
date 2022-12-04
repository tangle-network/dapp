import { useWebContext } from '@webb-tools/api-provider-environment';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { TransactionState } from '@webb-tools/dapp-types';
import { ChainIcon } from '@webb-tools/icons';
import { useTransfer } from '@webb-tools/react-hooks';
import { calculateTypedChainId, ChainType } from '@webb-tools/sdk-core';
import { TransferConfirm, useWebbUI } from '@webb-tools/webb-ui-components';
import { forwardRef, useCallback, useMemo, useState } from 'react';
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
    setTxPayload,
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
      // Set transaction payload for transaction processing card
      setTxPayload((prev) => ({
        ...prev,
        id: !prev.id ? '1' : (parseInt(prev.id) + 1).toString(),
        amount: amount.toString(),
        timestamp: new Date(),
        method: 'Transfer',
        txStatus: {
          status: 'in-progress',
        },
        token: currency.view.symbol,
        tokens: [currency.view.symbol, currency.view.symbol],
        wallets: {
          src: <ChainIcon name={activeChain?.name ?? 'Unknown'} />,
          dist: <ChainIcon name={destChain.name} />,
        },
      }));

      await transfer();
    }, [
      activeChain?.name,
      amount,
      currency.view.symbol,
      destChain.name,
      setTxPayload,
      transfer,
    ]);

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
