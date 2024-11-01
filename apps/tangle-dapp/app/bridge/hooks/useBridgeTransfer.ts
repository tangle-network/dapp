'use client';

import { IMailbox__factory } from '@hyperlane-xyz/core';
import { HyperlaneCore, ProviderType } from '@hyperlane-xyz/sdk';
import { useQuery } from '@tanstack/react-query';
import { getExplorerUrl } from '@webb-tools/api-provider-environment/transaction/utils';
import { chainsConfig } from '@webb-tools/dapp-config';
import { EVMChainId } from '@webb-tools/dapp-types/ChainId';
import { useWebbUI } from '@webb-tools/webb-ui-components/hooks/useWebbUI';
import { providers } from 'ethers';
import { useCallback, useState } from 'react';

import { useBridge } from '../../../context/BridgeContext';
import { useBridgeTxQueue } from '../../../context/BridgeTxQueueContext';
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';
import { mailboxAddress } from '../../../lib/hyperlane/consts';
import { hyperlaneTransfer } from '../../../lib/hyperlane/transfer';
import { BridgeTxState, BridgeType } from '../../../types/bridge';
import useAmountInDecimals from './useAmountInDecimals';
import useAmountInStr from './useAmountInStr';
import useEthersProvider from './useEthersProvider';
import useEthersSigner from './useEthersSigner';
import useSelectedToken from './useSelectedToken';
import useTypedChainId from './useTypedChainId';

