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
import { PayoutTxState } from '../types';

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
  const { getClaimedEras, addClaimedEras } = useClaimedEras();
  const {
    execute: executePayoutStakersTx,
    status: payoutStakersTxStatus,
    error,
  } = usePayoutStakersTx();

  const [txState, setTxState] = useState<PayoutTxState>(PayoutTxState.IDLE);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processedEras, setProcessedEras] = useState<number[]>([]);
  const [claimedEras, setClaimedEras] = useState<number[]>([]);
  const [pollingId, setPollingId] = useState<NodeJS.Timeout | null>(null);

  const walletAddress = useMemo(() => {
    return activeAccount?.address
      ? toSubstrateAddress(activeAccount?.address)
      : null;
  }, [activeAccount]);

  useEffect(() => {
    if (!walletAddress || !isModalOpen) return;

    const claimed = getClaimedEras(walletAddress);
    setClaimedEras(claimed);
  }, [getClaimedEras, walletAddress, isModalOpen]);

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

  const formatEras = useCallback((eras: number[]): string => {
    if (!eras || eras.length === 0) return '-';
    return eras.join(', ');
  }, []);

  const currentChunk = useMemo(
    () => eraChunks[currentChunkIndex] || [],
    [eraChunks, currentChunkIndex],
  );

  const nextChunk = useMemo(
    () => eraChunks[currentChunkIndex + 1] || undefined,
    [eraChunks, currentChunkIndex],
  );

  const hasNextChunk = useMemo(
    () => currentChunkIndex < eraChunks.length - 1,
    [currentChunkIndex, eraChunks],
  );

  const isCompleted = useMemo(
    () =>
      txState === PayoutTxState.COMPLETED ||
      (processedEras.length > 0 &&
        processedEras.length >= payout.eras.length - claimedEras.length),
    [txState, processedEras.length, payout.eras.length, claimedEras.length],
  );

  useEffect(() => {
    return () => {
      if (pollingId) {
        clearTimeout(pollingId);
        setPollingId(null);
      }
    };
  }, [pollingId]);

  useEffect(() => {
    if (txState === PayoutTxState.WAITING) {
      if (payoutStakersTxStatus === TxStatus.COMPLETE) {
        if (pollingId) {
          clearTimeout(pollingId);
          setPollingId(null);
        }

        // Update processed eras
        setProcessedEras((prev) => [...prev, ...currentChunk]);

        // Mark eras as claimed in local storage
        if (payout.validator.address) {
          const validatorAddress = payout.validator.address;
          addClaimedEras(validatorAddress, currentChunk);
        }
        setTxState(PayoutTxState.SUCCESS);
      } else if (payoutStakersTxStatus === TxStatus.ERROR) {
        if (pollingId) {
          clearTimeout(pollingId);
          setPollingId(null);
        }

        setProcessingError(
          typeof error === 'string' ? error : 'Transaction failed',
        );
        setTxState(PayoutTxState.ERROR);
      }
    }
  }, [
    payoutStakersTxStatus,
    txState,
    pollingId,
    currentChunk,
    payout.validator.address,
    addClaimedEras,
    error,
  ]);

  const processCurrentChunk = useCallback(async () => {
    if (!payout.validator.address || !currentChunk.length) {
      setProcessingError('No eras to process');
      setTxState(PayoutTxState.ERROR);
      return;
    }

    if (!executePayoutStakersTx) {
      setProcessingError('Transaction execution not available');
      setTxState(PayoutTxState.ERROR);
      return;
    }

    try {
      setTxState(PayoutTxState.PROCESSING);
      setProcessingError(null);

      await executePayoutStakersTx({
        validatorAddress: payout.validator.address,
        eras: currentChunk,
      });

      setTxState(PayoutTxState.WAITING);

      const id = setTimeout(() => {
        if (txState === PayoutTxState.WAITING) {
          if (payoutStakersTxStatus === TxStatus.COMPLETE) {
            setProcessedEras((prev) => [...prev, ...currentChunk]);

            if (payout.validator.address) {
              const validatorAddress = payout.validator.address;
              addClaimedEras(validatorAddress, currentChunk);
            }

            setTxState(PayoutTxState.SUCCESS);
          } else if (payoutStakersTxStatus === TxStatus.ERROR) {
            setProcessingError(
              typeof error === 'string' ? error : 'Transaction failed',
            );
            setTxState(PayoutTxState.ERROR);
          } else {
            setProcessedEras((prev) => [...prev, ...currentChunk]);

            if (payout.validator.address) {
              const validatorAddress = payout.validator.address;
              addClaimedEras(validatorAddress, currentChunk);
            }

            setTxState(PayoutTxState.SUCCESS);
          }
        }
      }, 5000);

      setPollingId(id);
    } catch (err) {
      console.error('Failed to process chunk:', err);
      setProcessingError(
        err instanceof Error ? err.message : 'Transaction failed',
      );
      setTxState(PayoutTxState.ERROR);
    }
  }, [
    payout.validator.address,
    currentChunk,
    executePayoutStakersTx,
    txState,
    payoutStakersTxStatus,
    addClaimedEras,
    error,
  ]);

  const moveToNextChunk = useCallback(() => {
    if (hasNextChunk) {
      setCurrentChunkIndex((prev) => prev + 1);
      setTxState(PayoutTxState.IDLE);
    } else {
      setTxState(PayoutTxState.COMPLETED);
      onSuccess?.();
    }
  }, [hasNextChunk, onSuccess]);

  const retryCurrentChunk = useCallback(() => {
    setTxState(PayoutTxState.IDLE);
    setProcessingError(null);
  }, []);

  const submitTx = useCallback(() => {
    if (txState === PayoutTxState.IDLE) {
      processCurrentChunk();
    }
  }, [txState, processCurrentChunk]);

  const handleModalClose = useCallback(
    (open: boolean) => {
      if (
        !open &&
        (txState === PayoutTxState.PROCESSING ||
          txState === PayoutTxState.WAITING)
      ) {
        return;
      }
      setIsModalOpen(open);
    },
    [txState, setIsModalOpen],
  );

  const closeModal = useCallback(() => {
    handleModalClose(false);
  }, [handleModalClose]);

  useEffect(() => {
    if (!isModalOpen) {
      setCurrentChunkIndex(0);
      setProcessedEras([]);
      setProcessingError(null);
      setTxState(PayoutTxState.IDLE);
      if (pollingId) {
        clearInterval(pollingId);
        setPollingId(null);
      }
    }
  }, [isModalOpen, pollingId]);

  const progress = useMemo(() => {
    if (isCompleted) return 100;
    if (
      txState === PayoutTxState.IDLE &&
      currentChunkIndex === 0 &&
      processedEras.length === 0
    )
      return 0;

    const totalUnprocessedEras = payout.eras.length - claimedEras.length;
    if (totalUnprocessedEras <= 0) return 100;

    return (processedEras.length / totalUnprocessedEras) * 100;
  }, [
    txState,
    currentChunkIndex,
    processedEras.length,
    payout.eras.length,
    claimedEras.length,
    isCompleted,
  ]);

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
                value={formatEras(currentChunk)}
                type="text"
                readOnly
              />
            </InputField.Root>
          </div>

          <div className="flex flex-col gap-4">
            {eraChunks.length === 0 ? (
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
                          {txState !== PayoutTxState.IDLE
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
                          ? formatEras(processedEras)
                          : formatEras(currentChunk) || '-'}
                      </span>
                    </div>

                    {nextChunk && txState === PayoutTxState.SUCCESS && (
                      <div className="flex flex-col gap-2">
                        <span className="font-medium">Next Batch:</span>
                        <span className="text-sm">{formatEras(nextChunk)}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-600' : txState === PayoutTxState.ERROR ? 'bg-red-600' : 'bg-blue-600'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="text-sm">
                      {txState === PayoutTxState.PROCESSING && (
                        <span className="!text-blue-600">
                          Processing batch {currentChunkIndex + 1} of{' '}
                          {eraChunks.length}...
                        </span>
                      )}
                      {txState === PayoutTxState.WAITING && (
                        <span className="!text-blue-600">
                          Waiting for transaction confirmation...
                        </span>
                      )}
                      {txState === PayoutTxState.ERROR && processingError && (
                        <span className="!text-red-600">{processingError}</span>
                      )}
                      {txState === PayoutTxState.SUCCESS && (
                        <span className="!text-green-600">
                          Successfully processed batch {currentChunkIndex + 1}
                        </span>
                      )}
                      {txState === PayoutTxState.COMPLETED && (
                        <span className="!text-green-600">
                          All eras successfully processed!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </ModalBody>

        <ModalFooterActions
          isConfirmDisabled={
            eraChunks.length === 0 ||
            txState === PayoutTxState.PROCESSING ||
            txState === PayoutTxState.WAITING
          }
          isProcessing={
            txState === PayoutTxState.PROCESSING ||
            txState === PayoutTxState.WAITING
          }
          confirmButtonText={(() => {
            if (eraChunks.length === 0) return 'No Rewards to Claim';
            if (isCompleted || txState === PayoutTxState.COMPLETED)
              return 'Close';
            if (txState === PayoutTxState.SUCCESS && hasNextChunk)
              return 'Process Next Batch';
            if (txState === PayoutTxState.ERROR) return 'Retry';
            return 'Confirm Payout';
          })()}
          onConfirm={(() => {
            if (isCompleted || txState === PayoutTxState.COMPLETED)
              return closeModal;
            if (txState === PayoutTxState.SUCCESS && hasNextChunk)
              return moveToNextChunk;
            if (txState === PayoutTxState.ERROR) return retryCurrentChunk;
            return submitTx;
          })()}
          hasCloseButton={
            txState !== PayoutTxState.PROCESSING &&
            txState !== PayoutTxState.WAITING
          }
        />
      </ModalContent>
    </Modal>
  );
};

export default PayoutTxModal;
