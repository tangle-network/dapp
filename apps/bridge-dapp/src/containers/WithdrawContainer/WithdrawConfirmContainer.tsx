import { useWebContext } from '@webb-tools/api-provider-environment';
import { downloadString } from '@webb-tools/browser-utils';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { useWithdraw } from '@webb-tools/react-hooks';
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
      webbToken,
      unwrapToken,
      relayer,
      recipient,
    },
    ref
  ) => {
    const { withdraw } = useWithdraw({
      amount: amount,
      notes: availableNotes,
      recipient: recipient,
    });
    const { setMainComponent } = useWebbUI();

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

    return (
      <WithdrawConfirm
        ref={ref}
        actionBtnProps={{
          isDisabled: !checked,
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
        relayerAddress={relayer?.account}
        relayerExternalUrl={relayer?.endpoint}
        governedTokenSymbol={webbToken.symbol}
        wrappableTokenSymbol={unwrapToken?.symbol}
      />
    );
  }
);