export default function useBridgeTransfer({
  onTxAddedToQueue,
}: {
  onTxAddedToQueue: () => void;
}) {
  const activeAccountAddress = useActiveAccountAddress();
  const {
    destinationAddress,
    bridgeType,
    selectedSourceChain,
    selectedDestinationChain,
  } = useBridge();
  const selectedToken = useSelectedToken();
  const ethersProvider = useEthersProvider();
  const ethersSigner = useEthersSigner();
  const amountInStr = useAmountInStr();
  const { sourceTypedChainId, destinationTypedChainId } = useTypedChainId();
  const { sourceAmountInDecimals, destinationAmountInDecimals } =
    useAmountInDecimals();
  const {
    addTxToQueue,
    updateTxState,
    updateTxDestinationTxState,
    addTxDestinationTxExplorerUrl,
    addTxExplorerUrl,
  } = useBridgeTxQueue();
  const { notificationApi } = useWebbUI();

  const [destinationTxHashAndMessageId, setDestinationTxHashAndMessageId] =
    useState<{ txHash: string | null; messageId: string | null }>({
      txHash: null,
      messageId: null,
    });

  const [destinationTxIsExecutedOrFailed, setDestinationTxIsExecutedOrFailed] =
    useState(false);

  const ethersProviderDestination = useEthersProvider('dest');

  const checkMessageDelivery = useCallback(
    async (txHash: string, messageId: string, mailboxAddress: string) => {
      if (!ethersProviderDestination) {
        throw new Error('Destination Ethers provider not available');
      }

      const mailbox = IMailbox__factory.connect(
        mailboxAddress,
        ethersProviderDestination,
      );

      const isDelivered = await mailbox.delivered(messageId);

      if (isDelivered === true) {
        updateTxDestinationTxState(
          txHash,
          '',
          BridgeTxState.HyperlaneDelivered,
        );

        const fromBlock =
          (await ethersProviderDestination.getBlockNumber()) - 1_000;

        const logs = await mailbox.queryFilter(
          mailbox.filters.ProcessId(messageId),
          fromBlock,
          'latest',
        );

        if (logs?.length) {
          const log = logs[0];

          const receipt = await ethersProviderDestination.getTransactionReceipt(
            log.transactionHash,
          );

          let destinationTxExplorerUrl = '';

          if (chainsConfig[destinationTypedChainId].blockExplorers) {
            destinationTxExplorerUrl = getExplorerUrl(
              chainsConfig[destinationTypedChainId].blockExplorers.default.url,
              receipt.transactionHash,
              'tx',
              'web3',
            ).toString();
          }

          if (destinationTxExplorerUrl) {
            addTxDestinationTxExplorerUrl(txHash, destinationTxExplorerUrl);
          }

          if (receipt.status === 1) {
            updateTxDestinationTxState(
              txHash,
              receipt.transactionHash,
              BridgeTxState.HyperlaneExecuted,
            );
            setDestinationTxIsExecutedOrFailed(true);
          } else {
            updateTxDestinationTxState(
              txHash,
              receipt.transactionHash,
              BridgeTxState.HyperlaneFailed,
            );
            setDestinationTxIsExecutedOrFailed(true);
          }
        }
      } else {
        updateTxDestinationTxState(txHash, '', BridgeTxState.HyperlanePending);
      }

      return isDelivered;
    },
    [
      addTxDestinationTxExplorerUrl,
      destinationTypedChainId,
      ethersProviderDestination,
      updateTxDestinationTxState,
      setDestinationTxIsExecutedOrFailed,
    ],
  );

  useQuery({
    queryKey: ['messageDelivery', destinationTxHashAndMessageId.messageId],
    queryFn: async () => {
      if (
        !destinationTxHashAndMessageId.txHash ||
        !destinationTxHashAndMessageId.messageId
      ) {
        return null;
      }
      return checkMessageDelivery(
        destinationTxHashAndMessageId.txHash,
        destinationTxHashAndMessageId.messageId,
        selectedDestinationChain.id === EVMChainId.Holesky
          ? mailboxAddress.holesky
          : mailboxAddress.tangletestnet,
      );
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    enabled:
      !destinationTxIsExecutedOrFailed &&
      !!ethersProviderDestination &&
      (selectedDestinationChain.id === EVMChainId.Holesky ||
        selectedDestinationChain.id === EVMChainId.TangleTestnetEVM),
    retry: true,
  });

  return async () => {
    if (activeAccountAddress === null) {
      throw new Error('No active account');
    }

    if (bridgeType === null) {
      throw new Error('There must be a bridge type');
    }

    if (
      sourceAmountInDecimals === null ||
      destinationAmountInDecimals === null
    ) {
      throw new Error('Amounts must be defined');
    }

    setDestinationTxHashAndMessageId({
      txHash: null,
      messageId: null,
    });
    setDestinationTxIsExecutedOrFailed(false);

    if (bridgeType === BridgeType.HYPERLANE_EVM_TO_EVM) {
      if (ethersProvider === null) {
        throw new Error('No Ethers Provider found');
      }
      if (ethersSigner === null) {
        throw new Error('No Ethers Signer found');
      }

      const hyperlaneResult = await hyperlaneTransfer({
        sourceTypedChainId,
        destinationTypedChainId,
        senderAddress: activeAccountAddress,
        recipientAddress: destinationAddress,
        token: selectedToken,
        amount: amountInStr,
      });

      if (!hyperlaneResult) {
        notificationApi({
          variant: 'error',
          message: 'Bridge transfer failed',
        });

        return;
      }

      const { txs } = hyperlaneResult;

      for (const tx of txs) {
        if (tx.type !== ProviderType.EthersV5) {
          throw new Error('Unsupported provider type');
        }
      }

      let txHash: string | undefined;

      for (const [idx, tx] of txs.entries()) {
        const res = await ethersSigner.sendTransaction(
          tx.transaction as providers.TransactionRequest,
        );

        if (idx === txs.length - 1) {
          txHash = res.hash;
          addTxToQueue({
            hash: txHash,
            env:
              selectedSourceChain.tag === 'live'
                ? 'live'
                : selectedSourceChain.tag === 'test'
                  ? 'test'
                  : 'dev',
            sourceTypedChainId,
            destinationTypedChainId,
            sourceAddress: activeAccountAddress,
            recipientAddress: destinationAddress,
            sourceAmount: sourceAmountInDecimals.toString(),
            destinationAmount: destinationAmountInDecimals.toString(),
            tokenSymbol: selectedToken.symbol,
            creationTimestamp: new Date().getTime(),
            type: bridgeType,
          });

          updateTxState(txHash, BridgeTxState.Sending);
          if (chainsConfig[sourceTypedChainId].blockExplorers) {
            addTxExplorerUrl(
              txHash,
              getExplorerUrl(
                chainsConfig[sourceTypedChainId].blockExplorers.default.url,
                txHash,
                'tx',
                'web3',
              ).toString(),
            );
          }
          onTxAddedToQueue();
        }

        const receipt = await res.wait();

        const message = HyperlaneCore.getDispatchedMessages(receipt);

        if (txHash !== undefined) {
          const messageId = message[0].id;

          if (receipt.status === 1) {
            if (message.length > 0) {
              setDestinationTxHashAndMessageId({
                txHash,
                messageId,
              });
            }

            updateTxState(txHash, BridgeTxState.Executed);
            updateTxDestinationTxState(
              txHash,
              '',
              BridgeTxState.HyperlanePending,
            );
          } else {
            updateTxState(txHash, BridgeTxState.Failed);
            updateTxDestinationTxState(
              txHash,
              '',
              BridgeTxState.HyperlaneFailed,
            );
          }
        }
      }
    } else {
      throw new Error('Unsupported bridge type');
    }
  };
}
