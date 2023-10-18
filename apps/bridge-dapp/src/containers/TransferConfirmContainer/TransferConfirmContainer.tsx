import {
  NewNotesTxResult,
  OptionalActiveRelayer,
  Transaction,
  TransactionState,
  TransferTransactionPayloadType,
} from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { LoggerService } from '@webb-tools/app-util';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import {
  useNoteAccount,
  useRelayers,
  useVAnchor,
} from '@webb-tools/react-hooks';
import { ChainType, calculateTypedChainId } from '@webb-tools/sdk-core';
import { ZERO_ADDRESS } from '@webb-tools/utils';
import { isViemError } from '@webb-tools/web3-api-provider';
import {
  TransferConfirm,
  getRoundedAmountString,
} from '@webb-tools/webb-ui-components';
import { forwardRef, useMemo, useState, type ComponentProps } from 'react';
import type { Hash } from 'viem';
import { ContractFunctionRevertedError, formatEther } from 'viem';
import { useEnqueueSubmittedTx } from '../../hooks';
import useInProgressTxInfo from '../../hooks/useInProgressTxInfo';
import {
  captureSentryException,
  getErrorMessage,
  getTokenURI,
  getTransactionHash,
  handleMutateNoteIndex,
  handleStoreNote,
} from '../../utils';
import { RecipientPublicKeyTooltipContent } from './shared';
import { TransferConfirmContainerProps } from './types';

const logger = LoggerService.get('TransferConfirmContainer');

const TransferConfirmContainer = forwardRef<
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
      onClose,
      feeInWei,
      feeToken,
      refundRecipient,
      refundAmount,
      refundToken,
      ...props
    },
    ref
  ) => {
    // State for tracking the status of the change note checkbox
    const [isChecked, setIsChecked] = useState(false);

    const { activeApi, activeChain } = useWebContext();

    const {
      cardTitle,
      currentStep,
      inProgressTxId,
      setInProgressTxId,
      setTotalStep,
      totalStep,
      txStatus,
      txStatusMessage,
    } = useInProgressTxInfo(
      false, // Wrap/unwrap doesn't support on transfer flow
      onResetState
    );

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

    const handleTransferExecute = useTransferExecuteHandler({
      activeRelayer,
      inputNotes,
      onResetState,
      amount,
      recipient,
      changeUtxo,
      feeInWei,
      transferUtxo,
      refundAmount,
      refundRecipient,
      note: changeNote,
      currency,
      inProgressTxId,
      setInProgressTxId,
      setTotalStep,
      targetTypedChainId: targetChainId,
    });

    const formattedFee = useMemo(() => {
      if (!feeInWei) {
        return undefined;
      }

      const amountNum = Number(formatEther(feeInWei));

      return getRoundedAmountString(amountNum, 3, {
        roundingFunction: Math.round,
      });
    }, [feeInWei]);

    return (
      <TransferConfirm
        {...props}
        className="min-h-[var(--card-height)]"
        ref={ref}
        title={cardTitle}
        totalProgress={totalStep}
        progress={currentStep}
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
        onClose={onClose}
        checkboxProps={{
          children: 'I have copied the change note',
          isChecked,
          onChange: () => setIsChecked((prev) => !prev),
        }}
        actionBtnProps={{
          isDisabled: changeNote ? !isChecked : false,
          onClick: handleTransferExecute,
          children:
            inProgressTxId.length > 0 ? 'Make Another Transaction' : 'Transfer',
        }}
        txStatusColor={
          txStatus === 'completed'
            ? 'green'
            : txStatus === 'warning'
            ? 'red'
            : undefined
        }
        txStatusMessage={txStatusMessage}
        refundAmount={
          typeof refundAmount === 'bigint'
            ? formatEther(refundAmount)
            : undefined
        }
        refundToken={refundToken}
      />
    );
  }
);

export default TransferConfirmContainer;

type Args = Pick<
  ComponentProps<typeof TransferConfirmContainer>,
  | 'inputNotes'
  | 'onResetState'
  | 'amount'
  | 'recipient'
  | 'changeUtxo'
  | 'feeInWei'
  | 'transferUtxo'
  | 'refundAmount'
  | 'refundRecipient'
  | 'note'
  | 'currency'
> &
  Pick<
    ReturnType<typeof useInProgressTxInfo>,
    'inProgressTxId' | 'setInProgressTxId' | 'setTotalStep'
  > & {
    activeRelayer: OptionalActiveRelayer;
    targetTypedChainId: number;
  };

