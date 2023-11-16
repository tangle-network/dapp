import { useWebContext } from '@webb-tools/api-provider-environment';
import { ZERO_BIG_INT, chainsPopulated } from '@webb-tools/dapp-config';
import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';
import { useTxClientStorage } from '@webb-tools/api-provider-environment/transaction';
import { getExplorerURI } from '@webb-tools/api-provider-environment/transaction/utils';
import { useRelayers, useVAnchor } from '@webb-tools/react-hooks';
import { useBalancesFromNotes } from '@webb-tools/react-hooks/currency/useBalancesFromNotes';
import { ChainType, Note } from '@webb-tools/sdk-core';
import {
  WithdrawConfirm,
  getRoundedAmountString,
} from '@webb-tools/webb-ui-components';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import {
  NewNotesTxResult,
  TransactionExecutor,
  TransactionState,
  WithdrawTransactionPayloadType,
} from '@webb-tools/abstract-api-provider';
import { isViemError } from '@webb-tools/web3-api-provider';
import {
  ContractFunctionRevertedError,
  Hash,
  formatEther,
  formatUnits,
} from 'viem';
import { useEnqueueSubmittedTx } from '../../hooks';
import useInProgressTxInfo from '../../hooks/useInProgressTxInfo';
import useWithdrawFeeCalculation from '../../hooks/useWithdrawFeeCalculation';
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
import RelayerFeeDetails from '../../components/RelayerFeeDetails';
import { WithdrawConfirmContainerProps } from './types';

const WithdrawConfirmContainer = forwardRef<
  HTMLDivElement,
  WithdrawConfirmContainerProps
