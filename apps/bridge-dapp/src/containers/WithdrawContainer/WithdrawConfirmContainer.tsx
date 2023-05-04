import { useWebContext } from '@webb-tools/api-provider-environment';
import { downloadString } from '@webb-tools/browser-utils';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { useRelayers, useTxQueue, useVAnchor } from '@webb-tools/react-hooks';
import { ChainType, Note } from '@webb-tools/sdk-core';
import {
  getRoundedAmountString,
  useCopyable,
  useWebbUI,
  WithdrawConfirm,
} from '@webb-tools/webb-ui-components';
import { forwardRef, useCallback, useMemo, useState } from 'react';

import {
  NewNotesTxResult,
  Transaction,
  TransactionState,
  WithdrawTransactionPayloadType,
} from '@webb-tools/abstract-api-provider';
import { BigNumber, ethers } from 'ethers';
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
import { WithdrawConfirmContainerProps } from './types';

export const WithdrawConfirmContainer = forwardRef<
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
      refundAmount,
      refundToken,
      sourceTypedChainId,
      targetTypedChainId,
      unwrapCurrency: { value: unwrapCurrency } = {},
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

    const { api: txQueueApi, txPayloads } = useTxQueue();

    const [txId, setTxId] = useState('');

    const {
      relayersState: { activeRelayer },
    } = useRelayers({
      typedChainId: targetTypedChainId,
      target: activeApi?.state.activeBridge
        ? activeApi.state.activeBridge.targets[targetTypedChainId]
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
      return chainsPopulated[targetTypedChainId].chainType === ChainType.EVM
        ? 'ethereum'
        : 'substrate';
    }, [targetTypedChainId]);

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
          status = 'in Progress...';
          break;
        }
      }

      if (!status)
        return unwrapCurrency
          ? 'Confirm Unwrap and Withdraw'
          : 'Confirm Withdraw';

      return unwrapCurrency
        ? `Unwrap and Withdraw ${status}`
        : `Withdraw ${status}`;
    }, [stage, unwrapCurrency]);

    // The main action onClick handler
    const handleExecuteWithdraw = useCallback(async () => {
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
        captureSentryException(
          new Error(`Currency not found for symbol ${tokenSymbol}`),
          'transactionType',
          'withdraw'
        );
        return;
      }
      const tokenURI = getTokenURI(currency, destTypedChainId);

      const amount = Number(ethers.utils.formatEther(amountAfterFee));

      const tx = Transaction.new<NewNotesTxResult>('Withdraw', {
        amount,
        tokens: [tokenSymbol, unwrapTokenSymbol],
        wallets: {
          src: +sourceTypedChainId,
          dest: +destTypedChainId,
        },
        token: tokenSymbol,
        tokenURI,
        providerType: activeApi.type(),
      });

      setTxId(tx.id);

      try {
        txQueueApi.registerTransaction(tx);

        // Add the change note before sending the tx
        if (changeNote) {
          noteManager?.addNote(changeNote);
        }

        const refund = refundAmount ?? BigNumber.from(0);

        const txPayload: WithdrawTransactionPayloadType = {
          notes: availableNotes,
          changeUtxo,
          recipient,
          refundAmount: refund.toBigInt(),
          feeAmount: fee.toBigInt(),
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
          const { transactionHash } = await vAnchorApi.transact(...args);

          // Notification Success Transaction
          tx.txHash = transactionHash;
          tx.next(TransactionState.Done, {
            txHash: transactionHash,
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
        captureSentryException(error, 'transactionType', 'withdraw');
      } finally {
        setMainComponent(undefined);
        onResetState?.();
      }
    }, [
      availableNotes,
      vAnchorApi,
      activeApi,
      withdrawTxInProgress,
      changeNote,
      downloadNote,
      unwrapCurrency,
      apiConfig,
      amountAfterFee,
      txQueueApi,
      setMainComponent,
      refundAmount,
      changeUtxo,
      recipient,
      fee,
      activeRelayer,
      noteManager,
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
      const feeInEthers = ethers.utils.formatEther(fee);

      if (activeRelayer) {
        const formattedRelayerFee = getRoundedAmountString(
          Number(feeInEthers),
          3,
          Math.round
        );
        return `${formattedRelayerFee} ${fungibleCurrency.view.symbol}`;
      }

      return `${feeInEthers} ${refundToken ?? ''}`; // Refund token here is the native token
    }, [activeRelayer, fee, fungibleCurrency.view.symbol, refundToken]);

    const formattedRefund = useMemo(() => {
      if (!refundAmount) {
        return undefined;
      }

      const refundInEthers = Number(ethers.utils.formatEther(refundAmount));

      return getRoundedAmountString(refundInEthers, 3, Math.round);
    }, [refundAmount]);

    const remainingAmount = useMemo(() => {
      const amountInEthers = Number(ethers.utils.formatEther(amountAfterFee));

      return getRoundedAmountString(amountInEthers, 3, Math.round);
    }, [amountAfterFee]);

    return (
      <WithdrawConfirm
        {...props}
        ref={ref}
        title={cardTitle}
        activeChains={activeChains}
        sourceChain={{
          name: chainsPopulated[sourceTypedChainId].name,
          type: chainsPopulated[sourceTypedChainId].base ?? 'webb-dev',
        }}
        destChain={{
          name: chainsPopulated[targetTypedChainId].name,
          type: chainsPopulated[targetTypedChainId].base ?? 'webb-dev',
        }}
        actionBtnProps={{
          isDisabled: withdrawTxInProgress
            ? false
            : changeAmount
            ? !checked
            : false,
          children: withdrawTxInProgress
            ? 'Make Another Transaction'
            : unwrapCurrency
            ? 'Unwrap And Withdraw'
            : 'Withdraw',
          onClick: handleExecuteWithdraw,
        }}
        checkboxProps={{
          isChecked: checked,
          isDisabled: withdrawTxInProgress,
          children: 'I have copied the change note',
          onChange: () => setChecked((prev) => !prev),
        }}
        refundAmount={isRefund ? formattedRefund : undefined}
        refundToken={isRefund ? refundToken : undefined}
        receivingInfo={receivingInfo}
        isCopied={isCopied}
        onCopy={() => handleCopy(changeNote?.serialize())}
        onDownload={() => downloadNote(changeNote?.serialize() ?? '')}
        amount={amount}
        remainingAmount={remainingAmount}
        feeInfo={feeInfo}
        fee={formattedFee}
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
        txStatusMessage={txStatusMessage}
      />
    );
  }
);
