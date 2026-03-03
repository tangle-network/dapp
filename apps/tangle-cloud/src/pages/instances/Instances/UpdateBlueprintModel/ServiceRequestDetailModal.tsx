import {
  Button,
  ModalBody,
  ModalContent,
  ModalHeader,
  Typography,
  SkeletonLoader,
} from '@tangle-network/ui-components';
import {
  ApprovalConfirmationFormFields,
  ContractSecurityCommitment,
} from '../../../../types';
import { useForm, Controller } from 'react-hook-form';
import { useEffect, FC, useMemo, useCallback, useState } from 'react';
import { type ServiceRequest } from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  useServiceRequestDetails,
  useTokenMetadata,
} from '@tangle-network/tangle-shared-ui/data/services';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import addCommasToNumber from '@tangle-network/ui-components/utils/addCommasToNumber';
import useServiceRequestSecurityRequirements from '../../../../data/services/useServiceRequestSecurityRequirements';
import ExposureCommitmentInput from './ExposureCommitmentInput';
import useEvmOperatorInfo from '../../../../hooks/useEvmOperatorInfo';
import { useOperatorStakeByAsset } from '@tangle-network/tangle-shared-ui/data/staking';
import { ServiceRequestSummary } from '../../../../components/ServiceRequestDetails';
import type { Address } from 'viem';
import { parseAddressLowercase } from '@tangle-network/tangle-shared-ui/utils/safeParseAddress';

interface ServiceRequestWithBlueprint extends ServiceRequest {
  blueprintData?: Blueprint;
}

type ModalView = 'details' | 'approve-form';

type Props = {
  onClose: () => void;
  onApprove: (data: ApprovalConfirmationFormFields) => Promise<void>;
  onReject: () => Promise<void>;
  selectedRequest: ServiceRequestWithBlueprint | null;
  approveStatus: TxStatus | 'idle';
  rejectStatus: TxStatus | 'idle';
  viewOnly?: boolean;
};

type FormValues = {
  requestId: bigint;
  commitments: Record<string, number>;
  tntExposureBps: number;
};

const toAssetMapKey = (tokenAddress: string): string => {
  return parseAddressLowercase(tokenAddress) ?? tokenAddress.toLowerCase();
};

