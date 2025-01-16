import { ArrowDownIcon } from '@heroicons/react/24/outline';
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
import { FC, useCallback } from 'react';

import { makeExplorerUrl } from '@webb-tools/api-provider-environment/transaction/utils';
import { FeeDetail, FeeDetailProps } from '../components/FeeDetail';
import { ROUTER_TX_EXPLORER_URL } from '../constants';
import { useBridgeTxQueue } from '../context/BridgeTxQueueContext';
import { useHyperlaneTransfer } from '../hooks/useHyperlaneTransfer';
import { useRouterTransfer } from '../hooks/useRouterTransfer';
import { Decimal } from 'decimal.js';

interface BridgeConfirmationModalProps {
  isOpen: boolean;
  handleClose: () => void;
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
    addTxExplorerUrl,
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
          updateTxState(response.transactionHash, BridgeTxState.Executed);

          addTxExplorerUrl(
            response.transactionHash,
            ROUTER_TX_EXPLORER_URL + response.transactionHash,
          );
        }
      } else {
        const response = await transferByHyperlaneAsync();

        if (response && response.length > 0) {
          for (const receipt of response) {
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

            updateTxState(receipt.transactionHash, BridgeTxState.Executed);

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
          }

          setIsOpenQueueDropdown(true);
        }
      }

      handleClose();
    } catch (possibleError) {
      const error = ensureError(possibleError);

      notificationApi({
        message: error.message,
        variant: 'error',
      });

      handleClose();
    }
  }, [
    token.bridgeType,
    token.tokenType,
    handleClose,
    transferByRouterAsync,
    addTxToQueue,
    sourceChain.tag,
    sourceChain.chainType,
    sourceChain.id,
    destinationChain.chainType,
    destinationChain.id,
    activeAccountAddress,
    destinationAddress,
    sendingAmount,
    receivingAmount,
    setIsOpenQueueDropdown,
    updateTxState,
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

        <ModalBody>
          <div className="flex flex-col items-center gap-3">
            <ConfirmationItem
              type="source"
              chainName={sourceChain.displayName ?? sourceChain.name}
              accAddress={activeAccountAddress}
              amount={feeDetails?.amounts.sending}
              tokenName={token.tokenType}
            />

            <ArrowDownIcon className="w-6 h-6" />

            <ConfirmationItem
              type="destination"
              chainName={destinationChain.displayName ?? destinationChain.name}
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
  chainName: string;
  accAddress: string;
  amount?: string;
  tokenName: string;
}> = ({ type, chainName, accAddress, amount, tokenName }) => {
  return (
    <div className="w-full p-4 space-y-2 bg-mono-20 dark:bg-mono-170 rounded-xl">
      <div className="flex items-center justify-between">
        <Typography variant="body1">
          {type === 'source' ? 'From' : 'To'}
        </Typography>

        <div className="flex items-center gap-1.5">
          <ChainIcon
            name={chainName}
            size="lg"
            spinnerSize="lg"
            className={cx(`shrink-0 grow-0 ${getFlexBasic('lg')}`)}
          />

          <Typography variant="h5" fw="bold">
            {chainName}
          </Typography>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Typography variant="body1">Account</Typography>

        <Typography variant="h5" fw="bold">
          {isSolanaAddress(accAddress)
            ? shortenString(accAddress, 10)
            : shortenHex(accAddress, 10)}
        </Typography>
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
