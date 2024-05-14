import {
  Currency,
  NewNotesTxResult,
  TransactionExecutor,
  TransactionState,
} from '@webb-tools/abstract-api-provider';
import { getExplorerURI } from '@webb-tools/api-provider-environment/transaction/utils/index.js';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context/index.js';
import { useTxClientStorage } from '@webb-tools/api-provider-environment/transaction/index.js';
import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config.js';
import { GasStationFill } from '@webb-tools/icons';
import { useVAnchor } from '@webb-tools/react-hooks';
import { useBalancesFromNotes } from '@webb-tools/react-hooks/currency/useBalancesFromNotes.js';
import { isViemError } from '@webb-tools/web3-api-provider';
import { DepositConfirm, FeeDetails } from '@webb-tools/webb-ui-components';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { ContractFunctionRevertedError, formatEther, formatUnits } from 'viem';
import { useEnqueueSubmittedTx } from '../../hooks/index.js';
import useInProgressTxInfo from '../../hooks/useInProgressTxInfo.js';
import {
  captureSentryException,
  getErrorMessage,
  getTokenURI,
  getTransactionHash,
  handleMutateNoteIndex,
  handleStoreNote,
  getNoteSerializations,
  getCurrentTimestamp,
} from '../../utils/index.js';
import { DepositConfirmContainerProps } from './types.js';

const DepositConfirmContainer = forwardRef<
  HTMLDivElement,
  DepositConfirmContainerProps
