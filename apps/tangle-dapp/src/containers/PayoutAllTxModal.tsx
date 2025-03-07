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
  shortenString,
  toSubstrateAddress,
  Typography,
} from '@tangle-network/ui-components';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import usePayoutStakersTx, {
  MAX_PAYOUTS_BATCH_SIZE,
} from '../data/payouts/usePayoutStakersTx';
import { Payout } from '@tangle-network/tangle-shared-ui/types';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
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
  payouts: Payout[];
  validatorsAndEras: { validator: string | SubstrateAddress; eras: number[] }[];
  onSuccess?: () => void;
};

const PayoutAllTxModal: FC<Props> = ({
  isModalOpen,
  setIsModalOpen,
  payouts,
  validatorsAndEras,
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
  const [currentValidatorIndex, setCurrentValidatorIndex] = useState(0);

  const [txState, setTxState] = useState<PayoutTxState>(PayoutTxState.IDLE);
  const [pollingId, setPollingId] = useState<NodeJS.Timeout | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const [processedValidators, setProcessedValidators] = useState<string[]>([]);
  const [processedErasByValidator, setProcessedErasByValidator] = useState<
    Record<string, number[]>
  >({});

  const [claimedEras, setClaimedEras] = useState<number[]>([]);

  const walletAddress = useMemo(() => {
    const address = activeAccount?.address
      ? toSubstrateAddress(activeAccount?.address)
      : null;
    return address;
  }, [activeAccount]);

  const isProcessing = useMemo(() => {
    return isTransactionProcessing(txState);
  }, [txState]);

  const isCompleted = useMemo(
    () =>
      isTransactionCompleted({
        txState,
        processedCount: processedValidators.length,
        totalCount: validatorsAndEras.length,
      }),
    [txState, processedValidators.length, validatorsAndEras.length],
  );

  useEffect(() => {
    if (!walletAddress) return;

    if (!isProcessing) {
      const claimedEras = getClaimedEras(walletAddress);
      setClaimedEras(claimedEras);
    }
  }, [getClaimedEras, isProcessing, walletAddress]);

  // Split eras into chunks of MAX_PAYOUTS_BATCH_SIZE
  const eraChunksByValidator = useMemo(() => {
    if (!walletAddress) return [];

    return validatorsAndEras.map((validatorAndEras) => {
      const sortedEras = [...validatorAndEras.eras].sort((a, b) => a - b);
      const unclaimedEras = sortedEras.filter(
        (era) => !claimedEras.includes(era),
      );
      const chunks: number[][] = [];

      for (let i = 0; i < unclaimedEras.length; i += MAX_PAYOUTS_BATCH_SIZE) {
        chunks.push(unclaimedEras.slice(i, i + MAX_PAYOUTS_BATCH_SIZE));
      }

      return {
        validator: validatorAndEras.validator,
        eras: chunks,
      };
    });
  }, [claimedEras, validatorsAndEras, walletAddress]);

  const erasClaimingFor = useMemo(() => {
    const currentEras =
      eraChunksByValidator[currentValidatorIndex]?.eras[currentChunkIndex] ||
      [];
    return currentEras;
  }, [eraChunksByValidator, currentValidatorIndex, currentChunkIndex]);

  useEffect(() => {
    return () => {
      if (pollingId) {
        clearTimeout(pollingId);
        setPollingId(null);
      }
    };
  }, [pollingId]);

  const handleTransactionSuccess = useCallback(() => {
    if (pollingId) {
      clearTimeout(pollingId);
      setPollingId(null);
    }

    const validatorData = eraChunksByValidator[currentValidatorIndex];
    if (validatorData && validatorData.validator) {
      const chunk = validatorData.eras[currentChunkIndex];

      setProcessedErasByValidator((prev) => {
        const validatorAddress = validatorData.validator as string;
        if (!validatorAddress) return prev;

        const validatorEras = prev[validatorAddress] || [];
        return {
          ...prev,
          [validatorAddress]: [...validatorEras, ...chunk],
        };
      });

      const substrateAddress = toSubstrateAddress(validatorData.validator);
      addClaimedEras(substrateAddress, chunk);
    }

    setTxState(PayoutTxState.SUCCESS);
  }, [
    addClaimedEras,
    currentChunkIndex,
    currentValidatorIndex,
    eraChunksByValidator,
    pollingId,
  ]);

  const handleTransactionError = useCallback(
    (err: unknown) => {
      if (pollingId) {
        clearTimeout(pollingId);
        setPollingId(null);
      }

      setProcessingError(
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : 'Transaction failed',
      );
      setTxState(PayoutTxState.ERROR);
    },
    [pollingId],
  );

  const processCurrentChunk = useCallback(async () => {
    if (eraChunksByValidator.length === 0) {
      setProcessingError('No validators with unclaimed eras');
      setTxState(PayoutTxState.ERROR);
      return;
    }

    if (!executePayoutStakersTx) {
      setProcessingError('Transaction execution not available');
      setTxState(PayoutTxState.ERROR);
      return;
    }

    const validatorData = eraChunksByValidator[currentValidatorIndex];
    if (
      !validatorData ||
      !validatorData.validator ||
      validatorData.eras.length === 0
    ) {
      setTimeout(() => {
        if (validatorData && validatorData.validator) {
          setProcessedValidators((prev) => [
            ...prev,
            validatorData.validator as string,
          ]);
        }

        if (currentValidatorIndex >= eraChunksByValidator.length - 1) {
          setTxState(PayoutTxState.COMPLETED);
          onSuccess?.();
        } else {
          setCurrentValidatorIndex(currentValidatorIndex + 1);
          setCurrentChunkIndex(0);
          setTxState(PayoutTxState.IDLE);

          setTimeout(() => processCurrentChunk(), 0);
        }
      }, 0);
      return;
    }

    const chunk = validatorData.eras[currentChunkIndex];
    if (!chunk || chunk.length === 0) {
      setTimeout(() => {
        if (currentChunkIndex >= validatorData.eras.length - 1) {
          if (validatorData && validatorData.validator) {
            setProcessedValidators((prev) => [
              ...prev,
              validatorData.validator as string,
            ]);
          }

          if (currentValidatorIndex >= eraChunksByValidator.length - 1) {
            setTxState(PayoutTxState.COMPLETED);
            onSuccess?.();
          } else {
            setCurrentValidatorIndex(currentValidatorIndex + 1);
            setCurrentChunkIndex(0);
            setTxState(PayoutTxState.IDLE);
            setTimeout(() => processCurrentChunk(), 0);
          }
        } else {
          setCurrentChunkIndex(currentChunkIndex + 1);
          setTxState(PayoutTxState.IDLE);
          setTimeout(() => processCurrentChunk(), 0);
        }
      }, 0);
      return;
    }

    try {
      setProcessingError(null);
      setTxState(PayoutTxState.PROCESSING);

      await executePayoutStakersTx({
        validatorAddress: validatorData.validator,
        eras: chunk,
      });

      setTxState(PayoutTxState.WAITING);

      const id = setTimeout(() => {
        if (txState === PayoutTxState.WAITING) {
          if (payoutStakersTxStatus === TxStatus.COMPLETE) {
            handleTransactionSuccess();
          } else if (payoutStakersTxStatus === TxStatus.ERROR) {
            handleTransactionError(error);
          } else {
            handleTransactionSuccess();
          }
        }
      }, 5000);

      setPollingId(id);
    } catch (err) {
      console.error('Failed to process chunk:', err);
      handleTransactionError(err);
    }
  }, [
    eraChunksByValidator,
    executePayoutStakersTx,
    currentValidatorIndex,
    currentChunkIndex,
    onSuccess,
    txState,
    payoutStakersTxStatus,
    handleTransactionSuccess,
    handleTransactionError,
    error,
  ]);

  useEffect(() => {
    if (txState === PayoutTxState.WAITING) {
      if (payoutStakersTxStatus === TxStatus.COMPLETE) {
        handleTransactionSuccess();
      } else if (payoutStakersTxStatus === TxStatus.ERROR) {
        handleTransactionError(error);
      }
    }
  }, [
    payoutStakersTxStatus,
    txState,
    handleTransactionSuccess,
    handleTransactionError,
    error,
  ]);

  useEffect(() => {
    if (txState === PayoutTxState.SUCCESS) {
      const validatorData = eraChunksByValidator[currentValidatorIndex];

      if (currentChunkIndex >= validatorData.eras.length - 1) {
        if (validatorData && validatorData.validator) {
          setProcessedValidators((prev) => [
            ...prev,
            validatorData.validator as string,
          ]);
        }

        if (currentValidatorIndex >= eraChunksByValidator.length - 1) {
          setTxState(PayoutTxState.COMPLETED);
          onSuccess?.();
        } else {
          setCurrentValidatorIndex(currentValidatorIndex + 1);
          setCurrentChunkIndex(0);
          setTxState(PayoutTxState.IDLE);
          setTimeout(() => processCurrentChunk(), 0);
        }
      } else {
        setCurrentChunkIndex(currentChunkIndex + 1);
        setTxState(PayoutTxState.IDLE);
        setTimeout(() => processCurrentChunk(), 0);
      }
    }
  }, [
    txState,
    currentChunkIndex,
    currentValidatorIndex,
    eraChunksByValidator,
    onSuccess,
    processCurrentChunk,
  ]);

  const processAllValidators = useCallback(() => {
    setCurrentValidatorIndex(0);
    setCurrentChunkIndex(0);
    setProcessedValidators([]);
    setProcessedErasByValidator({});
    setProcessingError(null);
    setTxState(PayoutTxState.IDLE);

    processCurrentChunk();
  }, [processCurrentChunk]);

  const submitTx = useCallback(() => {
    if (!isProcessing) {
      processAllValidators();
    }
  }, [isProcessing, processAllValidators]);

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

  useEffect(() => {
    if (!isModalOpen) {
      setCurrentChunkIndex(0);
      setCurrentValidatorIndex(0);
      setProcessedErasByValidator({});
      setProcessedValidators([]);
      setProcessingError(null);
      setTxState(PayoutTxState.IDLE);
      if (pollingId) {
        clearTimeout(pollingId);
        setPollingId(null);
      }
    }
  }, [isModalOpen, pollingId]);

  useEffect(() => {
    if (isCompleted && onSuccess) {
      onSuccess();
    }
  }, [isCompleted, onSuccess]);

  const totalProcessedEras = useMemo(() => {
    return Object.values(processedErasByValidator).reduce(
      (total, eras) => total + eras.length,
      0,
    );
  }, [processedErasByValidator]);

  const getTotalChunks = useCallback(() => {
    return eraChunksByValidator.reduce(
      (total, validator) => total + validator.eras.length,
      0,
    );
  }, [eraChunksByValidator]);

  const getTotalProcessedChunks = useCallback(() => {
    const completedValidatorsChunks = processedValidators.reduce(
      (total, validatorAddress) => {
        const validatorIndex = eraChunksByValidator.findIndex(
          (v) => v.validator === validatorAddress,
        );
        if (validatorIndex >= 0) {
          return total + eraChunksByValidator[validatorIndex].eras.length;
        }
        return total;
      },
      0,
    );

    if (
      currentValidatorIndex < eraChunksByValidator.length &&
      eraChunksByValidator[currentValidatorIndex]?.validator &&
      !processedValidators.includes(
        eraChunksByValidator[currentValidatorIndex].validator as string,
      )
    ) {
      return completedValidatorsChunks + currentChunkIndex;
    }

    return completedValidatorsChunks;
  }, [
    currentChunkIndex,
    currentValidatorIndex,
    eraChunksByValidator,
    processedValidators,
  ]);

  const progress = useMemo(() => {
    const totalChunks = getTotalChunks();
    const processedChunks = getTotalProcessedChunks();

    return calculatePayoutProgress({
      isCompleted,
      txState,
      currentIndex: currentChunkIndex,
      processedCount: processedChunks,
      totalCount: totalChunks,
      isIdle: txState === PayoutTxState.IDLE,
    });
  }, [
    currentChunkIndex,
    getTotalChunks,
    getTotalProcessedChunks,
    isCompleted,
    txState,
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

            {eraChunksByValidator[currentValidatorIndex] &&
              eraChunksByValidator[currentValidatorIndex].validator && (
                <InputField.Root>
                  <InputField.Input
                    title="Validator"
                    isAddressType
                    addressTheme="substrate"
                    value={
                      eraChunksByValidator[currentValidatorIndex].validator
                    }
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
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Current Validator:</span>
                          <span className="text-sm">
                            {isProcessing
                              ? `${currentValidatorIndex + 1} of ${eraChunksByValidator.length}`
                              : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Current Batch:</span>
                          <span className="text-sm">
                            {isProcessing &&
                            eraChunksByValidator[currentValidatorIndex]
                              ? `${currentChunkIndex + 1} of ${eraChunksByValidator[currentValidatorIndex].eras.length}`
                              : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Progress:</span>
                          <span className="text-sm">
                            {isProcessing
                              ? `${getTotalProcessedChunks()} of ${getTotalChunks()}`
                              : '-'}
                          </span>
                        </div>
                        {isProcessing &&
                          eraChunksByValidator[currentValidatorIndex]
                            ?.validator && (
                            <div className="flex justify-between">
                              <span>Processing Validator:</span>
                              <span className="text-sm">
                                {shortenString(
                                  eraChunksByValidator[currentValidatorIndex]
                                    .validator,
                                  6,
                                )}
                              </span>
                            </div>
                          )}
                        {isProcessing &&
                          eraChunksByValidator[currentValidatorIndex]?.eras && (
                            <div className="flex flex-col gap-2">
                              <span>Processing Eras:</span>
                              <span className="text-sm break-all">
                                {formatEras(
                                  eraChunksByValidator[
                                    currentValidatorIndex
                                  ].eras.flat(),
                                )}
                              </span>
                            </div>
                          )}
                      </div>
                    )}

                    {processedValidators.length > 0 && (
                      <div className="flex flex-col gap-2 rounded-lg">
                        <span className="font-medium">
                          Processed Validators:
                        </span>

                        <div className="space-y-2 text-sm">
                          {processedValidators.map((validator, index) => (
                            <div
                              key={validator}
                              className="flex justify-between items-center"
                            >
                              <span>{shortenString(validator, 10)}</span>
                              <span className="text-green-600">
                                {processedErasByValidator[validator]?.length ||
                                  0}{' '}
                                eras
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                          {eraChunksByValidator.reduce(
                            (acc, validator) => acc + validator.eras.length,
                            0,
                          )}
                          ...
                        </span>
                      ) : processingError ? (
                        <span className="!text-red-600">{processingError}</span>
                      ) : processedValidators.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <span className="!text-green-600">
                            Successfully processed {processedValidators.length}{' '}
                            validators ({totalProcessedEras} eras)
                          </span>
                        </div>
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
          confirmButtonText={getPayoutButtonText({
            txState,
            isCompleted,
            hasNextItem: false,
            hasItemsToProcess: erasClaimingFor.length > 0,
          })}
          onConfirm={
            processedValidators.length === payouts.length
              ? closeModal
              : submitTx
          }
          hasCloseButton
        />
      </ModalContent>
    </Modal>
  );
};

export default PayoutAllTxModal;
