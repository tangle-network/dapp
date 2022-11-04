import { DepositPayload } from '@webb-tools/abstract-api-provider';
import { downloadString } from '@webb-tools/browser-utils';
import { useBridgeDeposit } from '@webb-tools/react-hooks';
import { useCopyable } from '@webb-tools/ui-hooks';
import {
  DepositConfirm,
  getTokenRingValue,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import React, { forwardRef, useCallback, useState } from 'react';
import { DepositConfirmContainerProps } from './types';

export const DepositConfirmContainer = forwardRef<
  HTMLDivElement,
  DepositConfirmContainerProps
>(({ depositPayload, amount, token, sourceChain, destChain }, ref) => {
  const [checked, setChecked] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);

  const { deposit } = useBridgeDeposit();
  const { setMainComponent } = useWebbUI();

  // Download for the deposit confirm
  const downloadNote = useCallback((depositPayload: DepositPayload) => {
    const note = depositPayload?.note?.serialize() ?? '';
    downloadString(note, note.slice(-note.length - 10) + '.txt');
  }, []);

  // Copy for the deposit confirm
  const { copy } = useCopyable();
  const handleCopy = useCallback(
    (depositPayload: DepositPayload): void => {
      copy(depositPayload.note.serialize() ?? '');
    },
    [copy]
  );

  return (
    <DepositConfirm
      title={isDepositing ? 'Deposit in Progress' : undefined}
      ref={ref}
      note={depositPayload.note.serialize()}
      actionBtnProps={{
        isDisabled: !checked,
        isLoading: isDepositing,
        loadingText: 'Depositing...',
        onClick: async () => {
          setIsDepositing(true);
          downloadNote(depositPayload);
          await deposit(depositPayload);
          setIsDepositing(false);
          setMainComponent(undefined);
        },
      }}
      checkboxProps={{
        isChecked: checked,
        onChange: () => setChecked((prev) => !prev),
      }}
      onCopy={() => handleCopy(depositPayload)}
      onDownload={() => downloadNote(depositPayload)}
      amount={amount}
      token1Symbol={token?.symbol}
      sourceChain={getTokenRingValue(sourceChain.symbol)}
      destChain={getTokenRingValue(destChain.symbol)}
      fee={0}
      onClose={() => setMainComponent(undefined)}
    />
  );
});