const ServiceRequestDetailModal: FC<Props> = ({
  onClose,
  onApprove,
  onReject,
  selectedRequest,
  approveStatus,
  rejectStatus,
  viewOnly = false,
}) => {
  const [view, setView] = useState<ModalView>('details');

  const isApproving = approveStatus === TxStatus.PROCESSING;
  const isRejecting = rejectStatus === TxStatus.PROCESSING;

  const { operatorAddress } = useEvmOperatorInfo();

  const { data: contractDetails, isLoading: isLoadingContract } =
    useServiceRequestDetails(selectedRequest?.requestId, {
      enabled: selectedRequest !== null,
    });

  const { data: tokenMetadata, isLoading: isLoadingToken } = useTokenMetadata(
    contractDetails?.paymentToken,
    {
      enabled: contractDetails !== undefined,
    },
  );

  const {
    data: requirements,
    isLoading: isLoadingRequirements,
    hasCustomRequirements,
    defaultTntRequirement,
  } = useServiceRequestSecurityRequirements(selectedRequest?.requestId);

  const assetsToQuery = useMemo(() => {
    if (hasCustomRequirements && requirements && requirements.length > 0) {
      return requirements.map((req) => ({
        kind: req.asset.kind,
        token: req.asset.token,
      }));
    }
    // For simple case, query TNT stake for the read-only slider
    if (defaultTntRequirement) {
      return [
        {
          kind: defaultTntRequirement.asset.kind,
          token: defaultTntRequirement.asset.token,
        },
      ];
    }
    return undefined;
  }, [hasCustomRequirements, requirements, defaultTntRequirement]);

  const { data: stakeByAsset, isLoading: isLoadingStake } =
    useOperatorStakeByAsset(operatorAddress, assetsToQuery);

  const initialCommitments = useMemo(() => {
    if (!hasCustomRequirements || !requirements || requirements.length === 0) {
      return {};
    }

    const commitments: Record<string, number> = {};
    for (const req of requirements) {
      const key = toAssetMapKey(req.asset.token);
      commitments[key] = req.minExposureBps;
    }
    return commitments;
  }, [hasCustomRequirements, requirements]);

  const derivedSimpleStakingPercent = useMemo(() => {
    if (!contractDetails || !operatorAddress) {
      return 100;
    }

    if (
      contractDetails.requestVariant !== 'exposure' ||
      !contractDetails.requestedOperators ||
      !contractDetails.requestedExposureBps
    ) {
      return 100;
    }

    const index = contractDetails.requestedOperators.findIndex(
      (operator) => operator.toLowerCase() === operatorAddress.toLowerCase(),
    );

    if (index < 0) {
      return 100;
    }

    const exposureBps = contractDetails.requestedExposureBps[index];
    if (typeof exposureBps !== 'number') {
      return 100;
    }

    const derivedPercent = Math.round(exposureBps / 100);
    return Math.max(0, Math.min(100, derivedPercent));
  }, [contractDetails, operatorAddress]);

  const getStakeForAsset = useCallback(
    (tokenAddress: Address): bigint | null => {
      if (!stakeByAsset) {
        return null;
      }
      const normalizedAddress = toAssetMapKey(tokenAddress) as Address;
      const stake = stakeByAsset.get(normalizedAddress);
      return stake?.totalStake ?? BigInt(0);
    },
    [stakeByAsset],
  );

  const {
    handleSubmit,
    control,
    setValue,
    formState: { isValid },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      requestId: selectedRequest?.requestId ?? BigInt(0),
      commitments: {},
      tntExposureBps: 0,
    },
  });

  useEffect(() => {
    if (Object.keys(initialCommitments).length > 0) {
      setValue('commitments', initialCommitments);
    }
  }, [initialCommitments, setValue]);

  // Initialize tntExposureBps from default TNT requirement
  useEffect(() => {
    if (defaultTntRequirement && !hasCustomRequirements) {
      setValue('tntExposureBps', defaultTntRequirement.minExposureBps, {
        shouldValidate: true,
      });
    }
  }, [defaultTntRequirement, hasCustomRequirements, setValue]);

  // Close modal on successful transaction
  useEffect(() => {
    if (
      approveStatus === TxStatus.COMPLETE ||
      rejectStatus === TxStatus.COMPLETE
    ) {
      onClose();
    }
  }, [approveStatus, rejectStatus, onClose]);

  // Reset view when modal opens with new request
  const requestId = selectedRequest?.requestId;
  useEffect(() => {
    if (requestId !== undefined) {
      setView('details');
    }
  }, [requestId]);

  const buildSecurityCommitments = useCallback(
    (commitments: Record<string, number>): ContractSecurityCommitment[] => {
      if (!requirements || requirements.length === 0) {
        return [];
      }

      return requirements.map((req) => {
        const key = toAssetMapKey(req.asset.token);
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

  const handleFormSubmit = useCallback(
    (data: FormValues) => {
      const formattedData: ApprovalConfirmationFormFields = {
        requestId: Number(data.requestId),
      };

      if (hasCustomRequirements) {
        formattedData.securityCommitments = buildSecurityCommitments(
          data.commitments,
        );
      } else {
        formattedData.stakingPercent = derivedSimpleStakingPercent;
        if (defaultTntRequirement && data.tntExposureBps > 0) {
          formattedData.tntExposureBps = data.tntExposureBps;
        }
      }

      return onApprove(formattedData);
    },
    [
      buildSecurityCommitments,
      defaultTntRequirement,
      derivedSimpleStakingPercent,
      hasCustomRequirements,
      onApprove,
    ],
  );

  const handleApproveClick = useCallback(() => {
    setView('approve-form');
  }, []);

  const handleBackToDetails = useCallback(() => {
    setView('details');
  }, []);

  if (selectedRequest === null) {
    return null;
  }

  const renderDetailsView = () => (
    <>
      <ModalBody className="overflow-y-auto flex-1 justify-start">
        <ServiceRequestSummary
          contractDetails={contractDetails}
          tokenSymbol={tokenMetadata?.symbol ?? 'ETH'}
          tokenDecimals={tokenMetadata?.decimals ?? 18}
          operatorCandidates={selectedRequest.operatorCandidates}
          approvedOperators={selectedRequest.approvedOperators}
          rejectedOperators={selectedRequest.rejectedOperators}
          currentOperator={operatorAddress ?? undefined}
          isLoading={isLoadingContract || isLoadingToken}
          blueprintId={selectedRequest.blueprintId}
          blueprintName={selectedRequest.blueprintData?.name}
        />
      </ModalBody>

      {!viewOnly && (
        <div className="flex justify-end gap-3 p-6 pt-4 shrink-0 bg-mono-0 dark:bg-mono-180">
          <Button
            variant="secondary"
            className="!bg-red-50 hover:!bg-red-70 !text-mono-0"
            onClick={onReject}
            isLoading={isRejecting}
            isDisabled={isRejecting}
          >
            Reject
          </Button>

          <Button variant="primary" onClick={handleApproveClick}>
            Approve
          </Button>
        </div>
      )}

      {viewOnly && (
        <div className="flex justify-end gap-3 p-6 pt-4 shrink-0 bg-mono-0 dark:bg-mono-180">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </>
  );

  const renderApproveFormView = () => (
    <>
      <ModalBody className="overflow-y-auto flex-1 justify-start">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Typography variant="h4" className="text-center mb-3">
            Security Commitment
          </Typography>

          {(isLoadingRequirements || isLoadingStake) && (
            <div className="space-y-4">
              <SkeletonLoader className="h-24 w-full rounded-lg" />
              <SkeletonLoader className="h-24 w-full rounded-lg" />
            </div>
          )}

          {!isLoadingRequirements &&
            !isLoadingStake &&
            hasCustomRequirements &&
            requirements !== undefined && (
              <div className="space-y-4">
                <Typography
                  variant="body2"
                  className="text-mono-100 dark:text-mono-100 text-center"
                >
                  Set your exposure percentage within the allowed bounds for
                  each asset.
                </Typography>

                {requirements.map((req) => {
                  const key = toAssetMapKey(req.asset.token);

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

          {!isLoadingRequirements &&
            !isLoadingStake &&
            !hasCustomRequirements && (
              <div className="space-y-4">
                {defaultTntRequirement ? (
                  <>
                    <Typography
                      variant="body2"
                      className="text-mono-100 dark:text-mono-100 text-center"
                    >
                      Standard approval — set your TNT security commitment.
                    </Typography>

                    <Controller
                      name="tntExposureBps"
                      control={control}
                      defaultValue={defaultTntRequirement.minExposureBps}
                      rules={{
                        min: {
                          value: defaultTntRequirement.minExposureBps,
                          message: `Must be at least ${defaultTntRequirement.minExposureBps / 100}%`,
                        },
                        max: {
                          value: defaultTntRequirement.maxExposureBps,
                          message: `Cannot exceed ${defaultTntRequirement.maxExposureBps / 100}%`,
                        },
                      }}
                      render={({ field, fieldState }) => (
                        <ExposureCommitmentInput
                          tokenAddress={defaultTntRequirement.asset.token}
                          assetKind={defaultTntRequirement.asset.kind}
                          metadata={defaultTntRequirement.metadata}
                          minExposureBps={defaultTntRequirement.minExposureBps}
                          maxExposureBps={defaultTntRequirement.maxExposureBps}
                          value={
                            field.value ?? defaultTntRequirement.minExposureBps
                          }
                          onChange={field.onChange}
                          errorMessage={fieldState.error?.message}
                          delegatedAmount={getStakeForAsset(
                            defaultTntRequirement.asset.token,
                          )}
                          operatorExposureBps={
                            derivedSimpleStakingPercent * 100
                          }
                        />
                      )}
                    />
                  </>
                ) : (
                  <Typography
                    variant="body2"
                    className="text-center text-mono-100 dark:text-mono-100"
                  >
                    No custom commitments required.
                  </Typography>
                )}
              </div>
            )}
        </form>
      </ModalBody>

      <div className="flex justify-between gap-3 p-6 pt-4 shrink-0 bg-mono-0 dark:bg-mono-180">
        <Button
          variant="secondary"
          onClick={handleBackToDetails}
          isDisabled={isApproving}
        >
          Back
        </Button>

        <Button
          variant="primary"
          onClick={handleSubmit(handleFormSubmit)}
          isLoading={isApproving}
          isDisabled={
            isApproving || isLoadingRequirements || isLoadingStake || !isValid
          }
        >
          Confirm Approval
        </Button>
      </div>
    </>
  );

  const getModalTitle = () => {
    const baseTitle = `Service Request #${addCommasToNumber(Number(selectedRequest.requestId))}`;
    if (view === 'approve-form') {
      return `${baseTitle} - Approve`;
    }
    return baseTitle;
  };

  const getModalDescription = () => {
    if (view === 'approve-form') {
      if (hasCustomRequirements) {
        return 'Set your security commitment to approve this request';
      }
      return defaultTntRequirement
        ? 'Set your TNT exposure commitment to approve this request'
        : 'Approve this request using the standard approval flow';
    }
    if (viewOnly) {
      return 'View the service request details';
    }
    return 'Review the service request details before taking action';
  };

  return (
    <ModalContent
      size="lg"
      className="overflow-hidden flex flex-col max-h-[85vh]"
      title={getModalTitle()}
      description={getModalDescription()}
    >
      <ModalHeader onClose={onClose}>{getModalTitle()}</ModalHeader>

      {view === 'details' && renderDetailsView()}
      {view === 'approve-form' && renderApproveFormView()}
    </ModalContent>
  );
};

export default ServiceRequestDetailModal;
