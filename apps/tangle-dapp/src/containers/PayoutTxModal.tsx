import { useWebContext } from '@tangle-network/api-provider-environment';
import { useClaimedEras } from '../hooks/useClaimedEras';
import { TxStatus } from '../hooks/useSubstrateTx';
import {
  InputField,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  toSubstrateAddress,
  Typography,
} from '@tangle-network/ui-components';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import usePayoutStakersTx, {
  MAX_PAYOUTS_BATCH_SIZE,
} from '../data/payouts/usePayoutStakersTx';
import { Payout } from '@tangle-network/tangle-shared-ui/types';

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  payout: Payout;
  onSuccess?: () => void;
};

const TRANSACTION_CHECK_DELAY = 4000;

const PayoutTxModal: FC<Props> = ({
  isModalOpen,
  setIsModalOpen,
  payout,
  onSuccess,
}) => {
  const { activeAccount } = useWebContext();
  const { getClaimedEras, addClaimedEras } = useClaimedEras();
  const {
    execute: executePayoutStakersTx,
    status: payoutStakersTxStatus,
    error,
  } = usePayoutStakersTx();

  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processedEras, setProcessedEras] = useState<number[]>([]);
  const [claimedEras, setClaimedEras] = useState<number[]>([]);

  const walletAddress = useMemo(() => {
    const address = activeAccount?.address
      ? toSubstrateAddress(activeAccount?.address)
      : null;
    return address;
  }, [activeAccount]);

  const isCompleted = useMemo(
    () => processedEras.length === payout.eras.length,
    [processedEras.length, payout.eras.length],
  );

  useEffect(() => {
    if (!walletAddress) return;

    if (!isProcessing) {
      const claimedEras = getClaimedEras(walletAddress);
      setClaimedEras(claimedEras);
    }
  }, [getClaimedEras, isProcessing, walletAddress]);

  // Split eras into chunks of MAX_PAYOUTS_BATCH_SIZE
  const eraChunks = useMemo(() => {
    if (!walletAddress) return [];

    const sortedEras = [...payout.eras].sort((a, b) => a - b);
    const unclaimedEras = sortedEras.filter(
      (era) => !claimedEras.includes(era),
    );
    const chunks: number[][] = [];

    for (let i = 0; i < unclaimedEras.length; i += MAX_PAYOUTS_BATCH_SIZE) {
      chunks.push(unclaimedEras.slice(i, i + MAX_PAYOUTS_BATCH_SIZE));
    }

    return chunks;
  }, [claimedEras, payout.eras, walletAddress]);

  const formatEras = (eras: number[]): string => {
    if (!eras || eras.length === 0) return '-';
    return eras.join(', ');
  };

  const erasClaimingFor = useMemo(() => {
    return eraChunks[currentChunkIndex] || [];
  }, [eraChunks, currentChunkIndex]);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const processChunks = useCallback(async () => {
    if (!payout.validator.address || eraChunks.length === 0) {
      setProcessingError('No eras to process');
      return;
    }

    if (!executePayoutStakersTx) {
      setProcessingError('Transaction execution not available');
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingError(null);
      setCurrentChunkIndex(0);
      setProcessedEras([]);

      for (let i = 0; i < eraChunks.length; i++) {
        setCurrentChunkIndex(i);
        const chunk = eraChunks[i];

        await executePayoutStakersTx({
          validatorAddress: payout.validator.address,
          eras: chunk,
        });

        // Wait and check transaction status
        await sleep(TRANSACTION_CHECK_DELAY);

        if (payoutStakersTxStatus === TxStatus.ERROR) {
          throw new Error(
            typeof error === 'string' ? error : 'Transaction failed',
          );
        }

        setProcessedEras((prev) => [...prev, ...chunk]);

        const substrateAddress = toSubstrateAddress(payout.validator.address);

        addClaimedEras(substrateAddress, chunk);
      }

      onSuccess?.();
    } catch (err) {
      console.error('Failed to process chunks:', err);
      setProcessingError(
        err instanceof Error ? err.message : 'Transaction failed',
      );
    } finally {
      setIsProcessing(false);
    }
  }, [
    addClaimedEras,
    eraChunks,
    executePayoutStakersTx,
    onSuccess,
    payout.validator.address,
    payoutStakersTxStatus,
    error,
  ]);

  const submitTx = useCallback(() => {
    if (!isProcessing) {
      processChunks();
    }
  }, [isProcessing, processChunks]);

  const handleModalClose = useCallback(
    (open: boolean) => {
      if (!open && isProcessing && !isCompleted) {
        return;
      }
      setIsModalOpen(open);
    },
    [isProcessing, isCompleted, setIsModalOpen],
  );

  const closeModal = useCallback(() => {
    handleModalClose(false);
  }, [handleModalClose]);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isModalOpen) {
      setCurrentChunkIndex(0);
      setProcessedEras([]);
      setProcessingError(null);
      setIsProcessing(false);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (isCompleted && onSuccess) {
      onSuccess();
    }
  }, [isCompleted, onSuccess]);

  const progress = useMemo(() => {
    if (isCompleted) return 100;
    if (!isProcessing) return 0;
    return ((currentChunkIndex + 1) / eraChunks.length) * 100;
  }, [currentChunkIndex, eraChunks.length, isProcessing, isCompleted]);

  return (
    <Modal open={isModalOpen} onOpenChange={handleModalClose}>
      <ModalContent size="lg">
        <ModalHeader>Payout Stakers</ModalHeader>

        <ModalBody className="grid grid-cols-2 gap-9">
          <div className="flex flex-col gap-4">
            {walletAddress && (
              <InputField.Root>
                <InputField.Input
                  title="Request Payout From"
                  isAddressType
                  value={walletAddress}
                  type="text"
                  readOnly
                />
              </InputField.Root>
            )}

            {payout.validator.address && (
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
            )}

            <InputField.Root>
              <InputField.Input
                title="Claiming Eras"
                isAddressType={false}
                value={formatEras(erasClaimingFor)}
                type="text"
                readOnly
              />
            </InputField.Root>
          </div>

          <div className="flex flex-col gap-4">
            {erasClaimingFor.length === 0 ? (
              <Typography
                variant="h5"
                className="text-gray-900 dark:text-gray-100"
              >
                No eras to claim
              </Typography>
            ) : (
              <>
                <Typography
                  variant="h5"
                  className="text-gray-900 dark:text-gray-100"
                >
                  Transaction Progress
                </Typography>
                <div className="space-y-4">
                  <div className="space-y-3">
                    {!isCompleted && (
                      <div className="flex justify-between">
                        <span className="font-medium">Current Batch:</span>
                        <span className="text-sm">
                          {isProcessing
                            ? `${currentChunkIndex + 1} of ${eraChunks.length}`
                            : '-'}
                        </span>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="flex justify-between">
                        <span className="font-medium">Remaining Batches:</span>
                        <span className="text-sm">0</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <span className="font-medium">
                        {isCompleted ? 'Processed Eras:' : 'Processing Eras:'}
                      </span>
                      <span className="text-sm">
                        {isCompleted
                          ? formatEras(payout.eras)
                          : formatEras(erasClaimingFor) || '-'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-600' : 'bg-blue-600'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="text-sm">
                      {isProcessing ? (
                        <span className="!text-blue-600">
                          Processing batch {currentChunkIndex + 1} of{' '}
                          {eraChunks.length}...
                        </span>
                      ) : processingError ? (
                        <span className="!text-red-600">{processingError}</span>
                      ) : processedEras.length > 0 ? (
                        <span className="!text-green-600">
                          Successfully processed {processedEras.length} eras
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </ModalBody>

        <ModalFooterActions
          isConfirmDisabled={erasClaimingFor.length === 0 || isProcessing}
          isProcessing={isProcessing}
          confirmButtonText={
            erasClaimingFor.length === 0
              ? 'No Rewards to Claim'
              : processedEras.length === payout.eras.length
                ? 'Close'
                : 'Confirm Payout'
          }
          onConfirm={
            processedEras.length === payout.eras.length ? closeModal : submitTx
          }
          hasCloseButton
        />
      </ModalContent>
    </Modal>
  );
};

export default PayoutTxModal;
