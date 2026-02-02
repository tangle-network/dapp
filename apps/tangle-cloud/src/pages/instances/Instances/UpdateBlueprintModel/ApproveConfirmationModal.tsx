import {
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  Typography,
  SkeletonLoader,
} from '@tangle-network/ui-components';
import BlueprintItem from '@tangle-network/tangle-shared-ui/components/blueprints/BlueprintGallery/BlueprintItem';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import {
  ApprovalConfirmationFormFields,
  ContractSecurityCommitment,
} from '../../../../types';
import { useForm, Controller } from 'react-hook-form';
import { useEffect, FC, useMemo, useCallback } from 'react';
import {
  useAllBlueprints,
  type ServiceRequest,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import addCommasToNumber from '@tangle-network/ui-components/utils/addCommasToNumber';
import useServiceRequestSecurityRequirements from '../../../../data/services/useServiceRequestSecurityRequirements';
import ExposureCommitmentInput from './ExposureCommitmentInput';
import useEvmOperatorInfo from '../../../../hooks/useEvmOperatorInfo';
import { useOperatorStakeByAsset } from '@tangle-network/tangle-shared-ui/data/restake/useOperatorDelegationsByAsset';
import type { Address } from 'viem';

// Service request with optional blueprint metadata
interface ServiceRequestWithBlueprint extends ServiceRequest {
  blueprintData?: Blueprint;
}

type Props = {
  onClose: () => void;
  onConfirm: (data: ApprovalConfirmationFormFields) => Promise<void>;
  selectedRequest: ServiceRequestWithBlueprint | null;
  assetsMetadata?: unknown; // For future use with asset metadata
  status: TxStatus;
};

// Form values type - supports both simple and commitments mode
type FormValues = {
  requestId: bigint;
  // Simple mode: single restaking percentage (0-100)
  restakingPercent: number;
  // Commitments mode: per-asset exposure in basis points (0-10000)
  // Key is the token address (lowercased)
  commitments: Record<string, number>;
};

const ApproveConfirmationModal: FC<Props> = ({
  onClose,
  onConfirm,
  selectedRequest,
  status,
}: Props) => {
  const isSubmitting = status === TxStatus.PROCESSING;

  const { blueprints: allBlueprints } = useAllBlueprints();

  // Get operator address for delegation query
  const { operatorAddress } = useEvmOperatorInfo();

  // Query security requirements for this request
  const {
    data: requirements,
    isLoading: isLoadingRequirements,
    hasCustomRequirements,
    isSimpleCase,
    defaultTntRequirement,
  } = useServiceRequestSecurityRequirements(selectedRequest?.requestId);

  // Build assets array from security requirements for stake query
  const assetsToQuery = useMemo(() => {
    if (!requirements || requirements.length === 0) {
      return undefined;
    }
    return requirements.map((req) => ({
      kind: req.asset.kind,
      token: req.asset.token,
    }));
  }, [requirements]);

  // Query operator's stake per asset from the contract for "tokens at risk" display
  const { data: stakeByAsset, isLoading: isLoadingStake } = useOperatorStakeByAsset(
    operatorAddress,
    assetsToQuery,
  );

  // Build initial commitments from requirements (default to minimum)
  const initialCommitments = useMemo(() => {
    if (!requirements || requirements.length === 0) {
      return {};
    }

    const commitments: Record<string, number> = {};
    for (const req of requirements) {
      const key = req.asset.token.toLowerCase();
      // Default to minimum exposure
      commitments[key] = req.minExposureBps;
    }
    return commitments;
  }, [requirements]);

  // Helper to get operator's stake for a specific token address
  const getStakeForAsset = useCallback(
    (tokenAddress: Address): bigint | null => {
      if (!stakeByAsset) {
        return null;
      }
      const normalizedAddress = tokenAddress.toLowerCase() as Address;
      const stake = stakeByAsset.get(normalizedAddress);
      return stake?.totalStake ?? BigInt(0);
    },
    [stakeByAsset],
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      requestId: selectedRequest?.requestId ?? BigInt(0),
      restakingPercent: 0,
      commitments: {},
    },
  });

  // Update commitments when requirements load
  useEffect(() => {
    if (Object.keys(initialCommitments).length > 0) {
      setValue('commitments', initialCommitments);
    }
  }, [initialCommitments, setValue]);

  // Close the modal when the transaction is complete.
  useEffect(() => {
    if (status === TxStatus.COMPLETE) {
      onClose();
    }
  }, [status, onClose]);

  // Build security commitments from form data
  const buildSecurityCommitments = useCallback(
    (commitments: Record<string, number>): ContractSecurityCommitment[] => {
      if (!requirements || requirements.length === 0) {
        return [];
      }

      return requirements.map((req) => {
        const key = req.asset.token.toLowerCase();
        const exposureBps = commitments[key] ?? req.minExposureBps;

        return {
          asset: {
            kind: req.asset.kind,
            token: req.asset.token,
          },
          exposureBps,
        };
      });
    },
    [requirements],
  );

  // Handle form submission with type conversion.
  const handleFormSubmit = useCallback(
    (data: FormValues) => {
      const formattedData: ApprovalConfirmationFormFields = {
        requestId: Number(data.requestId),
      };

      if (hasCustomRequirements) {
        // Commitments mode: build security commitments array
        formattedData.securityCommitments = buildSecurityCommitments(
          data.commitments,
        );
      } else {
        // Simple mode (only default TNT): just the restaking percentage
        formattedData.restakingPercent = data.restakingPercent;
      }

      return onConfirm(formattedData);
    },
    [hasCustomRequirements, buildSecurityCommitments, onConfirm],
  );

  // Don't load the modal until the request prop is given.
  if (selectedRequest === null) {
    return null;
  }

  const blueprintStats = allBlueprints?.get(
    selectedRequest.blueprintId.toString(),
  );

  const instancesCount = blueprintStats?.instancesCount ?? 0;
  const operatorsCount = blueprintStats?.operatorsCount ?? 0;
  const restakersCount = blueprintStats?.restakersCount ?? 0;

  return (
    <ModalContent
      size="lg"
      onInteractOutside={(event) => event.preventDefault()}
      title={`Service Request #${addCommasToNumber(Number(selectedRequest.requestId))}`}
      description="Are you sure you want to approve this request?"
    >
      <ModalHeader onClose={onClose}>
        Service Request #{addCommasToNumber(Number(selectedRequest.requestId))}
      </ModalHeader>

      <ModalBody>
        <BlueprintItem
          imgUrl={selectedRequest.blueprintData?.imgUrl ?? ''}
          name={selectedRequest.blueprintData?.name ?? ''}
          instancesCount={instancesCount}
          operatorsCount={operatorsCount}
          restakersCount={restakersCount}
          isBoosted={false}
          category={selectedRequest.blueprintData?.category ?? ''}
          author={selectedRequest.blueprintData?.author ?? ''}
          description={selectedRequest.blueprintData?.description ?? ''}
          renderImage={(imageUrl) => {
            return (
              <img
                src={imageUrl}
                alt={selectedRequest.blueprintData?.name ?? ''}
                className="flex-shrink-0 bg-center rounded-full"
              />
            );
          }}
        />

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="mt-4 space-y-4"
        >
          <Typography variant="h4" className="text-center mb-3">
            Security Commitment
          </Typography>

          {/* Loading state */}
          {(isLoadingRequirements || isLoadingStake) && (
            <div className="space-y-4">
              <SkeletonLoader className="h-24 w-full rounded-lg" />
              <SkeletonLoader className="h-24 w-full rounded-lg" />
            </div>
          )}

          {/* Simple approval mode: Only default TNT requirement */}
          {!isLoadingRequirements &&
            !isLoadingStake &&
            isSimpleCase &&
            defaultTntRequirement && (
            <div className="space-y-4">
              <div className="p-4 bg-mono-20 dark:bg-mono-160 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <LsTokenIcon
                    name={defaultTntRequirement.metadata?.symbol ?? 'TNT'}
                    hasRainbowBorder
                    size="lg"
                  />
                  <div>
                    <Typography
                      variant="h5"
                      className="text-mono-200 dark:text-mono-0"
                    >
                      {defaultTntRequirement.metadata?.name ?? 'Tangle Network Token'}
                    </Typography>
                    <Typography
                      variant="body3"
                      className="text-mono-100 dark:text-mono-100"
                    >
                      Default security requirement
                    </Typography>
                  </div>
                </div>

                <Typography
                  variant="body2"
                  className="text-mono-100 dark:text-mono-100 mb-4"
                >
                  This service uses the default TNT security requirement. Enter
                  your restaking percentage (
                  {defaultTntRequirement.minExposureBps / 100}% -{' '}
                  {defaultTntRequirement.maxExposureBps / 100}%).
                </Typography>

                <label className="text-sm text-mono-140 dark:text-mono-80">
                  TNT Restaking Percentage
                </label>
                <input
                  id="restakingPercent"
                  type="number"
                  min={defaultTntRequirement.minExposureBps / 100}
                  max={defaultTntRequirement.maxExposureBps / 100}
                  {...register('restakingPercent', {
                    required: 'Restaking percentage is required',
                    min: {
                      value: defaultTntRequirement.minExposureBps / 100,
                      message: `Must be at least ${defaultTntRequirement.minExposureBps / 100}%`,
                    },
                    max: {
                      value: defaultTntRequirement.maxExposureBps / 100,
                      message: `Cannot exceed ${defaultTntRequirement.maxExposureBps / 100}%`,
                    },
                  })}
                  placeholder={`Enter percentage (${defaultTntRequirement.minExposureBps / 100}-${defaultTntRequirement.maxExposureBps / 100}%)`}
                  className="w-full h-10 px-3 rounded-lg border border-mono-80 dark:border-mono-140 bg-mono-0 dark:bg-mono-180 text-mono-200 dark:text-mono-0 placeholder:text-mono-80 dark:placeholder:text-mono-120"
                />
                {errors.restakingPercent && (
                  <p className="text-xs text-red-50">
                    {errors.restakingPercent.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Commitments mode: Per-asset exposure inputs */}
          {!isLoadingRequirements &&
            !isLoadingStake &&
            hasCustomRequirements &&
            requirements && (
            <div className="space-y-4">
              <Typography
                variant="body2"
                className="text-mono-100 dark:text-mono-100 mb-4"
              >
                This service requires specific security commitments for each
                asset. Set your exposure percentage within the allowed bounds
                for each asset.
              </Typography>

              {requirements.map((req) => {
                const key = req.asset.token.toLowerCase();

                return (
                  <Controller
                    key={key}
                    name={`commitments.${key}`}
                    control={control}
                    defaultValue={req.minExposureBps}
                    rules={{
                      min: {
                        value: req.minExposureBps,
                        message: `Must be at least ${req.minExposureBps / 100}%`,
                      },
                      max: {
                        value: req.maxExposureBps,
                        message: `Cannot exceed ${req.maxExposureBps / 100}%`,
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <ExposureCommitmentInput
                        tokenAddress={req.asset.token}
                        assetKind={req.asset.kind}
                        metadata={req.metadata}
                        minExposureBps={req.minExposureBps}
                        maxExposureBps={req.maxExposureBps}
                        value={field.value ?? req.minExposureBps}
                        onChange={field.onChange}
                        errorMessage={fieldState.error?.message}
                        delegatedAmount={getStakeForAsset(req.asset.token)}
                      />
                    )}
                  />
                );
              })}
            </div>
          )}
        </form>
      </ModalBody>

      <ModalFooterActions
        isConfirmDisabled={
          !isValid || isSubmitting || isLoadingRequirements || isLoadingStake
        }
        isProcessing={isSubmitting}
        confirmButtonText="Approve"
        onConfirm={handleSubmit(handleFormSubmit)}
        hasCloseButton
      />
    </ModalContent>
  );
};

export default ApproveConfirmationModal;
