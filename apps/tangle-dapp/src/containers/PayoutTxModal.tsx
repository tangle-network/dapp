import { useWebContext } from '@tangle-network/api-provider-environment';
import { useClaimedEras } from '../hooks/useClaimedEras';
import { TxStatus } from '../hooks/useSubstrateTx';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import {
  EMPTY_VALUE_PLACEHOLDER,
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
import {
  formatEras,
  calculatePayoutProgress,
  isTransactionProcessing,
  isTransactionCompleted,
  getPayoutButtonText,
} from '../utils/payout';

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
  const networkId = useNetworkStore((store) => store.network.id);
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

    const claimed = getClaimedEras(networkId, walletAddress);
    setClaimedEras(claimed);
  }, [getClaimedEras, walletAddress, isModalOpen, networkId]);

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
      isTransactionCompleted({
        txState,
        processedCount: processedEras.length,
        totalCount: payout.eras.length - claimedEras.length,
      }),
    [txState, processedEras.length, payout.eras.length, claimedEras.length],
  );

  /**
   * Cleanup function for the polling mechanism used in this component.
   *
   * Uses polling (via setTimeout) to periodically check the status of
   * payout transactions.
   *
   * This effect ensures that any pending timeout is cleared when:
   * - The component unmounts
   * - The pollingId changes (e.g., when a new polling cycle starts)
   */
  useEffect(() => {
    return () => {
      if (pollingId) {
        clearTimeout(pollingId);
        setPollingId(null);
      }
    };
  }, [pollingId]);

  /**
   * Monitors transaction status and updates component state accordingly.
   *
   * When a transaction is in WAITING state, this effect:
   * - On success: Updates processed eras, stores claimed eras in local storage, and updates state
   * - On error: Clears timeout, sets error message, and updates state
   */
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
          addClaimedEras(networkId, validatorAddress, currentChunk);
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
    networkId,
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
              addClaimedEras(networkId, validatorAddress, currentChunk);
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
              addClaimedEras(networkId, validatorAddress, currentChunk);
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
    networkId,
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

  /**
   * Resets component state when the modal is closed.
   *
   * This ensures a clean slate for the next time the modal is opened,
   * clearing all transaction progress, errors, and clearing any active polling.
   */
  useEffect(() => {
    if (!isModalOpen) {
      setCurrentChunkIndex(0);
      setProcessedEras([]);
      setProcessingError(null);
      setTxState(PayoutTxState.IDLE);
      if (pollingId) {
        clearTimeout(pollingId);
        setPollingId(null);
      }
    }
  }, [isModalOpen, pollingId]);

  const progress = useMemo(() => {
    const totalUnprocessedEras = payout.eras.length - claimedEras.length;

    return calculatePayoutProgress({
      isCompleted,
      txState,
      currentIndex: currentChunkIndex,
      processedCount: processedEras.length,
      totalCount: totalUnprocessedEras,
      isIdle: txState === PayoutTxState.IDLE,
    });
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

        <ModalBody className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-9">
          <div className="flex flex-col gap-5">
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

          <div className="flex flex-col gap-5">
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
                <div className="space-y-5">
                  <div className="space-y-4">
                    {!isCompleted && (
                      <div className="flex justify-between items-center p-2 bg-slate-100 dark:bg-gray-800 rounded-md">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Current Batch:
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {txState !== PayoutTxState.IDLE
                            ? `${currentChunkIndex + 1} of ${eraChunks.length}`
                            : EMPTY_VALUE_PLACEHOLDER}
                        </span>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="flex justify-between items-center p-2 bg-slate-100 dark:bg-gray-800 rounded-md">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Remaining Batches:
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          0
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col gap-2 p-3 bg-blue-50/30 dark:bg-blue-900/30 rounded-md">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {isCompleted ? 'Processed Eras:' : 'Processing Eras:'}
                      </span>
                      <span className="text-sm break-all font-semibold text-gray-900 dark:text-gray-100">
                        {isCompleted
                          ? formatEras(processedEras)
                          : formatEras(currentChunk) || EMPTY_VALUE_PLACEHOLDER}
                      </span>
                    </div>

                    {nextChunk && txState === PayoutTxState.SUCCESS && (
                      <div className="flex flex-col gap-2 p-3 bg-blue-50/30 dark:bg-blue-900/30 rounded-md mt-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Next Batch:
                        </span>
                        <span className="text-sm break-all font-semibold text-gray-900 dark:text-gray-100">
                          {formatEras(nextChunk)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="w-full bg-gray-300 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-700 ease-in-out ${isCompleted ? 'bg-green-600 dark:bg-green-500' : txState === PayoutTxState.ERROR ? 'bg-red-600 dark:bg-red-500' : 'bg-blue-600/30 dark:bg-blue-500'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="text-sm">
                      {txState === PayoutTxState.PROCESSING && (
                        <span className="!text-blue-600 dark:!text-blue-400 font-medium">
                          Processing batch {currentChunkIndex + 1} of{' '}
                          {eraChunks.length}...
                        </span>
                      )}
                      {txState === PayoutTxState.WAITING && (
                        <span className="!text-blue-600 dark:!text-blue-400 font-medium">
                          Waiting for transaction confirmation...
                        </span>
                      )}
                      {txState === PayoutTxState.ERROR && processingError && (
                        <span className="!text-red-600 dark:!text-red-400 font-medium">
                          {processingError}
                        </span>
                      )}
                      {txState === PayoutTxState.SUCCESS && (
                        <span className="!text-green-600 dark:!text-green-400 font-medium">
                          Successfully processed batch {currentChunkIndex + 1}
                        </span>
                      )}
                      {txState === PayoutTxState.COMPLETED && (
                        <span className="!text-green-600 dark:!text-green-400 font-medium">
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
          isProcessing={isTransactionProcessing(txState)}
          confirmButtonText={getPayoutButtonText({
            txState,
            isCompleted,
            hasNextItem: hasNextChunk,
            hasItemsToProcess: eraChunks.length > 0,
          })}
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
