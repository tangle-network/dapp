'use client';

import { ArrowRight, ChainIcon, TokenIcon } from '@webb-tools/icons';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback } from 'react';

import { useBridge } from '../../context/BridgeContext';
import { useBridgeTxQueue } from '../../context/BridgeTxQueueContext';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import FeeDetails from './FeeDetails';
import useAmountInDecimals from './hooks/useAmountInDecimals';
import useBridgeFee from './hooks/useBridgeFee';
import useBridgeTransfer from './hooks/useBridgeTransfer';
import useEstimatedGasFee from './hooks/useEstimatedGasFee';
import useSelectedToken from './hooks/useSelectedToken';

interface BridgeConfirmationModalProps {
  isOpen: boolean;
  handleClose: () => void;
}

const BridgeConfirmationModal: FC<BridgeConfirmationModalProps> = ({
  isOpen,
  handleClose,
}) => {
  const { notificationApi } = useWebbUI();
  const activeAccountAddress = useActiveAccountAddress();
  const { setIsOpenQueueDropdown } = useBridgeTxQueue();
  const {
    selectedSourceChain,
    selectedDestinationChain,
    destinationAddress,
    setAmount,
    setDestinationAddress,
    bridgeFee,
    isBridgeFeeLoading,
    isEstimatedGasFeeLoading,
    isTransferring,
    setIsTransferring,
  } = useBridge();
  const selectedToken = useSelectedToken();
  const { sourceAmountInDecimals, destinationAmountInDecimals } =
    useAmountInDecimals();

  useBridgeFee();
  useEstimatedGasFee();

  const cleanUpWhenSubmit = useCallback(() => {
    handleClose();
    setAmount(null);
    setDestinationAddress('');
  }, [handleClose, setAmount, setDestinationAddress]);

  const transfer = useBridgeTransfer({
    onTxAddedToQueue: () => {
      cleanUpWhenSubmit();
      setIsOpenQueueDropdown(true);
    },
  });

  const bridgeTx = useCallback(async () => {
    try {
      setIsTransferring(true);
      await transfer();
    } catch {
      notificationApi({
        variant: 'error',
        message: 'Bridge Failed',
      });
    } finally {
      setIsTransferring(false);
    }
  }, [transfer, notificationApi, setIsTransferring]);

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isOpen}
        className="w-full max-w-[calc(100vw-40px)] md:max-w-[500px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader titleVariant="h4" onClose={handleClose}>
          Bridge Confirmation
        </ModalHeader>

        <div className="p-9 space-y-8">
          <div className="flex flex-col items-center gap-4">
            <ConfirmationItem
              type="source"
              chainName={selectedSourceChain.name}
              accAddress={activeAccountAddress ?? ''}
              amount={sourceAmountInDecimals?.toString() ?? ''}
              tokenName={selectedToken.symbol}
            />

            <ArrowRight size="lg" className="rotate-90" />

            <ConfirmationItem
              type="destination"
              chainName={selectedDestinationChain.name}
              accAddress={destinationAddress}
              amount={destinationAmountInDecimals?.toString() ?? ''}
              tokenName={selectedToken.symbol}
            />
          </div>

          <FeeDetails />
        </div>

        <ModalFooter className="flex flex-col gap-1 px-8 py-6">
          <Button
            isFullWidth
            isLoading={isTransferring}
            onClick={() => {
              bridgeTx();
              handleClose(); // TODO: handle clear form
            }}
            isDisabled={
              isBridgeFeeLoading ||
              isEstimatedGasFeeLoading ||
              bridgeFee === null ||
              !sourceAmountInDecimals ||
              !destinationAmountInDecimals ||
              !destinationAddress
            }
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BridgeConfirmationModal;

const ConfirmationItem: FC<{
  type: 'source' | 'destination';
  chainName: string;
  accAddress: string;
  amount: string;
  tokenName: string;
}> = ({ type, chainName, accAddress, amount, tokenName }) => {
  return (
    <div className="bg-mono-20 dark:bg-mono-160 w-full space-y-2 p-4 rounded-xl">
      <div className="flex justify-between items-center">
        <Typography variant="body1">
          {type === 'source' ? 'From' : 'To'}
        </Typography>
        <div className="flex items-center gap-1.5">
          <ChainIcon name={chainName} />
          <Typography variant="body1">{chainName}</Typography>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <Typography variant="body1">Account</Typography>
        <Typography
          variant="body1"
          className="max-w-[65%] break-words text-right"
        >
          {accAddress}
        </Typography>
      </div>
      <div className="flex justify-between items-center">
        <Typography variant="body1">Amount</Typography>
        <div className="flex items-center gap-1.5">
          <Typography variant="body1" fw="bold">
            {amount}
          </Typography>
          <TokenIcon name={tokenName} />
          <Typography variant="body1">{tokenName}</Typography>
        </div>
      </div>
    </div>
  );
};
