import { useWebContext } from '@webb-tools/api-provider-environment';
import { downloadString } from '@webb-tools/browser-utils';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { useRelayers, useTxQueue, useVAnchor } from '@webb-tools/react-hooks';
import { ChainType, Note } from '@webb-tools/sdk-core';
import { useCopyable } from '@webb-tools/ui-hooks';
import { WithdrawConfirm, useWebbUI } from '@webb-tools/webb-ui-components';
import { forwardRef, useCallback, useMemo, useState } from 'react';

import {
  NewNotesTxResult,
  Transaction,
  TransactionState,
} from '@webb-tools/abstract-api-provider';
import {
  useLatestTransactionStage,
  useTransactionProgressValue,
} from '../../hooks';
import { WithdrawConfirmContainerProps } from './types';

export const WithdrawConfirmContainer = forwardRef<
  HTMLDivElement,
  WithdrawConfirmContainerProps
>(
  (
    {
      changeNote: changeNoteStr,
      availableNotes,
      amount,
      changeAmount,
      fees,
      targetChainId,
      fungibleCurrency: fungibleCurrencyProp,
      unwrapCurrency: { value: unwrapCurrency } = {},
      recipient,
    },
    ref
  ) => {
    const { value: fungibleCurrency } = fungibleCurrencyProp;

    const stage = useLatestTransactionStage('Withdraw');

    const { api: vAnchorApi } = useVAnchor();

    const progressValue = useTransactionProgressValue(stage);

    const { setMainComponent } = useWebbUI();

    const { activeApi, noteManager } = useWebContext();

    const { api: txQueueApi } = useTxQueue();

    const {
      relayersState: { activeRelayer },
    } = useRelayers({
      typedChainId: targetChainId,
      target: activeApi?.state.activeBridge
        ? activeApi.state.activeBridge.targets[targetChainId]
        : undefined,
    });

    const [checked, setChecked] = useState(false);

    const withdrawTxInProgress = useMemo(() => {
      return stage !== TransactionState.Ideal;
    }, [stage]);

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
    const { copy, isCopied } = useCopyable();
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

      return unwrapCurrency
        ? `Unwrap and Withdraw ${status}`
        : `Withdraw ${status}`;
    }, [stage, unwrapCurrency]);

    // The main action onClick handler
    const handleExecuteWithdraw = useCallback(async () => {
      if (availableNotes.length === 0 || !vAnchorApi) {
        return;
      }

      if (withdrawTxInProgress) {
        setMainComponent(undefined);
        return;
      }

      changeNoteStr && downloadNote(changeNoteStr);

      const note: Note = availableNotes[0];
      const {
        sourceChainId: sourceTypedChainId,
        targetChainId: destTypedChainId,
        tokenSymbol,
      } = note.note;

      const unwrapTokenSymbol = unwrapCurrency?.view.symbol ?? tokenSymbol;

      const tx = Transaction.new<NewNotesTxResult>('Withdraw', {
        amount,
        tokens: [tokenSymbol, unwrapTokenSymbol],
        wallets: {
          src: +sourceTypedChainId,
          dest: +destTypedChainId,
        },
        token: tokenSymbol,
      });

      try {
        txQueueApi.registerTransaction(tx);

        const args = await vAnchorApi.prepareTransaction(
          tx,
          {
            notes: availableNotes,
            recipient,
            amount,
          },
          unwrapCurrency?.getAddressOfChain(+destTypedChainId) ?? ''
        );

        // Add the change note before sending the tx
        if (changeNoteStr) {
          noteManager?.addNote(await Note.deserialize(changeNoteStr));
        }

        const receipt = await vAnchorApi.transact(...args);

        const outputNotes = changeNoteStr
          ? [await Note.deserialize(changeNoteStr)]
          : [];

        // Notification Success Transaction
        tx.txHash = receipt.transactionHash;
        tx.next(TransactionState.Done, {
          txHash: receipt.transactionHash,
          outputNotes,
        });

        // Cleanup NoteAccount state
        for (const note of availableNotes) {
          await noteManager?.removeNote(note);
        }
      } catch (error) {
        console.log('Error while executing withdraw', error);
        changeNoteStr &&
          (await noteManager?.removeNote(
            await Note.deserialize(changeNoteStr)
          ));

        if (error instanceof Error) {
          tx.fail(error['message' ?? '']);
        }
      } finally {
        setMainComponent(undefined);
      }
    }, [
      availableNotes,
      vAnchorApi,
      withdrawTxInProgress,
      setMainComponent,
      changeNoteStr,
      downloadNote,
      unwrapCurrency,
      amount,
      txQueueApi,
      recipient,
      noteManager,
    ]);

    return (
      <WithdrawConfirm
        ref={ref}
        title={cardTitle}
        activeChains={activeChains}
        destChain={chainsPopulated[targetChainId]?.name}
        actionBtnProps={{
          isDisabled: withdrawTxInProgress
            ? false
            : changeAmount
            ? !checked
            : false,
          children: withdrawTxInProgress ? 'New Transaction' : 'Withdraw',
          onClick: handleExecuteWithdraw,
        }}
        checkboxProps={{
          isChecked: checked,
          isDisabled: withdrawTxInProgress,
          children: 'I have copy the change note',
          onChange: () => setChecked((prev) => !prev),
        }}
        isCopied={isCopied}
        onCopy={() => handleCopy(changeNoteStr)}
        onDownload={() => downloadNote(changeNoteStr ?? '')}
        amount={amount}
        fee={fees}
        onClose={() => setMainComponent(undefined)}
        note={changeNoteStr}
        changeAmount={changeAmount}
        progress={progressValue}
        recipientAddress={recipient}
        relayerAddress={activeRelayer?.beneficiary}
        relayerExternalUrl={activeRelayer?.endpoint}
        relayerAvatarTheme={avatarTheme}
        fungibleTokenSymbol={fungibleCurrency.view.symbol}
        wrappableTokenSymbol={unwrapCurrency?.view.symbol}
      />
    );
  }
);
