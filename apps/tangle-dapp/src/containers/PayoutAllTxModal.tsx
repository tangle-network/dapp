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

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  payouts: Payout[];
  validatorsAndEras: { validator: string | SubstrateAddress; eras: number[] }[];
  onSuccess?: () => void;
};

const TRANSACTION_CHECK_DELAY = 4000;

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

  const [isProcessing, setIsProcessing] = useState(false);
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

  const isCompleted = useMemo(
    () => processedValidators.length === payouts.length,
    [processedValidators.length, payouts.length],
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

  const formatEras = (eras: number[]): string => {
    if (!eras || eras.length === 0) return '-';
    return eras.join(', ');
  };

  const erasClaimingFor = useMemo(() => {
    const currentEras =
      eraChunksByValidator[currentValidatorIndex]?.eras[currentChunkIndex] ||
      [];
    return currentEras;
  }, [eraChunksByValidator, currentValidatorIndex, currentChunkIndex]);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const processChunks = useCallback(async () => {
    if (eraChunksByValidator.length === 0) {
      setProcessingError('No validators with unclaimed eras');
      return;
    }

    if (!executePayoutStakersTx) {
      setProcessingError('Transaction execution not available');
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingError(null);
      setCurrentValidatorIndex(0);
      setCurrentChunkIndex(0);
      setProcessedValidators([]);
      setProcessedErasByValidator({});

      // Process each validator sequentially
      for (
        let validatorIndex = 0;
        validatorIndex < eraChunksByValidator.length;
        validatorIndex++
      ) {
        setCurrentValidatorIndex(validatorIndex);
        const validatorData = eraChunksByValidator[validatorIndex];

        if (!validatorData.validator || validatorData.eras.length === 0) {
          continue; // Skip validators with no unclaimed eras
        }

        // Process all chunks for this validator
        for (
          let chunkIndex = 0;
          chunkIndex < validatorData.eras.length;
          chunkIndex++
        ) {
          setCurrentChunkIndex(chunkIndex);
          const chunk = validatorData.eras[chunkIndex];

          await executePayoutStakersTx({
            validatorAddress: validatorData.validator,
            eras: chunk,
          });

          // Wait and check transaction status
          await sleep(TRANSACTION_CHECK_DELAY);

          if (payoutStakersTxStatus === TxStatus.ERROR) {
            throw new Error(
              typeof error === 'string' ? error : 'Transaction failed',
            );
          }

          // Update processed eras for this validator
          setProcessedErasByValidator((prev) => {
            const validatorAddress = validatorData.validator;
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

        // Mark this validator as processed
        if (validatorData.validator) {
          const validatorAddress = validatorData.validator;
          setProcessedValidators((prev) => [...prev, validatorAddress]);
        }
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
    eraChunksByValidator,
    executePayoutStakersTx,
    onSuccess,
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

  useEffect(() => {
    if (!isModalOpen) {
      setCurrentChunkIndex(0);
      setCurrentValidatorIndex(0);
      setProcessedErasByValidator({});
      setProcessedValidators([]);
      setProcessingError(null);
      setIsProcessing(false);
    }
  }, [isModalOpen]);

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

  const progress = useMemo(() => {
    if (isCompleted) return 100;
    if (!isProcessing) return 0;
    const totalChunks = eraChunksByValidator.reduce(
      (acc, validator) => acc + validator.eras.length,
      0,
    );
    return ((currentChunkIndex + 1) / totalChunks) * 100;
  }, [currentChunkIndex, eraChunksByValidator, isProcessing, isCompleted]);

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
                          <span>Current Batch:</span>
                          <span className="text-sm">
                            {isProcessing
                              ? `${currentChunkIndex + 1} of ${eraChunksByValidator.reduce((acc, validator) => acc + validator.eras.length, 0)}`
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
          confirmButtonText={
            erasClaimingFor.length === 0
              ? 'No Rewards to Claim'
              : processedValidators.length === payouts.length
                ? 'Close'
                : 'Confirm Payout'
          }
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
