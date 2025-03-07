import { IMailbox__factory } from '@hyperlane-xyz/core';
import { HyperlaneCore } from '@hyperlane-xyz/sdk';
import { makeExplorerUrl } from '@tangle-network/api-provider-environment/transaction/utils';
import { ChainConfig, chainsConfig } from '@tangle-network/dapp-config/chains';
import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import { EVMTokenBridgeEnum } from '@tangle-network/evm-contract-metadata';
import { ArrowDownIcon } from '@tangle-network/icons/ArrowDownIcon';
import { ChainIcon } from '@tangle-network/icons/ChainIcon';
import { ExternalLinkLine } from '@tangle-network/icons/ExternalLinkLine';
import { TokenIcon } from '@tangle-network/icons/TokenIcon';
import { getFlexBasic } from '@tangle-network/icons/utils';
import { mailboxAddress } from '@tangle-network/tangle-shared-ui/constants/bridge';
import useLocalStorage, {
  BridgeDestTxStatus,
  LocalStorageKey,
} from '@tangle-network/tangle-shared-ui/hooks/useLocalStorage';
import {
  BridgeToken,
  BridgeTxState,
} from '@tangle-network/tangle-shared-ui/types';
import ensureError from '@tangle-network/tangle-shared-ui/utils/ensureError';
import {
  EMPTY_VALUE_PLACEHOLDER,
  useUIContext,
} from '@tangle-network/ui-components';
import { Button } from '@tangle-network/ui-components/components/buttons';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@tangle-network/ui-components/components/Modal';
import { Typography } from '@tangle-network/ui-components/typography';
import {
  isSolanaAddress,
  shortenHex,
  shortenString,
} from '@tangle-network/ui-components/utils';
import { useQuery } from '@tanstack/react-query';
import cx from 'classnames';
import { Decimal } from 'decimal.js';
import { FC, useCallback, useMemo } from 'react';
import { createPublicClient, getContract, http } from 'viem';
import useBridgeTxQueue from '../context/BridgeTxQueueContext/useBridgeTxQueue';
import { useHyperlaneTransfer } from '../hooks/useHyperlaneTransfer';
import useWalletClient from '../hooks/useWalletClient';
import useIsNativeToken from '../hooks/useIsNativeToken';
import { BridgeFeeDetail, BridgeFeeDetailProps } from './BridgeFeeDetail';
import SkeletonLoader from '@tangle-network/ui-components/components/SkeletonLoader';

interface BridgeConfirmationModalProps {
  isOpen: boolean;
  handleClose: () => void;
  clearBridgeStore: () => void;
  sourceChain: ChainConfig;
  destinationChain: ChainConfig;
  token: BridgeToken | null;
  feeDetails: BridgeFeeDetailProps | null;
  activeAccountAddress: string;
  destinationAddress: string;
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
  sendingAmount,
  receivingAmount,
  isTxInProgress,
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

  const isNativeToken = useIsNativeToken(
    calculateTypedChainId(sourceChain.chainType, sourceChain.id),
  );

  const { notificationApi } = useUIContext();

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
                ),
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

  const watchTransaction = useCallback(
    async (token: BridgeToken, txHash: string) => {
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

      if (!token) {
        throw new Error('Token not found');
      }

      const response = await transferByHyperlaneAsync();

      if (token && response && response.length > 1) {
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
            ),
          );
        }
        watchTransaction(token, receipt.transactionHash);
      }

      setIsTxInProgress(false);

      handleClose();
      clearBridgeStore();

      const isTokenAlreadyAdded = token.address
        ? cachedTokensToAcc?.value?.[activeAccountAddress]?.includes(
            token.address,
          )
        : false;

      if (!isNativeToken && walletClient && !isTokenAlreadyAdded && token) {
        const success = await walletClient.watchAsset({
          type: 'ERC20',
          options: {
            address: token.address,
            decimals: token.decimals,
            symbol: token.symbol,
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
            message: `${token.symbol} was successfully added to your wallet`,
            variant: 'success',
          });
        } else {
          notificationApi({
            message: `Failed to add ${token.symbol} to your wallet`,
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
    token,
    handleClose,
    clearBridgeStore,
    cachedTokensToAcc?.value,
    activeAccountAddress,
    isNativeToken,
    walletClient,
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
      onOpenChange={(open) => {
        if (open === false && isTxInProgress) {
          return;
        }

        if (open === false) {
          handleClose();
        }
      }}
    >
      <ModalContent size="md">
        <ModalHeader>Confirm Bridge</ModalHeader>

        <ModalBody className="py-4">
          <div className="flex flex-col items-center gap-3">
            {token?.tokenType && feeDetails?.amounts.sending ? (
              <ConfirmationItem
                type="source"
                chain={sourceChain}
                accAddress={activeAccountAddress}
                amount={feeDetails.amounts.sending}
                tokenName={token.tokenType}
              />
            ) : (
              <SkeletonLoader size="xl" />
            )}

            <ArrowDownIcon size="lg" />

            {token?.tokenType && feeDetails?.amounts.receiving ? (
              <ConfirmationItem
                type="destination"
                chain={destinationChain}
                accAddress={destinationAddress}
                amount={feeDetails.amounts.receiving}
                tokenName={token.tokenType}
              />
            ) : (
              <SkeletonLoader size="xl" />
            )}
          </div>

          {token && feeDetails ? (
            <BridgeFeeDetail
              {...feeDetails}
              className="bg-mono-20 dark:bg-mono-170 rounded-xl"
            />
          ) : (
            <SkeletonLoader size="xl" />
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            isFullWidth
            onClick={handleConfirm}
            isLoading={isTransferByHyperlanePending}
            isDisabled={!token || !feeDetails || isTransferByHyperlanePending}
          >
            {isTransferByHyperlanePending ? 'Bridging' : 'Bridge'}
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
    );
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

          <Typography
            variant="body1"
            fw="normal"
            className="text-nowrap text-mono-200 dark:text-mono-0"
          >
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
            <Typography
              variant="body1"
              fw="normal"
              className="whitespace-nowrap text-mono-200 dark:text-mono-0"
            >
              {isSolanaAddress(accAddress)
                ? shortenString(accAddress, 10)
                : shortenHex(accAddress, 10)}
            </Typography>

            <ExternalLinkLine className="size-5" />
          </a>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Typography variant="body1">Amount</Typography>

        <div className="flex items-center gap-2">
          <TokenIcon
            name={tokenName}
            size="lg"
            spinnerSize="lg"
            className={cx(`shrink-0 grow-0 ${getFlexBasic('lg')}`)}
          />

          <Typography
            variant="body1"
            fw="normal"
            className="text-nowrap text-mono-200 dark:text-mono-0"
          >
            {amount ?? EMPTY_VALUE_PLACEHOLDER}
          </Typography>
        </div>
      </div>
    </div>
  );
};