>(
  (
    {
      amount,
      fungibleTokenId,
      note,
      onResetState,
      onClose,
      sourceTypedChainId: sourceTypedChainIdProp,
      destTypedChainId: destTypedChainIdProp,
      wrappableTokenId,
    },
    ref
  ) => {
    const [checked, setChecked] = useState(false);
    const {
      api,
      startNewTransaction,
      addNoteToNoteManager,
      removeNoteFromNoteManager,
    } = useVAnchor();

    const { activeApi, activeAccount, activeChain, apiConfig, txQueue } =
      useWebContext();

    const enqueueSubmittedTx = useEnqueueSubmittedTx();

    const { addNewTransaction } = useTxClientStorage();

    const { api: txQueueApi } = txQueue;

    const { balances } = useBalancesFromNotes();

    const fungibleToken = useMemo(() => {
      return new Currency(apiConfig.currencies[fungibleTokenId]);
    }, [apiConfig.currencies, fungibleTokenId]);

    const wrappableToken = useMemo(() => {
      if (typeof wrappableTokenId === 'undefined') {
        return;
      }

      return new Currency(apiConfig.currencies[wrappableTokenId]);
    }, [wrappableTokenId, apiConfig.currencies]);

    const wrappingFlow = useMemo(
      () => typeof wrappableTokenId !== 'undefined',
      [wrappableTokenId]
    );

    const {
      cardTitle,
      currentStep,
      inProgressTxId,
      setInProgressTxId,
      setTotalStep,
      totalStep,
      txStatus,
      txStatusMessage,
    } = useInProgressTxInfo(wrappingFlow, onResetState);

    const sourceTypedChainId = useMemo(
      () => sourceTypedChainIdProp ?? +note.note.sourceChainId,
      [sourceTypedChainIdProp, note.note.sourceChainId]
    );

    const destTypedChainId = useMemo(
      () => destTypedChainIdProp ?? +note.note.targetChainId,
      [destTypedChainIdProp, note.note.targetChainId]
    );

    const newBalance = useMemo(() => {
      const balance = balances?.[fungibleTokenId]?.[destTypedChainId];
      if (!balance) return amount;
      return Number(formatEther(balance)) + amount;
    }, [balances, fungibleTokenId, destTypedChainId, amount]);

    const poolAddress = useMemo(
      () => apiConfig.anchors[fungibleTokenId][destTypedChainId],
      [apiConfig, fungibleTokenId, destTypedChainId]
    );

    const blockExplorerUrl = useMemo(
      () => chainsConfig[destTypedChainId]?.blockExplorers?.default.url,
      [destTypedChainId]
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

    const handleExecuteDeposit = useCallback(
      async () => {
        if (!api || !activeApi || !activeChain) {
          captureSentryException(
            new Error('No api or chain found'),
            'transactionType',
            'deposit'
          );
          return;
        }

        // Set transaction payload for transaction processing card
        // Start a new transaction
        if (inProgressTxId.length > 0) {
          startNewTransaction();
          onResetState?.();
          return;
        }

        const {
          amount,
          denomination,
          sourceChainId: sourceTypedChainId,
          targetChainId: destTypedChainId,
          sourceIdentifyingData,
          targetIdentifyingData,
          tokenSymbol,
        } = note.note;

        // Calculate the amount
        const formattedAmount = formatUnits(BigInt(amount), +denomination);

        // Get the deposit token symbol
        let srcTokenSymbol = tokenSymbol;

        if (wrappableToken) {
          srcTokenSymbol = wrappableToken.view.symbol;
        }

        // Get the destination token symbol
        const destToken = tokenSymbol;

        const currency = apiConfig.getCurrencyBySymbolAndTypedChainId(
          tokenSymbol,
          +destTypedChainId
        );
        if (!currency) {
          console.error(`Currency not found for symbol ${tokenSymbol}`);
          captureSentryException(
            new Error(`Currency not found for symbol ${tokenSymbol}`),
            'transactionType',
            'deposit'
          );
          return;
        }

        const tokenURI = getTokenURI(currency, destTypedChainId);

        const tx = TransactionExecutor.new<NewNotesTxResult>('Deposit', {
          amount: +formattedAmount,
          tokens: [srcTokenSymbol, destToken],
          wallets: {
            src: +sourceTypedChainId,
            dest: +destTypedChainId,
          },
          token: tokenSymbol,
          tokenURI,
          providerType: activeApi.type,
          address: activeAccount?.address,
          recipient: targetIdentifyingData,
        });
        setInProgressTxId(tx.id);
        setTotalStep(tx.totalSteps);
        txQueueApi.registerTransaction(tx);

        try {
          const args = await api?.prepareTransaction(
            tx,
            note,
            wrappableToken?.getAddressOfChain(+sourceTypedChainId) ?? ''
          );
          if (!args) {
            return txQueueApi.cancelTransaction(tx.id);
          }

          const nextIdx = Number(
            await api.getNextIndex(+sourceTypedChainId, fungibleTokenId)
          );

          const indexBeforeInsert = nextIdx === 0 ? nextIdx : nextIdx - 1;

          const transactionHash = await api.transact(...args);

          await handleStoreNote(note, addNoteToNoteManager);

          enqueueSubmittedTx(
            transactionHash,
            apiConfig.chains[+sourceTypedChainId],
            'deposit'
          );

          await api.waitForFinalization(transactionHash);

          const indexedNote = await handleMutateNoteIndex(
            api,
            transactionHash,
            note,
            indexBeforeInsert,
            sourceIdentifyingData
          );

          await removeNoteFromNoteManager(note);
          await addNoteToNoteManager(indexedNote);

          // Notification Success Transaction
          tx.next(TransactionState.Done, {
            txHash: transactionHash,
            outputNotes: [indexedNote],
          });

          // add new DEPOSIT transaction to client storage
          await addNewTransaction({
            hash: transactionHash,
            activity: 'deposit',
            amount: +formattedAmount,
            fromAddress: activeAccount?.address ?? '',
            recipientAddress: targetIdentifyingData,
            fungibleTokenSymbol: fungibleToken.view.symbol,
            wrapTokenSymbol: wrappableToken?.view.symbol,
            timestamp: getCurrentTimestamp(),
            outputNoteSerializations: getNoteSerializations([indexedNote]),
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
          console.error(error);
          removeNoteFromNoteManager(note);
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

          captureSentryException(error, 'transactionType', 'deposit');
        }
      },
      // prettier-ignore
      [activeAccount?.address, activeApi, activeChain, addNoteToNoteManager, api, apiConfig, enqueueSubmittedTx, fungibleTokenId, inProgressTxId.length, note, onResetState, removeNoteFromNoteManager, setInProgressTxId, setTotalStep, startNewTransaction, txQueueApi, wrappableToken, blockExplorerUrl, fungibleToken.view.symbol, addNewTransaction]
    );

    return (
      <DepositConfirm
        className="min-h-[var(--card-height)]"
        title={cardTitle}
        ref={ref}
        note={note.note.serialize()}
        actionBtnProps={{
          isDisabled: inProgressTxId ? false : !checked,
          children: inProgressTxId
            ? 'Make Another Transaction'
            : wrappingFlow
            ? 'Wrap And Deposit'
            : 'Deposit',
          onClick: handleExecuteDeposit,
        }}
        checkboxProps={{
          isChecked: checked,
          isDisabled: Boolean(inProgressTxId),
          onChange: () => setChecked((prev) => !prev),
        }}
        totalProgress={totalStep}
        progress={currentStep}
        amount={amount}
        wrappingAmount={amount}
        fungibleTokenSymbol={fungibleToken.view.symbol}
        sourceTypedChainId={sourceTypedChainId}
        destTypedChainId={destTypedChainId}
        sourceAddress={activeAccount?.address ?? ''}
        destAddress={note.note.targetIdentifyingData}
        poolAddress={poolAddress}
        poolExplorerUrl={poolExplorerUrl}
        newBalance={newBalance}
        wrappableTokenSymbol={wrappableToken?.view.symbol}
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
          <FeeDetails
            info="The fee pays for the transaction to be processed on the network."
            items={[
              {
                name: 'Gas',
                Icon: <GasStationFill />,
              },
            ]}
          />
        }
      />
    );
  }
);

export default DepositConfirmContainer;
