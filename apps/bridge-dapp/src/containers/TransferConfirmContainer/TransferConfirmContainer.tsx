import {
  NewNotesTxResult,
  OptionalActiveRelayer,
  TransactionExecutor,
  TransactionState,
  TransferTransactionPayloadType,
} from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';
import { useTxClientStorage } from '@webb-tools/api-provider-environment/transaction';
import { getExplorerURI } from '@webb-tools/api-provider-environment/transaction/utils/getExplorerURI';
import { useBalancesFromNotes } from '@webb-tools/react-hooks/currency/useBalancesFromNotes';
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
import RelayerFeeDetails from '../../components/RelayerFeeDetails';
import { forwardRef, useMemo, useState, type ComponentProps } from 'react';
import type { Hash } from 'viem';
import { ContractFunctionRevertedError, formatEther } from 'viem';
import useEnqueueSubmittedTx from '../../hooks/useEnqueueSubmittedTx';
import useTransferFeeCalculation from '../../hooks/useTransferFeeCalculation';
import useInProgressTxInfo from '../../hooks/useInProgressTxInfo';
import {
  captureSentryException,
  getErrorMessage,
  getTokenURI,
  getTransactionHash,
  handleMutateNoteIndex,
  handleStoreNote,
  getNoteSerializations,
  getCurrentTimestamp,
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
      srcChain,
      destChain,
      recipient,
      relayer,
      activeChain,
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

    const { apiConfig, activeApi, noteManager } = useWebContext();

    const { balances } = useBalancesFromNotes();

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

    const srcTypedChainId = useMemo(
      () => calculateTypedChainId(srcChain.chainType, srcChain.id),
      [srcChain]
    );

    const targetChainId = useMemo(
      () => calculateTypedChainId(destChain.chainType, destChain.id),
      [destChain]
    );

    const poolAddress = useMemo(
      () => apiConfig.anchors[currency.id][targetChainId],
      [apiConfig, currency.id, targetChainId]
    );

    const blockExplorerUrl = useMemo(
      () => chainsConfig[targetChainId]?.blockExplorers?.default.url,
      [targetChainId]
    );

    const poolExplorerUrl = useMemo(() => {
      if (!blockExplorerUrl) return undefined;
      return getExplorerURI(
        blockExplorerUrl,
        poolAddress,
        'address',
        'web3'
      ).toString();
    }, [blockExplorerUrl, poolAddress]);

    const {
      relayersState: { activeRelayer },
    } = useRelayers({
      typedChainId: targetChainId,
      target: activeApi?.state.activeBridge
        ? activeApi.state.activeBridge.targets[targetChainId]
        : undefined,
    });

    const {
      gasFeeInfo,
      isLoading: isFeeLoading,
      relayerFeeInfo,
      totalFeeToken,
      totalFeeWei,
    } = useTransferFeeCalculation({
      activeRelayer,
      recipientErrorMsg: undefined,
      typedChainId: srcTypedChainId,
    });

    const gasFees = useMemo(
      () =>
        gasFeeInfo
          ? parseFloat(formatEther(gasFeeInfo).slice(0, 10))
          : undefined,
      [gasFeeInfo]
    );

    const relayerFees = useMemo(
      () =>
        relayerFeeInfo
          ? parseFloat(formatEther(relayerFeeInfo.estimatedFee).slice(0, 10))
          : undefined,
      [relayerFeeInfo]
    );

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
      blockExplorerUrl,
      relayerFees,
      gasFees,
      refundToken,
    });

    const newBalance = useMemo(() => {
      const currentBalance = balances?.[currency.id]?.[srcTypedChainId];
      if (!currentBalance) return undefined;
      const updatedBalance = Number(formatEther(currentBalance)) - amount;
      if (updatedBalance < 0) return undefined;
      return updatedBalance;
    }, [balances, currency.id, srcTypedChainId, amount]);

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
        note={changeNote?.serialize()}
        sourceTypedChainId={srcTypedChainId}
        destTypedChainId={targetChainId}
        sourceAddress={noteManager?.getKeypair().toString() ?? ''}
        destAddress={recipient}
        poolAddress={poolAddress}
        poolExplorerUrl={poolExplorerUrl}
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
            ? Number(formatEther(refundAmount))
            : undefined
        }
        refundToken={refundToken}
        refundRecipient={refundRecipient}
        newBalance={newBalance}
        feesSection={
          <RelayerFeeDetails
            totalFeeWei={totalFeeWei}
            totalFeeToken={totalFeeToken}
            gasFees={gasFees}
            relayerFees={relayerFees}
            isFeeLoading={isFeeLoading}
            srcChainCfg={apiConfig.chains[srcTypedChainId]}
            fungibleCfg={apiConfig.getCurrencyBySymbolAndTypedChainId(
              currency.view.symbol,
              srcTypedChainId
            )}
            activeRelayer={activeRelayer}
            info="Amount deducted from the transfer to cover transaction costs within the shielded pool."
          />
        }
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
  | 'refundToken'
> &
  Pick<
    ReturnType<typeof useInProgressTxInfo>,
    'inProgressTxId' | 'setInProgressTxId' | 'setTotalStep'
  > & {
    activeRelayer: OptionalActiveRelayer;
    targetTypedChainId: number;
    blockExplorerUrl?: string;
    relayerFees?: number;
    gasFees?: number;
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
    blockExplorerUrl,
    relayerFees,
    gasFees,
    refundToken,
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

  const { addNewTransaction } = useTxClientStorage();

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

    const tx = TransactionExecutor.new<NewNotesTxResult>('Transfer', {
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

      // add new TRANSFER transaction to client storage
      await addNewTransaction({
        hash: transactionHash,
        activity: 'transfer',
        amount: amount,
        fromAddress: noteManager?.getKeypair().toString() ?? '',
        recipientAddress: recipient,
        fungibleTokenSymbol: currency.view.symbol,
        timestamp: getCurrentTimestamp(),
        relayerName: activeRelayer?.account,
        relayerUri: activeRelayer ? activeRelayer.infoUri : undefined,
        relayerFeesAmount: relayerFees ?? gasFees,
        refundAmount:
          typeof refundAmount !== 'undefined'
            ? parseFloat(formatEther(refundAmount).slice(0, 10))
            : undefined,
        refundRecipientAddress: refundRecipient,
        refundTokenSymbol: refundToken,
        inputNoteSerializations: getNoteSerializations(inputNotes),
        outputNoteSerializations: getNoteSerializations(outputNotes),
        explorerUri: blockExplorerUrl
          ? getExplorerURI(
              blockExplorerUrl,
              transactionHash,
              'tx',
              'web3'
            ).toString()
          : undefined,
        sourceTypedChainId: srcTypedChainId,
        destinationTypedChainId: targetTypedChainId,
      });
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