const useTransferExecuteHandler = (args: Args) => {
  const {
    amount,
    changeUtxo,
    feeInWei: feeAmount,
    inProgressTxId,
    inputNotes,
    onResetState,
    recipient,
    refundAmount,
    refundRecipient,
    setInProgressTxId,
    setTotalStep,
    transferUtxo,
    note: changeNote,
    activeRelayer,
    currency,
    targetTypedChainId,
  } = args;

  const {
    activeApi,
    apiConfig,
    noteManager,
    activeChain,
    txQueue: { api: txQueueApi },
  } = useWebContext();

  const { addNoteToNoteManager, removeNoteFromNoteManager } = useVAnchor();

  const enqueueSubmittedTx = useEnqueueSubmittedTx();

  const { syncNotes } = useNoteAccount();

  return async () => {
    if (inputNotes.length === 0) {
      logger.error('No input notes provided');
      captureSentryException(
        new Error('No input notes provided'),
        'transactionType',
        'transfer'
      );
      return;
    }

    const vAnchorApi = activeApi?.methods.variableAnchor.actions.inner;

    if (!vAnchorApi || !activeApi || !activeChain) {
      logger.error('No vAnchor API provided');
      captureSentryException(
        new Error('No vAnchor API provided'),
        'transactionType',
        'transfer'
      );
      return;
    }

    if (inProgressTxId.length > 0) {
      txQueueApi.startNewTransaction();
      onResetState?.();
      return;
    }

    const tokenSymbol = currency.view.symbol;
    const srcTypedChainId = calculateTypedChainId(
      activeChain.chainType,
      activeChain.id
    );

    const destCurrency = apiConfig.getCurrencyBySymbolAndTypedChainId(
      tokenSymbol,
      +targetTypedChainId
    );
    if (!destCurrency) {
      console.error(`Currency not found for symbol ${tokenSymbol}`);
      captureSentryException(
        new Error(`Currency not found for symbol ${tokenSymbol}`),
        'transactionType',
        'transfer'
      );
      return;
    }
    const tokenURI = getTokenURI(destCurrency, targetTypedChainId.toString());

    const tx = Transaction.new<NewNotesTxResult>('Transfer', {
      amount,
      tokens: [tokenSymbol, tokenSymbol],
      wallets: {
        src: srcTypedChainId,
        dest: targetTypedChainId,
      },
      token: tokenSymbol,
      tokenURI,
      providerType: activeApi.type,
      address: noteManager?.getKeypair().toString(),
      recipient,
    });

    setInProgressTxId(tx.id);
    setTotalStep(tx.totalSteps);
    txQueueApi.registerTransaction(tx);

    try {
      const srcAnchorId = apiConfig.getAnchorIdentifier(
        currency.id,
        srcTypedChainId
      );

      const destAnchorId = apiConfig.getAnchorIdentifier(
        currency.id,
        targetTypedChainId
      );

      if (!srcAnchorId || !destAnchorId) {
        throw WebbError.from(WebbErrorCodes.AnchorIdNotFound);
      }

      const txPayload: TransferTransactionPayloadType = {
        notes: inputNotes,
        changeUtxo,
        transferUtxo,
        feeAmount: feeAmount ?? ZERO_BIG_INT,
        refundAmount: refundAmount ?? ZERO_BIG_INT,
        refundRecipient: refundRecipient ?? ZERO_ADDRESS,
      };

      const args = await vAnchorApi.prepareTransaction(tx, txPayload, '');

      console.log('args', args);

      const outputNotes = changeNote ? [changeNote] : [];

      let indexBeforeInsert: number | undefined;

      // Use for auto sync note if the recipient is the same as the sender
      const blockNumberBeforeInsert =
        activeApi.getBlockNumber() ?? ZERO_BIG_INT;

      if (changeNote) {
        const nextIdx = Number(
          await vAnchorApi.getNextIndex(srcTypedChainId, currency.id)
        );

        indexBeforeInsert = nextIdx === 0 ? nextIdx : nextIdx - 1;
      }

      let transactionHash: Hash;

      if (activeRelayer) {
        transactionHash = await vAnchorApi.transactWithRelayer(
          activeRelayer,
          args,
          outputNotes
        );

        await handleStoreNote(changeNote, addNoteToNoteManager);

        enqueueSubmittedTx(
          transactionHash,
          apiConfig.chains[srcTypedChainId],
          'transfer'
        );
      } else {
        transactionHash = await vAnchorApi.transact(...args);

        enqueueSubmittedTx(
          transactionHash,
          apiConfig.chains[srcTypedChainId],
          'transfer'
        );

        await handleStoreNote(changeNote, addNoteToNoteManager);

        await vAnchorApi.waitForFinalization(transactionHash);

        // Notification Success Transaction
        tx.next(TransactionState.Done, {
          txHash: transactionHash,
          outputNotes,
        });
      }

      if (typeof indexBeforeInsert === 'number' && changeNote) {
        const noteWithIdx = await handleMutateNoteIndex(
          vAnchorApi,
          transactionHash,
          changeNote,
          indexBeforeInsert,
          srcAnchorId
        );

        await removeNoteFromNoteManager(changeNote);
        await addNoteToNoteManager(noteWithIdx);
      }

      // Cleanup NoteAccount state
      for (const note of inputNotes) {
        await removeNoteFromNoteManager(note);
      }

      const isSendToSelf = recipient === noteManager?.getKeypair().toString();
      // Sync note to add the transfered note if the recipient is the same as the sender
      // This is to make sure the note is added to the note account
      if (isSendToSelf) {
        await syncNotes(undefined, undefined, blockNumberBeforeInsert);
      }
    } catch (error) {
      console.error('Error occured while transferring', error);
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
    }
  };
};
