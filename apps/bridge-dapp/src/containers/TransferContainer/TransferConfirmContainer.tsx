import { useWebContext } from '@webb-tools/api-provider-environment';
import { LoggerService } from '@webb-tools/app-util';
import { downloadString } from '@webb-tools/browser-utils';
import { chainsPopulated } from '@webb-tools/dapp-config';
import {
  NewNotesTxResult,
  Transaction,
  TransactionState,
  TransferTransactionPayloadType,
} from '@webb-tools/abstract-api-provider';
import { useTxQueue, useVAnchor } from '@webb-tools/react-hooks';
import { ChainType, Note, calculateTypedChainId } from '@webb-tools/sdk-core';
import { TransferConfirm, useWebbUI } from '@webb-tools/webb-ui-components';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { TransferConfirmContainerProps } from './types';
import { useLatestTransactionStage } from '../../hooks';
import { getErrorMessage } from '../../utils';

const logger = LoggerService.get('TransferConfirmContainer');

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
    note: changeNote,
    inputNotes,
    ...props
  }) => {
    // State for tracking the status of the change note checkbox
    const [isChecked, setIsChecked] = useState(false);

    const stage = useLatestTransactionStage('Transfer');

    const { api: vAnchorApi } = useVAnchor();

    // State for progress bar value
    const [progress, setProgress] = useState<null | number>(null);

    const { activeApi, activeChain, noteManager } = useWebContext();

    const { setMainComponent } = useWebbUI();

    const { api: txQueueApi } = useTxQueue();

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
    const handleTransferExecute = useCallback(async () => {
      if (inputNotes.length === 0) {
        logger.error('No input notes provided');
        return;
      }

      if (!vAnchorApi) {
        logger.error('No vAnchor API provided');
        return;
      }

      if (isTransfering) {
        setMainComponent(undefined);
        return;
      }

      if (changeNote) {
        downloadString(
          JSON.stringify(changeNote),
          changeNote.slice(changeNote.length - 10) + '.json'
        );
      }

      const note: Note = inputNotes[0];
      const {
        sourceChainId: sourceTypedChainId,
        targetChainId: destTypedChainId,
        tokenSymbol,
      } = note.note;

      const tx = Transaction.new<NewNotesTxResult>('Transfer', {
        amount,
        tokens: [tokenSymbol, tokenSymbol],
        wallets: {
          src: +sourceTypedChainId,
          dest: +destTypedChainId,
        },
        token: tokenSymbol,
      });

      try {
        txQueueApi.registerTransaction(tx);

        const txPayload: TransferTransactionPayloadType = {
          notes: inputNotes,
          destTypedChainId: calculateTypedChainId(
            destChain.chainType,
            destChain.chainId
          ),
          recipientPublicKey: recipient,
          amount,
        };

        const args = await vAnchorApi.prepareTransaction(tx, txPayload, '');

        // Add the change note before sending the tx
        if (changeNote) {
          noteManager?.addNote(await Note.deserialize(changeNote));
        }

        const receipt = await vAnchorApi.transact(...args);

        const outputNotes = changeNote
          ? [await Note.deserialize(changeNote)]
          : [];

        // Notification Success Transaction
        tx.txHash = receipt.transactionHash;
        tx.next(TransactionState.Done, {
          txHash: receipt.transactionHash,
          outputNotes,
        });

        // Cleanup NoteAccount state
        for (const note of inputNotes) {
          await noteManager?.removeNote(note);
        }
      } catch (error) {
        console.error('Error occured while transfering', error);

        changeNote &&
          (await noteManager?.removeNote(await Note.deserialize(changeNote)));

        tx.fail(getErrorMessage(error));
      } finally {
        setMainComponent(undefined);
      }
    }, [
      inputNotes,
      vAnchorApi,
      isTransfering,
      changeNote,
      amount,
      setMainComponent,
      txQueueApi,
      destChain.chainType,
      destChain.chainId,
      recipient,
      noteManager,
    ]);

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
    }, [stage]);

    return (
      <TransferConfirm
        {...props}
        title={isTransfering ? 'Transfer in Progress' : undefined}
        activeChains={activeChains}
        amount={amount}
        changeAmount={changeAmount}
        sourceChain={activeChain?.name}
        destChain={destChain.name}
        note={changeNote}
        progress={progress}
        recipientPublicKey={recipient}
        relayerAddress={relayer?.beneficiary}
        relayerExternalUrl={relayer?.endpoint}
        fungibleTokenSymbol={currency.view.symbol}
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
          isDisabled: changeNote ? !isChecked : false,
          onClick: handleTransferExecute,
          children: isTransfering ? 'New Transfer' : 'Transfer',
        }}
      />
    );
  }
);
