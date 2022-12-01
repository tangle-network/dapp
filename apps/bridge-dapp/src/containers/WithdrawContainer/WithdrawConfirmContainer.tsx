import { useWebContext } from '@webb-tools/api-provider-environment';
import { downloadString } from '@webb-tools/browser-utils';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { TransactionState } from '@webb-tools/dapp-types';
import { ChainIcon, WalletLineIcon } from '@webb-tools/icons';
import { useRelayers, useWithdraw } from '@webb-tools/react-hooks';
import { ChainType } from '@webb-tools/sdk-core';
import { useCopyable } from '@webb-tools/ui-hooks';
import { useWebbUI, WithdrawConfirm } from '@webb-tools/webb-ui-components';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { useTransactionProgressValue } from '../../hooks';
import { WithdrawConfirmContainerProps } from './types';

export const WithdrawConfirmContainer = forwardRef<
  HTMLDivElement,
  WithdrawConfirmContainerProps
>(
  (
    {
      changeNote,
      availableNotes,
      amount,
      changeAmount,
      fees,
      targetChainId,
      governedCurrency: governedCurrencyProp,
      unwrapCurrency: { value: unwrapCurrency } = {},
      recipient,
    },
    ref
  ) => {
    const { value: governedCurrency } = governedCurrencyProp;

    const { withdraw, stage, setStage } = useWithdraw({
      amount: amount,
      notes: availableNotes,
      recipient: recipient,
      unwrapTokenAddress: unwrapCurrency?.getAddressOfChain(targetChainId),
    });

    const progressValue = useTransactionProgressValue(stage);

    const { setMainComponent } = useWebbUI();

    const { activeApi } = useWebContext();

    const {
      relayersState: { activeRelayer },
    } = useRelayers({
      typedChainId: targetChainId,
      target: activeApi?.state.activeBridge
        ? activeApi.state.activeBridge.targets[targetChainId]
        : undefined,
    });

    const [checked, setChecked] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);

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

    // Copy for the deposit confirm
    const { copy } = useCopyable();
    const handleCopy = useCallback(
      (note: string | undefined): void => {
        copy(note ?? '');
      },
      [copy]
    );

    // Download for the deposit confirm
    const downloadNote = useCallback((note: string) => {
      downloadString(note, note.slice(-note.length - 10) + '.txt');
    }, []);

    const avatarTheme = useMemo(() => {
      return chainsPopulated[targetChainId].chainType === ChainType.EVM
        ? 'ethereum'
        : 'substrate';
    }, [targetChainId]);

    // The main action onClick handler
    const onClick = useCallback(async () => {
      if (isWithdrawing) {
        setMainComponent(undefined);
        return;
      }

      setIsWithdrawing(true);

      if (changeNote) {
        downloadNote(changeNote);
      }

      const successfulWithdraw = await withdraw();

      if (successfulWithdraw) {
        setStage(TransactionState.Done);
        setMainComponent(undefined);
      } else {
        setStage(TransactionState.Failed);
      }

      setIsWithdrawing(false);
    }, [
      amount,
      changeNote,
      downloadNote,
      governedCurrency.view.symbol,
      isWithdrawing,
      setMainComponent,
      setStage,
      targetChainId,
      unwrapCurrency?.view.symbol,
      withdraw,
    ]);

    return (
      <WithdrawConfirm
        ref={ref}
        activeChains={activeChains}
        actionBtnProps={{
          isDisabled: changeAmount ? !checked : false,
          children: isWithdrawing ? 'New Transaction' : 'Withdraw',
          onClick,
        }}
        checkboxProps={{
          isChecked: checked,
          children: 'I have copy the change note',
          onChange: () => setChecked((prev) => !prev),
        }}
        onCopy={() => handleCopy(changeNote)}
        onDownload={() => downloadNote(changeNote ?? '')}
        amount={amount}
        fee={fees}
        onClose={() => setMainComponent(undefined)}
        note={changeNote}
        changeAmount={changeAmount}
        progress={progressValue}
        recipientAddress={recipient}
        relayerAddress={activeRelayer?.beneficiary}
        relayerExternalUrl={activeRelayer?.endpoint}
        relayerAvatarTheme={avatarTheme}
        governedTokenSymbol={governedCurrency.view.symbol}
        wrappableTokenSymbol={unwrapCurrency?.view.symbol}
      />
    );
  }
);
