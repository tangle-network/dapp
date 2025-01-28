import { ChainConfig, chainsConfig } from '@webb-tools/dapp-config/chains';
import { calculateTypedChainId } from '@webb-tools/dapp-types/TypedChainId';
import { EVMTokenBridgeEnum } from '@webb-tools/evm-contract-metadata';
import { ChainIcon } from '@webb-tools/icons/ChainIcon';
import { TokenIcon } from '@webb-tools/icons/TokenIcon';
import { getFlexBasic } from '@webb-tools/icons/utils';
import { BridgeTxState, BridgeToken } from '@webb-tools/tangle-shared-ui/types';
import ensureError from '@webb-tools/tangle-shared-ui/utils/ensureError';
import {
  EMPTY_VALUE_PLACEHOLDER,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { Button } from '@webb-tools/webb-ui-components/components/buttons';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@webb-tools/webb-ui-components/components/Modal';
import { Typography } from '@webb-tools/webb-ui-components/typography';
import {
  isSolanaAddress,
  shortenHex,
  shortenString,
} from '@webb-tools/webb-ui-components/utils';
import cx from 'classnames';
import { FC, useCallback, useMemo, useState } from 'react';

import { makeExplorerUrl } from '@webb-tools/api-provider-environment/transaction/utils';
import { FeeDetail, FeeDetailProps } from './FeeDetail';
import {
  ROUTER_TX_EXPLORER_URL,
  ROUTER_TX_STATUS_URL,
  mailboxAddress,
} from '../../constants/bridge';
import useBridgeTxQueue from '../../context/bridge/BridgeTxQueueContext/useBridgeTxQueue';
import { useHyperlaneTransfer } from '../../data/bridge/useHyperlaneTransfer';
import { useRouterTransfer } from '../../data/bridge/useRouterTransfer';
import { Decimal } from 'decimal.js';
import { createPublicClient, http, getContract } from 'viem';
import { IMailbox__factory } from '@hyperlane-xyz/core';
import { HyperlaneCore } from '@hyperlane-xyz/sdk';
import { useQuery } from '@tanstack/react-query';
import { EVMChainId } from '@webb-tools/dapp-types/ChainId';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid';
import { ArrowDownIcon } from '@webb-tools/icons';
import axios from 'axios';

interface BridgeConfirmationModalProps {
  isOpen: boolean;
  handleClose: () => void;
  clearBridgeStore: () => void;
  sourceChain: ChainConfig;
  destinationChain: ChainConfig;
  token: BridgeToken;
  feeDetails: FeeDetailProps | null;
  activeAccountAddress: string;
  destinationAddress: string;
  routerTransferData: {
    routerQuoteData: any;
    fromTokenAddress: string;
    toTokenAddress: string;
    senderAddress: string;
    receiverAddress: string;
    refundAddress: string;
  } | null;
  sendingAmount: Decimal | null;
  receivingAmount: Decimal | null;
}

export const BridgeConfirmationModal = ({
  isOpen,
  handleClose,
  clearBridgeStore,
  sourceChain,
  destinationChain,
  token,
  feeDetails,
  activeAccountAddress,
  destinationAddress,
  routerTransferData,
  sendingAmount,
  receivingAmount,
}: BridgeConfirmationModalProps) => {
  const {
    addTxToQueue,
    setIsOpenQueueDropdown,
    updateTxState,
    updateTxDestinationTxState,
    addTxExplorerUrl,
    addTxDestinationTxExplorerUrl,
  } = useBridgeTxQueue();

  const {
    mutateAsync: transferByRouterAsync,
    isPending: isTransferByRouterPending,
  } = useRouterTransfer({
    routerQuoteData: routerTransferData?.routerQuoteData,
    fromTokenAddress: routerTransferData?.fromTokenAddress ?? '',
    toTokenAddress: routerTransferData?.toTokenAddress ?? '',
    senderAddress: routerTransferData?.senderAddress ?? '',
    receiverAddress: routerTransferData?.receiverAddress ?? '',
    refundAddress: routerTransferData?.refundAddress ?? '',
  });

  const {
    mutateAsync: transferByHyperlaneAsync,
    isPending: isTransferByHyperlanePending,
  } = useHyperlaneTransfer({
    token,
    amount: Number(sendingAmount),
    sourceTypedChainId: calculateTypedChainId(
      sourceChain.chainType,
      sourceChain.id,
    ),
    destinationTypedChainId: calculateTypedChainId(
      destinationChain.chainType,
      destinationChain.id,
    ),
    senderAddress: activeAccountAddress,
    recipientAddress: destinationAddress,
  });

  const { notificationApi } = useWebbUI();

  const srcChainPublicClient = createPublicClient({
    chain: sourceChain,
    transport: http(),
  });

  const dstChainPublicClient = createPublicClient({
    chain: destinationChain,
    transport: http(),
  });

  const [hyperlaneDestinationTxInfo, setHyperlaneDestinationTxInfo] = useState<{
    sourceTxHash: string | null;
    messageId: string | null;
  }>({ sourceTxHash: null, messageId: null });

  const [
    isHyperlaneDestinationTxFinalized,
    setIsHyperlaneDestinationTxFinalized,
  ] = useState(false);

  const checkHyperlaneMessageDelivery = useCallback(
    async (sourceTxHash: string, messageId: string) => {
      try {
        const mailboxContract = getContract({
          address:
            destinationChain.id === EVMChainId.Holesky
              ? (mailboxAddress.holesky as `0x${string}`)
              : (mailboxAddress.tangletestnet as `0x${string}`),
          abi: IMailbox__factory.abi,
          client: dstChainPublicClient,
        });

        const formattedMessageId = messageId.startsWith('0x')
          ? messageId
          : `0x${messageId}`;

        const isDelivered = await mailboxContract.read.delivered([
          formattedMessageId as `0x${string}`,
        ]);

        if (isDelivered) {
          const fromBlock =
            (await dstChainPublicClient.getBlockNumber()) - BigInt(1_000);

          const logs = await dstChainPublicClient.getContractEvents({
            address: mailboxContract.address,
            abi: IMailbox__factory.abi,
            eventName: 'ProcessId',
            args: {
              messageId: formattedMessageId as `0x${string}`,
            },
            fromBlock,
            toBlock: 'latest',
          });

          if (logs?.length) {
            const log = logs[0];
            const receipt = await dstChainPublicClient.getTransactionReceipt({
              hash: log.transactionHash as `0x${string}`,
            });

            const destinationTypedChainId = calculateTypedChainId(
              destinationChain.chainType,
              destinationChain.id,
            );

            if (chainsConfig[destinationTypedChainId].blockExplorers) {
              updateTxDestinationTxState(
                sourceTxHash,
                receipt.transactionHash,
                BridgeTxState.Pending,
              );

              addTxDestinationTxExplorerUrl(
                sourceTxHash,
                makeExplorerUrl(
                  chainsConfig[destinationTypedChainId].blockExplorers.default
                    .url,
                  receipt.transactionHash,
                  'tx',
                  'web3',
                ).toString(),
              );
            }

            if (receipt.status === 'success') {
              updateTxDestinationTxState(
                sourceTxHash,
                receipt.transactionHash,
                BridgeTxState.Completed,
              );
              setIsHyperlaneDestinationTxFinalized(true);
            } else {
              updateTxDestinationTxState(
                sourceTxHash,
                receipt.transactionHash,
                BridgeTxState.Failed,
              );
              setIsHyperlaneDestinationTxFinalized(true);
            }
          }
        }

        return isDelivered;
      } catch (error) {
        console.error('Error checking hyperlane message delivery:', error);
        return false;
      }
    },
    [
      destinationChain.id,
      destinationChain.chainType,
      dstChainPublicClient,
      updateTxDestinationTxState,
      addTxDestinationTxExplorerUrl,
    ],
  );

  useQuery({
    queryKey: [
      'hyperlaneMessageDelivery',
      hyperlaneDestinationTxInfo.messageId,
    ],
    queryFn: () => {
      if (
        !hyperlaneDestinationTxInfo.sourceTxHash ||
        !hyperlaneDestinationTxInfo.messageId
      ) {
        return null;
      }
      return checkHyperlaneMessageDelivery(
        hyperlaneDestinationTxInfo.sourceTxHash,
        hyperlaneDestinationTxInfo.messageId,
      );
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    enabled:
      !isHyperlaneDestinationTxFinalized &&
      !!hyperlaneDestinationTxInfo.messageId &&
      token.bridgeType === EVMTokenBridgeEnum.Hyperlane,
    retry: true,
  });

  const [routerTxInfo, setRouterTxInfo] = useState<{
    sourceTxHash: string | null;
  }>({ sourceTxHash: null });

  const [isRouterDestinationTxFinalized, setIsRouterDestinationTxFinalized] =
    useState(false);

  const checkRouterMessageDelivery = useCallback(
    async (sourceTxHash: string) => {
      try {
        const response = await axios.get(ROUTER_TX_STATUS_URL, {
          params: {
            srcTxHash: sourceTxHash,
          },
        });

        if (response.data.status === 'pending') {
          updateTxState(sourceTxHash, BridgeTxState.Pending);
        } else if (response.data.status === 'failed') {
          updateTxState(sourceTxHash, BridgeTxState.Failed);
          setIsRouterDestinationTxFinalized(true);
        } else if (response.data.status === 'completed') {
          updateTxState(sourceTxHash, BridgeTxState.Completed);
          setIsRouterDestinationTxFinalized(true);
        }

        return true;
      } catch (error) {
        console.error('Error checking router message delivery:', error);
        return false;
      }
    },
    [updateTxState],
  );

  useQuery({
    queryKey: ['routerMessageDelivery', routerTxInfo.sourceTxHash],
    queryFn: () => {
      if (!routerTxInfo.sourceTxHash) {
        return null;
      }
      return checkRouterMessageDelivery(routerTxInfo.sourceTxHash);
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    enabled:
      !isRouterDestinationTxFinalized &&
      !!routerTxInfo.sourceTxHash &&
      token.bridgeType === EVMTokenBridgeEnum.Router,
    retry: true,
  });

  const watchTransaction = useCallback(
    async (txHash: string) => {
      try {
        const receipt = await srcChainPublicClient.waitForTransactionReceipt({
          hash: txHash as `0x${string}`,
        });

        if (receipt.status === 'success') {
          if (token.bridgeType === EVMTokenBridgeEnum.Hyperlane) {
            updateTxState(txHash, BridgeTxState.Completed);

            const hyperlaneReceipt = {
              ...receipt,
              contractAddress: receipt.contractAddress ?? null,
            };
            const message =
              HyperlaneCore.getDispatchedMessages(hyperlaneReceipt);
            if (message.length > 0) {
              setHyperlaneDestinationTxInfo({
                sourceTxHash: txHash,
                messageId: message[0].id,
              });
            }
          } else {
            updateTxState(txHash, BridgeTxState.Pending);
            setRouterTxInfo({ sourceTxHash: txHash });
          }
        } else {
          updateTxState(txHash, BridgeTxState.Failed);
        }
      } catch (error) {
        console.error('Error watching transaction:', error);
        updateTxState(txHash, BridgeTxState.Failed);
      }
    },
    [srcChainPublicClient, updateTxState, token.bridgeType],
  );

  const handleConfirm = useCallback(async () => {
    try {
      if (!sendingAmount || !receivingAmount) {
        throw new Error('Invalid amount');
      }

      if (token.bridgeType === EVMTokenBridgeEnum.Router) {
        const response = await transferByRouterAsync();

        if (response) {
          addTxToQueue({
            hash: response.transactionHash,
            env:
              sourceChain.tag === 'live'
                ? 'live'
                : sourceChain.tag === 'test'
                  ? 'test'
                  : 'dev',
            sourceTypedChainId: calculateTypedChainId(
              sourceChain.chainType,
              sourceChain.id,
            ),
            destinationTypedChainId: calculateTypedChainId(
              destinationChain.chainType,
              destinationChain.id,
            ),
            sourceAddress: activeAccountAddress,
            recipientAddress: destinationAddress,
            sourceAmount: sendingAmount.toString(),
            destinationAmount: receivingAmount.toString(),
            tokenSymbol: token.tokenType,
            creationTimestamp: new Date().getTime(),
            bridgeType: EVMTokenBridgeEnum.Router,
          });

          setIsOpenQueueDropdown(true);
          updateTxState(response.transactionHash, BridgeTxState.Pending);
          addTxExplorerUrl(
            response.transactionHash,
            ROUTER_TX_EXPLORER_URL + response.transactionHash,
          );
          watchTransaction(response.transactionHash);
        }
      } else {
        const response = await transferByHyperlaneAsync();

        if (response && response.length > 1) {
          const receipt = response[1]; // Add only transfer receipt to the queue not the approval

          addTxToQueue({
            hash: receipt.transactionHash,
            env:
              sourceChain.tag === 'live'
                ? 'live'
                : sourceChain.tag === 'test'
                  ? 'test'
                  : 'dev',
            sourceTypedChainId: calculateTypedChainId(
              sourceChain.chainType,
              sourceChain.id,
            ),
            destinationTypedChainId: calculateTypedChainId(
              destinationChain.chainType,
              destinationChain.id,
            ),
            sourceAddress: activeAccountAddress,
            recipientAddress: destinationAddress,
            sourceAmount: sendingAmount.toString(),
            destinationAmount: receivingAmount.toString(),
            tokenSymbol: token.tokenType,
            creationTimestamp: new Date().getTime(),
            bridgeType: EVMTokenBridgeEnum.Hyperlane,
          });

          setIsOpenQueueDropdown(true);
          updateTxState(receipt.transactionHash, BridgeTxState.Pending);
          const sourceTypedChainId = calculateTypedChainId(
            sourceChain.chainType,
            sourceChain.id,
          );
          if (chainsConfig[sourceTypedChainId].blockExplorers) {
            addTxExplorerUrl(
              receipt.transactionHash,
              makeExplorerUrl(
                chainsConfig[sourceTypedChainId].blockExplorers.default.url,
                receipt.transactionHash,
                'tx',
                'web3',
              ).toString(),
            );
          }
          watchTransaction(receipt.transactionHash);
        }
      }

      handleClose();
      clearBridgeStore();
    } catch (possibleError) {
      const error = ensureError(possibleError);

      notificationApi({
        message: error.message,
        variant: 'error',
      });

      handleClose();
      clearBridgeStore();
    }
  }, [
    sendingAmount,
    receivingAmount,
    token.bridgeType,
    token.tokenType,
    handleClose,
    clearBridgeStore,
    transferByRouterAsync,
    addTxToQueue,
    sourceChain.tag,
    sourceChain.chainType,
    sourceChain.id,
    destinationChain.chainType,
    destinationChain.id,
    activeAccountAddress,
    destinationAddress,
    setIsOpenQueueDropdown,
    updateTxState,
    watchTransaction,
    addTxExplorerUrl,
    transferByHyperlaneAsync,
    notificationApi,
  ]);

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => (open === false ? handleClose() : null)}
    >
      <ModalContent size="md">
        <ModalHeader>Confirm Bridge</ModalHeader>

        <ModalBody className="py-4">
          <div className="flex flex-col items-center gap-3">
            <ConfirmationItem
              type="source"
              chain={sourceChain}
              accAddress={activeAccountAddress}
              amount={feeDetails?.amounts.sending}
              tokenName={token.tokenType}
            />

            <ArrowDownIcon size="lg" />

            <ConfirmationItem
              type="destination"
              chain={destinationChain}
              accAddress={destinationAddress}
              amount={feeDetails?.amounts.receiving}
              tokenName={token.tokenType}
            />
          </div>

          {feeDetails && (
            <FeeDetail
              {...feeDetails}
              className="bg-mono-20 dark:bg-mono-170 rounded-xl"
            />
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            isFullWidth
            onClick={handleConfirm}
            isLoading={
              isTransferByRouterPending || isTransferByHyperlanePending
            }
            isDisabled={
              isTransferByRouterPending || isTransferByHyperlanePending
            }
          >
            {isTransferByRouterPending || isTransferByHyperlanePending
              ? 'Bridging'
              : 'Bridge'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const ConfirmationItem: FC<{
  type: 'source' | 'destination';
  chain: ChainConfig;
  accAddress: string;
  amount?: string;
  tokenName: string;
}> = ({ type, chain, accAddress, amount, tokenName }) => {
  const explorerUrl = useMemo(() => {
    if (!chain?.blockExplorers?.default?.url) return null;

    return makeExplorerUrl(
      chain.blockExplorers.default.url,
      accAddress,
      'address',
      'web3',
    ).toString();
  }, [chain, accAddress]);

  return (
    <div className="w-full p-4 space-y-2 bg-mono-20 dark:bg-mono-170 rounded-xl">
      <div className="flex items-center justify-between">
        <Typography variant="body1">
          {type === 'source' ? 'From' : 'To'}
        </Typography>

        <div className="flex items-center gap-1.5">
          <ChainIcon
            name={chain.displayName ?? chain.name}
            size="lg"
            spinnerSize="lg"
            className={cx(`shrink-0 grow-0 ${getFlexBasic('lg')}`)}
          />

          <Typography variant="h5" fw="bold" className="text-nowrap">
            {chain.displayName ?? chain.name}
          </Typography>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Typography variant="body1">Account</Typography>

        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1"
          >
            <Typography variant="h5" fw="bold" className="whitespace-nowrap">
              {isSolanaAddress(accAddress)
                ? shortenString(accAddress, 10)
                : shortenHex(accAddress, 10)}
            </Typography>

            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
          </a>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Typography variant="body1">Amount</Typography>

        <div className="flex items-center gap-2">
          <Typography variant="h5" fw="bold" className="text-nowrap">
            {amount ?? EMPTY_VALUE_PLACEHOLDER}
          </Typography>

          <TokenIcon
            name={tokenName}
            size="lg"
            spinnerSize="lg"
            className={cx(`shrink-0 grow-0 ${getFlexBasic('lg')}`)}
          />
        </div>
      </div>
    </div>
  );
};