>(
  (
    {
      amount,
      amountAfterFee,
      availableNotes,
      changeAmount,
      changeNote,
      changeUtxo,
      fee,
      feeInfo,
      fungibleCurrency: fungibleCurrencyProp,
      isRefund,
      onResetState,
      receivingInfo,
      recipient,
      refundToken,
      sourceTypedChainId,
      targetTypedChainId,
      refundAmount,
      unwrapCurrency: { value: unwrapCurrency } = {},
      onClose,
      ...props
    },
    ref
  ) => {
    const { value: fungibleCurrency } = fungibleCurrencyProp;

    const {
      api: vAnchorApi,
      addNoteToNoteManager,
      removeNoteFromNoteManager,
    } = useVAnchor();

    const enqueueSubmittedTx = useEnqueueSubmittedTx();

    const { activeApi, apiConfig, txQueue } = useWebContext();

    const { balances } = useBalancesFromNotes();

    const { api: txQueueApi } = txQueue;

    const { addNewTransaction } = useTxClientStorage();

    const {
      relayersState: { activeRelayer },
    } = useRelayers({
      typedChainId: targetTypedChainId,
      target: activeApi?.state.activeBridge
        ? activeApi.state.activeBridge.targets[targetTypedChainId]
        : undefined,
    });

    const [checked, setChecked] = useState(false);

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
      typeof unwrapCurrency !== 'undefined',
      onResetState
    );

    const {
      gasFeeInfo,
      isLoading: isFeeLoading,
      relayerFeeInfo,
      totalFeeToken,
      totalFeeWei,
    } = useWithdrawFeeCalculation({
      activeRelayer,
      recipientErrorMsg: undefined,
      typedChainId: sourceTypedChainId,
    });

    const avatarTheme = useMemo(() => {
      return chainsPopulated[targetTypedChainId].chainType === ChainType.EVM
        ? 'ethereum'
        : 'substrate';
    }, [targetTypedChainId]);

    const poolAddress = useMemo(
      () => apiConfig.anchors[fungibleCurrency.id][targetTypedChainId],
      [apiConfig, fungibleCurrency.id, targetTypedChainId]
    );

    const blockExplorerUrl = useMemo(
      () => chainsConfig[targetTypedChainId]?.blockExplorers?.default.url,
      [targetTypedChainId]
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

    const newBalance = useMemo(() => {
      const currentBalance =
        balances?.[fungibleCurrency.id]?.[sourceTypedChainId];
      if (!currentBalance) return undefined;
      const updatedBalance = Number(formatEther(currentBalance)) - amount;
      if (updatedBalance < 0) return undefined;
      return updatedBalance;
    }, [balances, fungibleCurrency.id, sourceTypedChainId, amount]);

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

    // The main action onClick handler
    const handleExecuteWithdraw = useCallback(
      async () => {
        if (availableNotes.length === 0 || !vAnchorApi || !activeApi) {
          captureSentryException(
            new Error(
              'No notes available to withdraw or vAnchorApi not available'
            ),
            'transactionType',
            'withdraw'
          );
          return;
        }

        if (inProgressTxId.length > 0) {
          txQueueApi.startNewTransaction();
          onResetState?.();
          return;
        }

        const note: Note = availableNotes[0];
        const {
          sourceChainId: sourceTypedChainId,
          sourceIdentifyingData,
          targetChainId: destTypedChainId,
          denomination,
          tokenSymbol,
        } = note.note;

        const unwrapTokenSymbol = unwrapCurrency?.view.symbol ?? tokenSymbol;

        const currency = apiConfig.getCurrencyBySymbolAndTypedChainId(
          tokenSymbol,
          +destTypedChainId
        );
        if (!currency) {
          console.error(`Currency not found for symbol ${tokenSymbol}`);
          captureSentryException(
            new Error(`Currency not found for symbol ${tokenSymbol}`),
            'transactionType',
            'withdraw'
          );
          return;
        }
        const tokenURI = getTokenURI(currency, destTypedChainId);

        const amount = Number(formatUnits(amountAfterFee, +denomination));

        const tx = TransactionExecutor.new<NewNotesTxResult>('Withdraw', {
          amount,
          tokens: [tokenSymbol, unwrapTokenSymbol],
          wallets: {
            src: +sourceTypedChainId,
            dest: +destTypedChainId,
          },
          token: tokenSymbol,
          tokenURI,
          providerType: activeApi.type,
          address: sourceIdentifyingData,
          recipient,
        });
        setInProgressTxId(tx.id);
        setTotalStep(tx.totalSteps);
        txQueueApi.registerTransaction(tx);

        try {
          const refund = refundAmount ?? ZERO_BIG_INT;

          const txPayload: WithdrawTransactionPayloadType = {
            notes: availableNotes,
            changeUtxo,
            recipient,
            refundAmount: refund,
            feeAmount: fee,
          };

          const args = await vAnchorApi.prepareTransaction(
            tx,
            txPayload,
            unwrapCurrency?.getAddressOfChain(+destTypedChainId) ?? ''
          );

          const outputNotes = changeNote ? [changeNote] : [];

          let indexBeforeInsert: number | undefined;
          if (changeNote) {
            const nextIdx = Number(
              await vAnchorApi.getNextIndex(+sourceTypedChainId, currency.id)
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
              apiConfig.chains[+destTypedChainId],
              'withdraw'
            );
          } else {
            transactionHash = await vAnchorApi.transact(...args);

            enqueueSubmittedTx(
              transactionHash,
              apiConfig.chains[+sourceTypedChainId],
              'transfer'
            );

            await handleStoreNote(changeNote, addNoteToNoteManager);

            await vAnchorApi.waitForFinalization(transactionHash);

            // Notification Success Transaction
            tx.txHash = transactionHash;
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
              sourceIdentifyingData
            );

            await removeNoteFromNoteManager(changeNote);
            await addNoteToNoteManager(noteWithIdx);
          }

          // Cleanup NoteAccount state
          await Promise.all(
            availableNotes.map((note) => removeNoteFromNoteManager(note))
          );

          // add new TRANSFER transaction to client storage
          addNewTransaction({
            hash: transactionHash,
            activity: 'withdraw',
            amount: amount,
            fromAddress: sourceIdentifyingData,
            recipientAddress: recipient,
            fungibleTokenSymbol: tokenSymbol,
            unwrapTokenSymbol,
            timestamp: getCurrentTimestamp(),
            relayerName: activeRelayer?.account,
            relayerUri: activeRelayer
              ? new URL(activeRelayer.endpoint).host
              : undefined,
            relayerFeesAmount: relayerFees ?? gasFees,
            refundAmount:
              typeof refundAmount !== 'undefined'
                ? parseFloat(formatEther(refundAmount).slice(0, 10))
                : undefined,
            refundTokenSymbol: refundToken,
            refundRecipientAddress: recipient,
            inputNoteSerializations: getNoteSerializations(availableNotes),
            outputNoteSerializations: getNoteSerializations(outputNotes),
            explorerUri: blockExplorerUrl
              ? getExplorerURI(
                  blockExplorerUrl,
                  transactionHash,
                  'tx',
                  'web3'
                ).toString()
              : undefined,
            sourceTypedChainId: +sourceTypedChainId,
            destinationTypedChainId: +destTypedChainId,
          });
        } catch (error) {
          console.log('Error while executing withdraw', error);
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

          captureSentryException(error, 'transactionType', 'withdraw');
        }
      },
      // prettier-ignore
      [activeApi, activeRelayer, addNoteToNoteManager, amountAfterFee, apiConfig, availableNotes, changeNote, changeUtxo, enqueueSubmittedTx, fee, inProgressTxId.length, onResetState, recipient, refundAmount, removeNoteFromNoteManager, setInProgressTxId, setTotalStep, txQueueApi, unwrapCurrency, vAnchorApi, addNewTransaction, blockExplorerUrl, refundToken, relayerFees, gasFees]
    );

    const formattedFee = useMemo(() => {
      const feeInEthers = formatEther(fee);

      if (activeRelayer) {
        const formattedRelayerFee = getRoundedAmountString(
          Number(feeInEthers),
          3,
          { roundingFunction: Math.round }
        );
        return `${formattedRelayerFee} ${fungibleCurrency.view.symbol}`;
      }

      return `${feeInEthers} ${refundToken ?? ''}`; // Refund token here is the native token
    }, [activeRelayer, fee, fungibleCurrency.view.symbol, refundToken]);

    const remainingAmount = useMemo(() => {
      const amountInEthers = Number(formatEther(amountAfterFee));

      return getRoundedAmountString(amountInEthers, 3, {
        roundingFunction: Math.round,
      });
    }, [amountAfterFee]);

    return (
      <WithdrawConfirm
        {...props}
        className="min-h-[var(--card-height)]"
        ref={ref}
        title={cardTitle}
        totalProgress={totalStep}
        progress={currentStep}
        actionBtnProps={{
          isDisabled: inProgressTxId ? false : changeAmount ? !checked : false,
          children: inProgressTxId
            ? 'Make Another Transaction'
            : unwrapCurrency
            ? 'Unwrap And Withdraw'
            : 'Withdraw',
          onClick: handleExecuteWithdraw,
        }}
        checkboxProps={{
          isChecked: checked,
          isDisabled: Boolean(inProgressTxId),
          onChange: () => setChecked((prev) => !prev),
        }}
        refundAmount={
          isRefund && refundAmount
            ? Number(formatEther(refundAmount))
            : undefined
        }
        refundToken={isRefund ? refundToken : undefined}
        receivingInfo={receivingInfo}
        amount={amount}
        remainingAmount={remainingAmount}
        feeInfo={feeInfo}
        fee={formattedFee}
        note={changeNote?.serialize()}
        changeAmount={changeAmount}
        sourceTypedChainId={sourceTypedChainId}
        destTypedChainId={targetTypedChainId}
        sourceAddress={
          availableNotes.length > 0
            ? availableNotes[0].note.sourceIdentifyingData
            : ''
        }
        destAddress={recipient}
        poolAddress={poolAddress}
        poolExplorerUrl={poolExplorerUrl}
        newBalance={newBalance}
        relayerAddress={activeRelayer?.beneficiary}
        relayerExternalUrl={activeRelayer?.endpoint}
        relayerAvatarTheme={avatarTheme}
        fungibleTokenSymbol={fungibleCurrency.view.symbol}
        wrappableTokenSymbol={unwrapCurrency?.view.symbol}
        txStatusColor={
          txStatus === 'completed'
            ? 'green'
            : txStatus === 'warning'
            ? 'red'
            : undefined
        }
        txStatusMessage={txStatusMessage}
        onClose={onClose}
        feesSection={
          <RelayerFeeDetails
            totalFeeWei={totalFeeWei}
            totalFeeToken={totalFeeToken}
            gasFees={gasFees}
            relayerFees={relayerFees}
            isFeeLoading={isFeeLoading}
            srcChainCfg={apiConfig.chains[sourceTypedChainId]}
            fungibleCfg={apiConfig.getCurrencyBySymbolAndTypedChainId(
              fungibleCurrency.view.symbol,
              sourceTypedChainId
            )}
            activeRelayer={activeRelayer}
            info="Amount deducted from the withdrawal to cover transaction costs within the shielded pool."
          />
        }
      />
    );
  }
);

export default WithdrawConfirmContainer;
