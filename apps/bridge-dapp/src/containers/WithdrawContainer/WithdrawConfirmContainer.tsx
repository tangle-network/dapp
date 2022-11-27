import { useWebContext } from '@webb-tools/api-provider-environment';
import { downloadString } from '@webb-tools/browser-utils';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { useRelayers, useWithdraw } from '@webb-tools/react-hooks';
import { ChainType } from '@webb-tools/sdk-core';
import { useCopyable } from '@webb-tools/ui-hooks';
import { useWebbUI, WithdrawConfirm } from '@webb-tools/webb-ui-components';
import { forwardRef, useCallback, useMemo, useState } from 'react';
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
      setTxPayload,
      governedCurrency: governedCurrencyProp,
      unwrapCurrency,
      recipient,
    },
    ref
  ) => {
    const { value: governedCurrency } = governedCurrencyProp;

    const { withdraw } = useWithdraw({
      amount: amount,
      notes: availableNotes,
      recipient: recipient,
      unwrapTokenAddress:
        unwrapCurrency?.value.getAddressOfChain(targetChainId),
    });
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

    return (
      <WithdrawConfirm
        ref={ref}
        actionBtnProps={{
          isDisabled: changeAmount ? !checked : false,
          isLoading: isWithdrawing,
          loadingText: 'Withdrawing...',
          onClick: async () => {
            setIsWithdrawing(true);
            const successfulWithdraw = await withdraw();
            if (successfulWithdraw) {
              setIsWithdrawing(false);
              setMainComponent(undefined);
            }
          },
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
        progress={null}
        recipientAddress={recipient}
        relayerAddress={activeRelayer?.beneficiary}
        relayerExternalUrl={activeRelayer?.endpoint}
        relayerAvatarTheme={avatarTheme}
        governedTokenSymbol={governedCurrency.view.symbol}
        wrappableTokenSymbol={unwrapCurrency?.value.view.symbol}
      />
    );
  }
);
