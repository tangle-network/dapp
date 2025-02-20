import { useWebContext } from '@tangle-network/api-provider-environment';
import {
  InputField,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  shortenString,
  Typography,
} from '@tangle-network/ui-components';
import { TANGLE_DOCS_STAKING_URL } from '@tangle-network/ui-components/constants';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';

import { MAX_PAYOUTS_BATCH_SIZE } from '../data/payouts/usePayoutAllTx';
import usePayoutStakersTxTwo from '../data/payouts/usePayoutStakersTx';
import { TxStatus } from '../hooks/useSubstrateTx';
import { Payout } from '@tangle-network/tangle-shared-ui/types';

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  payout: Payout;
  onSuccess?: () => void;
};

const PayoutTxModal: FC<Props> = ({
  isModalOpen,
  setIsModalOpen,
  payout,
  onSuccess,
}) => {
  const { activeAccount } = useWebContext();

  const [txIsCompleted, setTxIsCompleted] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [isProcessingChunks, setIsProcessingChunks] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) {
      return '0x0';
    }

    return activeAccount.address;
  }, [activeAccount?.address]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, [setIsModalOpen]);

  const {
    execute: executeClaimPayouts,
    status: claimPayoutsTxStatus,
    error,
  } = usePayoutStakersTxTwo();

  const eraChunks = useMemo(() => {
    // Sort eras in ascending order
    const sortedEras = [...payout.eras].sort((a, b) => a - b);

    // Split into chunks of MAX_PAYOUTS_BATCH_SIZE
    const chunks: number[][] = [];
    for (let i = 0; i < sortedEras.length; i += MAX_PAYOUTS_BATCH_SIZE) {
      chunks.push(sortedEras.slice(i, i + MAX_PAYOUTS_BATCH_SIZE));
    }
    return chunks;
  }, [payout.eras]);

  const erasClaimingFor = useMemo(() => {
    return eraChunks[currentChunkIndex] || [];
  }, [eraChunks, currentChunkIndex]);

  console.log('erasClaimingFor', erasClaimingFor);

  const eraRangeText = useMemo(() => {
    if (erasClaimingFor.length === 0) return '';
    return erasClaimingFor.join(', ');
  }, [erasClaimingFor]);

  const processChunk = useCallback(
    async (index: number) => {
      if (!executeClaimPayouts) {
        console.warn('executeClaimPayouts not available');
        setIsProcessingChunks(false);
        setTxIsCompleted(true);
        return;
      }

      const chunk = eraChunks[index];
      if (!chunk) {
        console.warn('No chunk found at index:', index);
        return;
      }

      console.log(`Processing chunk ${index + 1}/${eraChunks.length}:`, {
        validator: payout.validator,
        eras: chunk,
      });

      await executeClaimPayouts({
        payout: {
          ...payout,
          eras: chunk,
        },
      });
    },
    [executeClaimPayouts, eraChunks, payout],
  );

  const submitTx = useCallback(async () => {
    try {
      setTxIsCompleted(false);
      setCurrentChunkIndex(0);
      setIsProcessingChunks(true);

      await processChunk(0);
    } catch (err) {
      console.error('Failed to start transaction process:', err);
      setIsProcessingChunks(false);
      setTxIsCompleted(true);
    }
  }, [processChunk]);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isModalOpen) {
      setCurrentChunkIndex(0);
      setIsProcessingChunks(false);
      setTxIsCompleted(true);
      setIsModalClosing(false);
    }
  }, [isModalOpen]);

  // Watch for transaction completion and trigger next chunk
  useEffect(() => {
    if (!isProcessingChunks || claimPayoutsTxStatus !== TxStatus.COMPLETE) {
      return;
    }

    const nextIndex = currentChunkIndex + 1;
    console.log('Processing completion:', {
      nextIndex,
      total: eraChunks.length,
    });

    if (nextIndex >= eraChunks.length) {
      console.log('All chunks completed, waiting for chain...');
      // All chunks are done
      setTxIsCompleted(true);
      setIsProcessingChunks(false);
      
      // Wait for chain to process the last transaction before revalidating
      setTimeout(() => {
        console.log('Chain processed, revalidating data...');
        onSuccess?.();
        closeModal();
      }, 6000); // Give chain time to process
      return;
    }

    // Add a delay before processing the next chunk
    const timer = setTimeout(() => {
      console.log('Starting next chunk:', nextIndex);
      setCurrentChunkIndex(nextIndex);
      processChunk(nextIndex).catch((err) => {
        console.error('Failed to process chunk:', err);
        setIsProcessingChunks(false);
        setTxIsCompleted(true);
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, [
    claimPayoutsTxStatus,
    currentChunkIndex,
    eraChunks.length,
    isProcessingChunks,
    processChunk,
    closeModal,
    onSuccess,
  ]);

  // Close modal on error
  useEffect(() => {
    if (error) {
      console.error('Payout transaction error:', error);
      closeModal();
    }
  }, [error, closeModal]);

  // Handle modal closing
  useEffect(() => {
    if (error) {
      closeModal();
    }
  }, [error, closeModal]);

  return (
    <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
      <ModalContent size="lg">
        <ModalHeader>Payout Stakers</ModalHeader>

        <ModalBody className="grid grid-cols-2 gap-9">
          <div className="flex flex-col gap-9">
            {/* Initiator */}
            <InputField.Root>
              <InputField.Input
                title="Request Payout From"
                isAddressType
                value={walletAddress}
                type="text"
                readOnly
              />
            </InputField.Root>

            {/* Validator */}
            <InputField.Root>
              <InputField.Input
                title="Payout Stakers For"
                isAddressType
                addressTheme="substrate"
                value={payout.validator.address}
                type="text"
                readOnly
              />
            </InputField.Root>

            {/* Eras */}
            <InputField.Root>
              <InputField.Input
                title="Claiming Eras"
                isAddressType={false}
                value={eraRangeText}
                type="text"
                readOnly
              />
            </InputField.Root>
          </div>

          <div className="flex flex-col gap-9">
            <Typography variant="body1">
              You are about to claim rewards for {erasClaimingFor.length} eras
              from validator{' '}
              {payout.validator.identity ||
                shortenString(payout.validator.address, 10)}
            </Typography>

            <Typography variant="body1">
              Claiming eras: {eraRangeText}
            </Typography>

            <Typography variant="body1">
              Note: Processing {eraChunks.length} batches of{' '}
              {MAX_PAYOUTS_BATCH_SIZE} eras each.
              {isProcessingChunks && (
                <>
                  <br />
                  Progress: {currentChunkIndex} of {eraChunks.length} batches
                  processed
                  <br />
                  {claimPayoutsTxStatus === TxStatus.PROCESSING
                    ? `Signing transaction for batch ${currentChunkIndex + 1}...`
                    : `Preparing batch ${currentChunkIndex + 1} of ${eraChunks.length}...`}
                </>
              )}
            </Typography>
          </div>
        </ModalBody>

        <ModalFooterActions
          learnMoreLinkHref={TANGLE_DOCS_STAKING_URL}
          isConfirmDisabled={false}
          // isProcessing={claimPayoutsTxStatus === TxStatus.PROCESSING}
          isProcessing={!txIsCompleted}
          onConfirm={submitTx}
        />
      </ModalContent>
    </Modal>
  );
};

export default PayoutTxModal;
