import { ArrowDownIcon } from '@heroicons/react/24/outline';
import { ChainConfig, chainsConfig } from '@webb-tools/dapp-config/chains';
import { ChainIcon } from '@webb-tools/icons/ChainIcon';
import { TokenIcon } from '@webb-tools/icons/TokenIcon';
import { getFlexBasic } from '@webb-tools/icons/utils';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { BridgeTxState } from '@webb-tools/tangle-shared-ui/types/bridge';
import { useWebbUI } from '@webb-tools/webb-ui-components';
import { Button } from '@webb-tools/webb-ui-components/components/buttons';
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@webb-tools/webb-ui-components/components/Modal';
import { Typography } from '@webb-tools/webb-ui-components/typography';
import { shortenHex } from '@webb-tools/webb-ui-components/utils';
import cx from 'classnames';
import { FC, useCallback } from 'react';

import { FeeDetail } from '../../components/bridge/FeeDetail';
import { useBridgeTxQueue } from '../../context/bridge/useBridgeTxQueue';
import { useRouterTransfer } from '../../hooks/bridge/useRouterTransfer';
import { BridgeTokenType } from '../../types/bridge/types';
import useBridgeStore from '../../context/bridge/useBridgeStore';
import { ROUTER_TX_EXPLORER_URL } from '../../constants/bridge/constants';
import { EVMTokenBridgeEnum } from '@webb-tools/evm-contract-metadata';

interface BridgeConfirmationModalProps {
  isOpen: boolean;
  handleClose: () => void;
  sourceChain: ChainConfig;
  destinationChain: ChainConfig;
  token: BridgeTokenType;
  feeDetails: {
    token: BridgeTokenType;
    amounts: {
      sending: string;
      receiving: string;
      bridgeFee: string;
    };
    estimatedTime: string;
  } | null;
  activeAccountAddress: string;
  destinationAddress: string;
  transferData: {
    routerQuoteData: any;
    fromTokenAddress: string;
    toTokenAddress: string;
    senderAddress: string;
    receiverAddress: string;
    refundAddress: string;
  };
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
  transferData,
}: BridgeConfirmationModalProps) => {
  const {
    mutateAsync: transferByRouterAsync,
    isPending: isTransferByRouterPending,
  } = useRouterTransfer({
    routerQuoteData: transferData.routerQuoteData,
    fromTokenAddress: transferData.fromTokenAddress,
    toTokenAddress: transferData.toTokenAddress,
    senderAddress: transferData.senderAddress,
    receiverAddress: transferData.receiverAddress,
    refundAddress: transferData.refundAddress,
  });

  const { notificationApi } = useWebbUI();

  const {
    addTxToQueue,
    setIsOpenQueueDropdown,
    updateTxState,
    addTxExplorerUrl,
  } = useBridgeTxQueue();

  const { sendingAmount, receivingAmount } = useBridgeStore();

  const handleConfirm = useCallback(async () => {
    try {
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
          sourceAmount: sendingAmount?.toString() ?? '',
          destinationAmount: receivingAmount?.toString() ?? '',
          tokenSymbol: token.tokenType,
          creationTimestamp: new Date().getTime(),
          bridgeType: EVMTokenBridgeEnum.Router,
        });

        setIsOpenQueueDropdown(true);

        updateTxState(response.transactionHash, BridgeTxState.Executed);

        if (
          chainsConfig[
            calculateTypedChainId(sourceChain.chainType, sourceChain.id)
          ].blockExplorers
        ) {
          addTxExplorerUrl(
            response.transactionHash,
            ROUTER_TX_EXPLORER_URL + response.transactionHash,
          );
        }
      }

      handleClose();
    } catch (error: unknown) {
      console.error('❌ Transfer failed:', error);
      notificationApi({
        message: 'Transfer failed',
        variant: 'error',
      });

      handleClose();
    }
  }, [
    setIsOpenQueueDropdown,
    transferByRouterAsync,
    addTxToQueue,
    sourceChain.tag,
    sourceChain.chainType,
    sourceChain.id,
    destinationChain.chainType,
    destinationChain.id,
    activeAccountAddress,
    destinationAddress,
    feeDetails?.amounts.sending,
    feeDetails?.amounts.receiving,
    token.tokenType,
    updateTxState,
    handleClose,
    addTxExplorerUrl,
    notificationApi,
  ]);

  return (
    <Modal open>
      <ModalContent isOpen={isOpen} onInteractOutside={handleClose} size="md">
        <ModalHeader onClose={handleClose}>Bridge Confirmation</ModalHeader>

        <div className="p-9 space-y-8">
          <div className="flex flex-col items-center gap-3">
            <ConfirmationItem
              type="source"
              chainName={sourceChain.displayName ?? sourceChain.name}
              accAddress={activeAccountAddress ?? ''}
              amount={feeDetails?.amounts.sending ?? ''}
              tokenName={token.tokenType}
            />

            <ArrowDownIcon className="w-6 h-6" />

            <ConfirmationItem
              type="destination"
              chainName={destinationChain.displayName ?? destinationChain.name}
              accAddress={destinationAddress}
              amount={feeDetails?.amounts.receiving ?? ''}
              tokenName={token.tokenType}
            />
          </div>

          {feeDetails && (
            <FeeDetail
              token={feeDetails.token}
              estimatedTime={feeDetails.estimatedTime}
              amounts={feeDetails.amounts}
              className="bg-mono-20 dark:bg-mono-170 rounded-xl"
            />
          )}
        </div>

        <ModalFooter className="flex items-center gap-2">
          <Button
            isFullWidth
            onClick={handleConfirm}
            isLoading={isTransferByRouterPending}
            isDisabled={isTransferByRouterPending}
          >
            {isTransferByRouterPending ? 'Bridging...' : 'Bridge'}
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
  amount: string;
  tokenName: string;
}> = ({ type, chainName, accAddress, amount, tokenName }) => {
  return (
    <div className="bg-mono-20 dark:bg-mono-170 w-full space-y-2 p-4 rounded-xl">
      <div className="flex justify-between items-center">
        <Typography variant="body1" className="!text-lg">
          {type === 'source' ? 'From' : 'To'}
        </Typography>
        <div className="flex items-center gap-1.5">
          <ChainIcon
            name={chainName}
            size="lg"
            spinnersize="lg"
            className={cx(`shrink-0 grow-0 ${getFlexBasic('lg')}`)}
          />
          <Typography variant="h5" fw="bold" className="!text-lg">
            {chainName}
          </Typography>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <Typography variant="body1" className="!text-lg">
          Account
        </Typography>
        <Typography variant="h5" fw="bold" className="!text-lg">
          {shortenHex(accAddress, 10)}
        </Typography>
      </div>
      <div className="flex justify-between items-center">
        <Typography variant="body1" className="!text-lg">
          Amount
        </Typography>
        <div className="flex items-center gap-1.5">
          <TokenIcon
            name={tokenName}
            size="lg"
            spinnersize="lg"
            className={cx(`shrink-0 grow-0 ${getFlexBasic('lg')}`)}
          />
          <Typography variant="h5" fw="bold" className="!text-lg">
            {amount}
          </Typography>
        </div>
      </div>
    </div>
  );
};
