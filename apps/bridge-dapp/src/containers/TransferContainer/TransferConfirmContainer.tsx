import {
  NewNotesTxResult,
  Transaction,
  TransactionState,
  TransferTransactionPayloadType,
} from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { LoggerService } from '@webb-tools/app-util';
import { downloadString } from '@webb-tools/browser-utils';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config';
import { useRelayers, useVAnchor } from '@webb-tools/react-hooks';
import { ChainType, Note, calculateTypedChainId } from '@webb-tools/sdk-core';
import { isViemError } from '@webb-tools/web3-api-provider';
import {
  TransferConfirm,
  getRoundedAmountString,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { ContractFunctionRevertedError, formatEther } from 'viem';
import {
  useLatestTransactionStage,
  useTransactionProgressValue,
} from '../../hooks';
import {
  captureSentryException,
  getErrorMessage,
  getTokenURI,
  getTransactionHash,
} from '../../utils';
import { RecipientPublicKeyTooltipContent } from './shared';
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
      feeInWei: feeAmount,
      feeToken,
      ...props
    },
    ref
  ) => {
    // State for tracking the status of the change note checkbox
    const [isChecked, setIsChecked] = useState(false);

    const {
      api: vAnchorApi,
      addNoteToNoteManager,
      removeNoteFromNoteManager,
    } = useVAnchor();

    const { activeApi, activeChain, apiConfig, txQueue } = useWebContext();

    const { setMainComponent } = useWebbUI();

    const { api: txQueueApi, txPayloads } = txQueue;

    const [txId, setTxId] = useState('');

    const stage = useLatestTransactionStage(txId);

    const progress = useTransactionProgressValue(stage);

    const targetChainId = useMemo(
      () => calculateTypedChainId(destChain.chainType, destChain.id),
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

    const isTransfering = useMemo(
      () => stage !== TransactionState.Ideal,
      [stage]
    );

    // The callback for the transfer button
    const handleTransferExecute = useCallback(async () => {
      if (inputNotes.length === 0) {
        logger.error('No input notes provided');
        captureSentryException(
          new Error('No input notes provided'),
          'transactionType',
          'transfer'
        );
        return;
      }

      if (!vAnchorApi || !activeApi) {
        logger.error('No vAnchor API provided');
        captureSentryException(
          new Error('No vAnchor API provided'),
          'transactionType',
          'transfer'
        );
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

      const currency = apiConfig.getCurrencyBySymbolAndTypedChainId(
        tokenSymbol,
        +destTypedChainId
      );
      if (!currency) {
        console.error(`Currency not found for symbol ${tokenSymbol}`);
        captureSentryException(
          new Error(`Currency not found for symbol ${tokenSymbol}`),
          'transactionType',
          'transfer'
        );
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
        providerType: activeApi.type,
      });

      setTxId(tx.id);

      try {
        txQueueApi.registerTransaction(tx);

        // Add the change note before sending the tx
        if (changeNote) {
          await addNoteToNoteManager(changeNote);
        }

        const txPayload: TransferTransactionPayloadType = {
          notes: inputNotes,
          changeUtxo,
          transferUtxo,
          feeAmount: feeAmount ?? ZERO_BIG_INT,
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
          const transactionHash = await vAnchorApi.transact(...args);

          // Notification Success Transaction
          tx.txHash = transactionHash;
          tx.next(TransactionState.Done, {
            txHash: transactionHash,
            outputNotes,
          });
        }

        // Cleanup NoteAccount state
        for (const note of inputNotes) {
          await removeNoteFromNoteManager(note);
        }
      } catch (error) {
        console.error('Error occured while transfering', error);
        changeNote && (await removeNoteFromNoteManager(changeNote));
        tx.txHash = getTransactionHash(error);

        let errorMessage = getErrorMessage(error);
        if (isViemError(error)) {
          errorMessage = error.shortMessage;

          const revertError = error.walk(
            (err) => err instanceof ContractFunctionRevertedError
          );

          if (revertError instanceof ContractFunctionRevertedError) {
            errorMessage = revertError.reason ?? revertError.shortMessage;
          }
        }

        tx.fail(errorMessage);

        captureSentryException(error, 'transactionType', 'transfer');
      } finally {
        setMainComponent(undefined);
        onResetState?.();
      }
    }, [
      inputNotes,
      vAnchorApi,
      activeApi,
      isTransfering,
      changeNote,
      apiConfig,
      amount,
      txQueueApi,
      setMainComponent,
      changeUtxo,
      transferUtxo,
      feeAmount,
      activeRelayer,
      addNoteToNoteManager,
      removeNoteFromNoteManager,
      onResetState,
    ]);

    const txStatusMessage = useMemo(() => {
      if (!txId) {
        return '';
      }

      const txPayload = txPayloads.find((txPayload) => txPayload.id === txId);
      return txPayload ? txPayload.txStatus.message?.replace('...', '') : '';
    }, [txId, txPayloads]);

    const formattedFee = useMemo(() => {
      if (!feeAmount) {
        return undefined;
      }

      const amountNum = Number(formatEther(feeAmount));

      return getRoundedAmountString(amountNum, 3, {
        roundingFunction: Math.round,
      });
    }, [feeAmount]);

    return (
      <TransferConfirm
        {...props}
        ref={ref}
        title={isTransfering ? 'Transfer in Progress...' : undefined}
        amount={amount}
        changeAmount={changeAmount}
        sourceChain={{
          name: activeChain?.name ?? '',
          type: activeChain?.group ?? 'webb-dev',
        }}
        destChain={{
          name: destChain.name,
          type: destChain.group ?? 'webb-dev',
        }}
        note={changeNote?.serialize()}
        progress={progress}
        recipientTitleProps={{
          info: <RecipientPublicKeyTooltipContent />,
        }}
        recipientPublicKey={recipient}
        relayerAddress={relayer?.beneficiary}
        relayerExternalUrl={relayer?.endpoint}
        fungibleTokenSymbol={currency.view.symbol}
        relayerAvatarTheme={
          activeChain?.chainType === ChainType.EVM ? 'ethereum' : 'polkadot'
        }
        fee={formattedFee}
        feeToken={feeToken}
        onClose={() => setMainComponent(undefined)}
        checkboxProps={{
          children: 'I have copied the change note',
          isChecked,
          onChange: () => setIsChecked((prev) => !prev),
        }}
        actionBtnProps={{
          isDisabled: changeNote ? !isChecked : false,
          onClick: handleTransferExecute,
          children: isTransfering ? 'Make Another Transaction' : 'Transfer',
        }}
        txStatusMessage={txStatusMessage}
      />
    );
  }
);
