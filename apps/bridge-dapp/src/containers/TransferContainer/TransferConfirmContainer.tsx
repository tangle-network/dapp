import {
  NewNotesTxResult,
  Transaction,
  TransactionState,
  TransferTransactionPayloadType,
} from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { LoggerService } from '@webb-tools/app-util';
import { downloadString } from '@webb-tools/browser-utils';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { useRelayers, useTxQueue, useVAnchor } from '@webb-tools/react-hooks';
import { ChainType, Note, calculateTypedChainId } from '@webb-tools/sdk-core';
import { TransferConfirm, useWebbUI } from '@webb-tools/webb-ui-components';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import {
  useLatestTransactionStage,
  useTransactionProgressValue,
} from '../../hooks';
import { getErrorMessage, getTokenURI, getTransactionHash } from '../../utils';
import { TransferConfirmContainerProps } from './types';

const logger = LoggerService.get('TransferConfirmContainer');

export const TransferConfirmContainer = forwardRef<
  HTMLDivElement,
  TransferConfirmContainerProps
>(
  (
    {
      amount,
      changeAmount,
      currency,
      destChain,
      recipient,
      relayer,
      note: changeNote,
      changeUtxo,
      transferUtxo,
      inputNotes,
      onResetState,
      ...props
    },
    ref
  ) => {
    // State for tracking the status of the change note checkbox
    const [isChecked, setIsChecked] = useState(false);

    const stage = useLatestTransactionStage('Transfer');

    const { api: vAnchorApi } = useVAnchor();

    const progress = useTransactionProgressValue(stage);

    const { activeApi, activeChain, apiConfig, noteManager } = useWebContext();

    const { setMainComponent } = useWebbUI();

    const { api: txQueueApi } = useTxQueue();

    const targetChainId = useMemo(
      () => calculateTypedChainId(destChain.chainType, destChain.chainId),
      [destChain]
    );

    const {
      relayersState: { activeRelayer },
    } = useRelayers({
      typedChainId: targetChainId,
      target: activeApi?.state.activeBridge
        ? activeApi.state.activeBridge.targets[targetChainId]
        : undefined,
    });

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
        txQueueApi.startNewTransaction();
        setMainComponent(undefined);
        return;
      }

      if (changeNote) {
        const changeNoteStr = changeNote.serialize();
        downloadString(
          JSON.stringify(changeNoteStr),
          changeNoteStr.slice(0, changeNoteStr.length - 10) + '.json'
        );
      }

      const note: Note = inputNotes[0];
      const {
        sourceChainId: sourceTypedChainId,
        targetChainId: destTypedChainId,
        tokenSymbol,
      } = note.note;

      const currency = apiConfig.getCurrencyBySymbol(tokenSymbol);
      if (!currency) {
        console.error(`Currency not found for symbol ${tokenSymbol}`);
        return;
      }
      const tokenURI = getTokenURI(currency, destTypedChainId);

      const tx = Transaction.new<NewNotesTxResult>('Transfer', {
        amount,
        tokens: [tokenSymbol, tokenSymbol],
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

        const txPayload: TransferTransactionPayloadType = {
          notes: inputNotes,
          changeUtxo,
          transferUtxo,
        };

        const args = await vAnchorApi.prepareTransaction(tx, txPayload, '');

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
        for (const note of inputNotes) {
          await noteManager?.removeNote(note);
        }
      } catch (error) {
        console.error('Error occured while transfering', error);

        changeNote && (await noteManager?.removeNote(changeNote));

        tx.txHash = getTransactionHash(error);
        tx.fail(getErrorMessage(error));
      } finally {
        setMainComponent(undefined);
        onResetState?.();
      }
    }, [
      inputNotes,
      vAnchorApi,
      isTransfering,
      changeNote,
      apiConfig,
      amount,
      txQueueApi,
      setMainComponent,
      changeUtxo,
      transferUtxo,
      activeRelayer,
      noteManager,
      onResetState,
    ]);

    return (
      <TransferConfirm
        {...props}
        ref={ref}
        title={isTransfering ? 'Transfer in Progress' : undefined}
        activeChains={activeChains}
        amount={amount}
        changeAmount={changeAmount}
        sourceChain={activeChain?.name}
        destChain={destChain.name}
        note={changeNote?.serialize()}
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
