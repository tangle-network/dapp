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
import { FC, useCallback, useMemo } from 'react';
import useWalletClient from '../../data/bridge/useWalletClient';

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
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid';
import { ArrowDownIcon } from '@webb-tools/icons';
import axios from 'axios';
import useIsBridgeNativeToken from '../../hooks/useIsBridgeNativeToken';
import useLocalStorage, {
  LocalStorageKey,
  BridgeDestTxStatus,
} from '@webb-tools/tangle-shared-ui/hooks/useLocalStorage';

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
  isTxInProgress: boolean;
  setIsTxInProgress: (isTxInProgress: boolean) => void;
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
  setIsTxInProgress,
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

  const isNativeToken = useIsBridgeNativeToken(
    calculateTypedChainId(sourceChain.chainType, sourceChain.id),
    token,
  );

  const { notificationApi } = useWebbUI();

  const { setWithPreviousValue: setTokensToAcc, valueOpt: cachedTokensToAcc } =
    useLocalStorage(LocalStorageKey.BRIDGE_TOKENS_TO_ACC);

  const { setWithPreviousValue: setDestTxIds, valueOpt: cachedDestTxIds } =
    useLocalStorage(LocalStorageKey.BRIDGE_DEST_TX_IDS);

  const srcChainPublicClient = createPublicClient({
    chain: sourceChain,
    transport: http(),
  });

  const checkHyperlaneMessageDelivery = useCallback(
    async (
      sourceTxHash: string,
      messageId: string,
      destChain: ChainConfig,
      status: BridgeDestTxStatus,
    ) => {
      if (
        status === BridgeDestTxStatus.Completed ||
        status === BridgeDestTxStatus.Failed
      )
        return;

      try {
        const destinationTypedChainId = calculateTypedChainId(
          destChain.chainType,
          destChain.id,
        );

        updateTxDestinationTxState(sourceTxHash, '', BridgeTxState.Pending);

        const dstChainPublicClient = createPublicClient({
          chain: destChain,
          transport: http(),
        });

        const mailboxContract = getContract({
          address: mailboxAddress[destinationTypedChainId] as `0x${string}`,
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

            if (receipt.status === 'success') {
              updateTxDestinationTxState(
                sourceTxHash,
                receipt.transactionHash,
                BridgeTxState.Completed,
              );
              setDestTxIds((prevValue) => {
                const currentDestTxIds = prevValue?.value || {};
                const updatedDestTxIds = {
                  ...currentDestTxIds,
                  [activeAccountAddress]: {
                    hyperlane:
                      currentDestTxIds[activeAccountAddress]?.hyperlane.map(
                        (item) =>
                          item.srcTx === sourceTxHash
                            ? { ...item, status: BridgeDestTxStatus.Completed }
                            : item,
                      ) || [],
                    router: currentDestTxIds[activeAccountAddress]?.router,
                  },
                };
                return updatedDestTxIds;
              });
            } else {
              updateTxDestinationTxState(
                sourceTxHash,
                receipt.transactionHash,
                BridgeTxState.Failed,
              );
              setDestTxIds((prevValue) => {
                const currentDestTxIds = prevValue?.value || {};
                const updatedDestTxIds = {
                  ...currentDestTxIds,
                  [activeAccountAddress]: {
                    hyperlane:
                      currentDestTxIds[activeAccountAddress]?.hyperlane.map(
                        (item) =>
                          item.srcTx === sourceTxHash
                            ? { ...item, status: BridgeDestTxStatus.Failed }
                            : item,
                      ) || [],
                    router: currentDestTxIds[activeAccountAddress]?.router.map(
                      (item) =>
                        item.srcTx === sourceTxHash
                          ? { ...item, status: BridgeDestTxStatus.Failed }
                          : item,
                    ),
                  },
                };
                return updatedDestTxIds;
              });
            }

            if (chainsConfig[destinationTypedChainId].blockExplorers) {
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
          }
        }

        return isDelivered;
      } catch (error) {
        console.error('Error checking hyperlane message delivery:', error);
        return false;
      }
    },
    [
      updateTxDestinationTxState,
      setDestTxIds,
      activeAccountAddress,
      addTxDestinationTxExplorerUrl,
    ],
  );

  const finalizePendingHyperlaneTxs = useCallback(async () => {
    const destTxnIds = cachedDestTxIds?.value;

    if (!destTxnIds) return;

    const hyperlaneTxIds = destTxnIds[activeAccountAddress].hyperlane;

    if (hyperlaneTxIds.length === 0) return;

    const checkedHyperlaneTxs = hyperlaneTxIds.map((txId) => {
      return checkHyperlaneMessageDelivery(
        txId.srcTx,
        txId.msgId,
        txId.destChain,
        txId.status,
      );
    });

    return await Promise.all(checkedHyperlaneTxs);
  }, [
    activeAccountAddress,
    cachedDestTxIds?.value,
    checkHyperlaneMessageDelivery,
  ]);

  const enableFinalizePendingHyperlaneTxs = useMemo(() => {
    const destTxnIds = cachedDestTxIds?.value;

    if (!destTxnIds) {
      return false;
    }

    const hyperlaneTxIds = destTxnIds[activeAccountAddress]?.hyperlane || [];

    if (hyperlaneTxIds.length === 0) {
      return false;
    }

    return hyperlaneTxIds.some(
      (txId) => txId.status === BridgeDestTxStatus.Pending,
    );
  }, [activeAccountAddress, cachedDestTxIds?.value]);

  useQuery({
    queryKey: ['hyperlaneMessageDelivery'],
    queryFn: () => {
      return finalizePendingHyperlaneTxs();
    },
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
    enabled: enableFinalizePendingHyperlaneTxs,
    retry: true,
  });

  const checkRouterMessageDelivery = useCallback(
    async (sourceTxHash: string, status: BridgeDestTxStatus) => {
      if (
        status === BridgeDestTxStatus.Completed ||
        status === BridgeDestTxStatus.Failed
      )
        return;

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
          setDestTxIds((prevValue) => {
            const currentDestTxIds = prevValue?.value || {};
            const updatedDestTxIds = {
              ...currentDestTxIds,
              [activeAccountAddress]: {
                router:
                  currentDestTxIds[activeAccountAddress]?.router.map((item) =>
                    item.srcTx === sourceTxHash
                      ? { ...item, status: BridgeDestTxStatus.Failed }
                      : item,
                  ) || [],
                hyperlane: currentDestTxIds[activeAccountAddress]?.hyperlane,
              },
            };
            return updatedDestTxIds;
          });
        } else if (response.data.status === 'completed') {
          updateTxState(sourceTxHash, BridgeTxState.Completed);
          setDestTxIds((prevValue) => {
            const currentDestTxIds = prevValue?.value || {};
            const updatedDestTxIds = {
              ...currentDestTxIds,
              [activeAccountAddress]: {
                router:
                  currentDestTxIds[activeAccountAddress]?.router.map((item) =>
                    item.srcTx === sourceTxHash
                      ? { ...item, status: BridgeDestTxStatus.Completed }
                      : item,
                  ) || [],
                hyperlane: currentDestTxIds[activeAccountAddress]?.hyperlane,
              },
            };
            return updatedDestTxIds;
          });
        }

        return true;
      } catch (error) {
        console.error('Error checking router message delivery:', error);
        return false;
      }
    },
    [activeAccountAddress, setDestTxIds, updateTxState],
  );

  const finalizePendingRouterTxs = useCallback(async () => {
    const destTxnIds = cachedDestTxIds?.value;

    if (!destTxnIds) {
      return;
    }

    const routerTxnIds = destTxnIds[activeAccountAddress].router;

    if (routerTxnIds.length === 0) return;

    const checkedRouterTxs = routerTxnIds.map((txId) => {
      return checkRouterMessageDelivery(txId.srcTx, txId.status);
    });

    return await Promise.all(checkedRouterTxs);
  }, [checkRouterMessageDelivery, cachedDestTxIds, activeAccountAddress]);

  const enableFinalizePendingRouterTxs = useMemo(() => {
    const destTxnIds = cachedDestTxIds?.value;

    if (!destTxnIds) {
      return false;
    }

    const routerTxnIds = destTxnIds[activeAccountAddress]?.router || [];

    if (routerTxnIds.length === 0) {
      return false;
    }

    return routerTxnIds.some(
      (txId) => txId.status === BridgeDestTxStatus.Pending,
    );
  }, [cachedDestTxIds, activeAccountAddress]);

  useQuery({
    queryKey: ['routerMessageDelivery'],
    queryFn: () => {
      return finalizePendingRouterTxs();
    },
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
    enabled: enableFinalizePendingRouterTxs,
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
              setDestTxIds((prevValue) => {
                const currentDestTxIds = prevValue?.value || {};
                const updatedDestTxIds = {
                  ...currentDestTxIds,
                  [activeAccountAddress]: {
                    router: [
                      ...(currentDestTxIds[activeAccountAddress]?.router || []),
                    ],
                    hyperlane: [
                      ...(currentDestTxIds[activeAccountAddress]?.hyperlane ||
                        []),
                      {
                        srcTx: txHash,
                        msgId: message[0].id,
                        destChain: destinationChain,
                        status: BridgeDestTxStatus.Pending,
                      },
                    ],
                  },
                };
                return updatedDestTxIds;
              });
            }
          } else {
            updateTxState(txHash, BridgeTxState.Pending);
            setDestTxIds((prevValue) => {
              const currentDestTxIds = prevValue?.value || {};
              const updatedDestTxIds = {
                ...currentDestTxIds,
                [activeAccountAddress]: {
                  router: [
                    ...(currentDestTxIds[activeAccountAddress]?.router || []),
                    { srcTx: txHash, status: BridgeDestTxStatus.Pending },
                  ],
                  hyperlane: currentDestTxIds[activeAccountAddress]?.hyperlane,
                },
              };
              return updatedDestTxIds;
            });
          }
        } else {
          updateTxState(txHash, BridgeTxState.Failed);
        }
      } catch (error) {
        console.error('Error watching transaction:', error);
        updateTxState(txHash, BridgeTxState.Failed);
      }
    },
    [
      srcChainPublicClient,
      token.bridgeType,
      updateTxState,
      setDestTxIds,
      activeAccountAddress,
      destinationChain,
    ],
  );

  const walletClient = useWalletClient();

  const handleConfirm = useCallback(async () => {
    setIsTxInProgress(true);

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

          setIsTxInProgress(false);
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

      setIsTxInProgress(false);

      handleClose();
      clearBridgeStore();

      const isTokenAlreadyAdded = cachedTokensToAcc?.value?.[
        activeAccountAddress
      ]?.includes(token.address);

      if (!isNativeToken && walletClient && !isTokenAlreadyAdded) {
        const success = await walletClient.watchAsset({
          type: 'ERC20',
          options: {
            address: token.address,
            decimals: token.decimals,
            symbol: token.tokenSymbol,
          },
        });

        if (success) {
          setTokensToAcc((prevValue) => {
            const currentTokens = prevValue?.value || {};
            const updatedTokens = {
              ...currentTokens,
              [activeAccountAddress]: [
                ...(currentTokens[activeAccountAddress] || []),
                token.address,
              ],
            };
            return updatedTokens;
          });

          notificationApi({
            message: `${token.tokenSymbol} was successfully added to your wallet`,
            variant: 'success',
          });
        } else {
          notificationApi({
            message: `Failed to add ${token.tokenSymbol} to your wallet`,
            variant: 'error',
          });
        }
      }
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
    setIsTxInProgress,
    sendingAmount,
    receivingAmount,
    token.bridgeType,
    token.address,
    token.tokenType,
    token.decimals,
    token.tokenSymbol,
    handleClose,
    clearBridgeStore,
    cachedTokensToAcc?.value,
    activeAccountAddress,
    isNativeToken,
    walletClient,
    transferByRouterAsync,
    addTxToQueue,
    sourceChain.tag,
    sourceChain.chainType,
    sourceChain.id,
    destinationChain.chainType,
    destinationChain.id,
    destinationAddress,
    setIsOpenQueueDropdown,
    updateTxState,
    addTxExplorerUrl,
    watchTransaction,
    transferByHyperlaneAsync,
    setTokensToAcc,
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
