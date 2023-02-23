import { useWebContext } from '@webb-tools/api-provider-environment';
import { downloadString } from '@webb-tools/browser-utils';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { useRelayers, useTxQueue, useVAnchor } from '@webb-tools/react-hooks';
import { ChainType, Note } from '@webb-tools/sdk-core';
import {
  WithdrawConfirm,
  useCopyable,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { forwardRef, useCallback, useMemo, useState } from 'react';

import {
  NewNotesTxResult,
  Transaction,
  TransactionState,
  WithdrawTransactionPayloadType,
} from '@webb-tools/abstract-api-provider';
import {
  useLatestTransactionStage,
  useTransactionProgressValue,
} from '../../hooks';
import { getErrorMessage, getTokenURI, getTransactionHash } from '../../utils';
import { WithdrawConfirmContainerProps } from './types';

export const WithdrawConfirmContainer = forwardRef<
  HTMLDivElement,
  WithdrawConfirmContainerProps
>(
  (
    {
      changeUtxo,
      changeNote,
      availableNotes,
      amount,
      changeAmount,
      fees,
      targetChainId,
      fungibleCurrency: fungibleCurrencyProp,
      unwrapCurrency: { value: unwrapCurrency } = {},
      onResetState,
      recipient,
      ...props
    },
    ref
  ) => {
    const { value: fungibleCurrency } = fungibleCurrencyProp;

    const stage = useLatestTransactionStage('Withdraw');

    const { api: vAnchorApi } = useVAnchor();

    const progressValue = useTransactionProgressValue(stage);

    const { setMainComponent } = useWebbUI();

    const { activeApi, apiConfig, noteManager } = useWebContext();

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
      downloadString(note, note.slice(0, note.length - 10) + '.json');
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
        txQueueApi.startNewTransaction();
        setMainComponent(undefined);
        return;
      }

      changeNote && downloadNote(changeNote.serialize());

      const note: Note = availableNotes[0];
      const {
        sourceChainId: sourceTypedChainId,
        targetChainId: destTypedChainId,
        tokenSymbol,
      } = note.note;

      const unwrapTokenSymbol = unwrapCurrency?.view.symbol ?? tokenSymbol;

      const currency = apiConfig.getCurrencyBySymbol(tokenSymbol);
      if (!currency) {
        console.error(`Currency not found for symbol ${tokenSymbol}`);
        return;
      }
      const tokenURI = getTokenURI(currency, destTypedChainId);

      const tx = Transaction.new<NewNotesTxResult>('Withdraw', {
        amount,
        tokens: [tokenSymbol, unwrapTokenSymbol],
        wallets: {
          src: +sourceTypedChainId,
          dest: +destTypedChainId,
        },
        token: tokenSymbol,
        tokenURI,
      });

      try {
        txQueueApi.registerTransaction(tx);

        // Add the change note before sending the tx
        if (changeNote) {
          noteManager?.addNote(changeNote);
        }

        const txPayload: WithdrawTransactionPayloadType = {
          notes: availableNotes,
          changeUtxo,
          recipient,
        };

        const args = await vAnchorApi.prepareTransaction(
          tx,
          txPayload,
          unwrapCurrency?.getAddressOfChain(+destTypedChainId) ?? ''
        );

        const outputNotes = changeNote ? [changeNote] : [];

        if (activeRelayer) {
          await vAnchorApi.transactWithRelayer(
            activeRelayer,
            args,
            outputNotes
          );
        } else {
          const receipt = await vAnchorApi.transact(...args);

          // Notification Success Transaction
          tx.txHash = receipt.transactionHash;
          tx.next(TransactionState.Done, {
            txHash: receipt.transactionHash,
            outputNotes,
          });
        }

        // Cleanup NoteAccount state
        for (const note of availableNotes) {
          await noteManager?.removeNote(note);
        }
      } catch (error) {
        console.log('Error while executing withdraw', error);

        changeNote && (await noteManager?.removeNote(changeNote));

        tx.txHash = getTransactionHash(error);
        tx.fail(getErrorMessage(error));
      } finally {
        setMainComponent(undefined);
        onResetState?.();
      }
    }, [
      availableNotes,
      vAnchorApi,
      withdrawTxInProgress,
      changeNote,
      downloadNote,
      unwrapCurrency,
      apiConfig,
      amount,
      txQueueApi,
      setMainComponent,
      changeUtxo,
      recipient,
      activeRelayer,
      noteManager,
      onResetState,
    ]);

    return (
      <WithdrawConfirm
        {...props}
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
          children: 'I have copied the change note',
          onChange: () => setChecked((prev) => !prev),
        }}
        isCopied={isCopied}
        onCopy={() => handleCopy(changeNote?.serialize())}
        onDownload={() => downloadNote(changeNote?.serialize() ?? '')}
        amount={amount}
        fee={fees}
        onClose={() => setMainComponent(undefined)}
        note={changeNote?.serialize()}
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
