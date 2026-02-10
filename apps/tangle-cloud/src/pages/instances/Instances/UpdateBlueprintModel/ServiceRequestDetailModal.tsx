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
import {
  useAllBlueprints,
  type ServiceRequest,
} from '@tangle-network/tangle-shared-ui/data/graphql';
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
import { useOperatorStakeByAsset } from '@tangle-network/tangle-shared-ui/data/restake/useOperatorDelegationsByAsset';
import {
  ServiceRequestSummary,
  BlueprintInfoCard,
} from '../../../../components/ServiceRequestDetails';
import type { Address } from 'viem';

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

  const { blueprints: allBlueprints } = useAllBlueprints();
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

  const { data: requirements, isLoading: isLoadingRequirements } =
    useServiceRequestSecurityRequirements(selectedRequest?.requestId);

  const assetsToQuery = useMemo(() => {
    if (!requirements || requirements.length === 0) {
      return undefined;
    }
    return requirements.map((req) => ({
      kind: req.asset.kind,
      token: req.asset.token,
    }));
  }, [requirements]);

  const { data: stakeByAsset, isLoading: isLoadingStake } =
    useOperatorStakeByAsset(operatorAddress, assetsToQuery);

  const initialCommitments = useMemo(() => {
    if (!requirements || requirements.length === 0) {
      return {};
    }

    const commitments: Record<string, number> = {};
    for (const req of requirements) {
      const key = req.asset.token.toLowerCase();
      commitments[key] = req.minExposureBps;
    }
    return commitments;
  }, [requirements]);

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
    handleSubmit,
    control,
    setValue,
    formState: { isValid },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      requestId: selectedRequest?.requestId ?? BigInt(0),
      commitments: {},
    },
  });

  useEffect(() => {
    if (Object.keys(initialCommitments).length > 0) {
      setValue('commitments', initialCommitments);
    }
  }, [initialCommitments, setValue]);

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

  const handleFormSubmit = useCallback(
    (data: FormValues) => {
      const formattedData: ApprovalConfirmationFormFields = {
        requestId: Number(data.requestId),
        securityCommitments: buildSecurityCommitments(data.commitments),
      };

      return onApprove(formattedData);
    },
    [buildSecurityCommitments, onApprove],
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

  const blueprintStats = allBlueprints?.get(
    selectedRequest.blueprintId.toString(),
  );

  const instancesCount = blueprintStats?.instancesCount ?? 0;
  const operatorsCount = blueprintStats?.operatorsCount ?? 0;

  const renderDetailsView = () => (
    <>
      <ModalBody>
        <BlueprintInfoCard
          name={selectedRequest.blueprintData?.name ?? ''}
          author={selectedRequest.blueprintData?.author ?? ''}
          description={selectedRequest.blueprintData?.description ?? ''}
          instancesCount={instancesCount}
          operatorsCount={operatorsCount}
        />

        <ServiceRequestSummary
          contractDetails={contractDetails}
          tokenSymbol={tokenMetadata?.symbol ?? 'ETH'}
          tokenDecimals={tokenMetadata?.decimals ?? 18}
          operatorCandidates={selectedRequest.operatorCandidates}
          approvedOperators={selectedRequest.approvedOperators}
          rejectedOperators={selectedRequest.rejectedOperators}
          currentOperator={operatorAddress ?? undefined}
          isLoading={isLoadingContract || isLoadingToken}
        />
      </ModalBody>

      {!viewOnly && (
        <div className="flex justify-end gap-3 p-6 pt-0">
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
        <div className="flex justify-end gap-3 p-6 pt-0">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </>
  );

  const hasRequirements = requirements && requirements.length > 0;

  const renderApproveFormView = () => (
    <>
      <ModalBody>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Typography variant="h4" className="text-center mb-3">
            Security Commitment
          </Typography>

          {(isLoadingRequirements || isLoadingStake) && (
            <div className="space-y-4">
              <SkeletonLoader className="h-24 w-full rounded-lg" />
              <SkeletonLoader className="h-24 w-full rounded-lg" />
            </div>
          )}

          {!isLoadingRequirements && !isLoadingStake && hasRequirements && (
            <div className="space-y-4">
              <Typography
                variant="body2"
                className="text-mono-100 dark:text-mono-100"
              >
                Set your exposure percentage within the allowed bounds for each
                asset.
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

      <div className="flex justify-between gap-3 p-6 pt-0">
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
            !isValid ||
            isApproving ||
            isLoadingRequirements ||
            isLoadingStake ||
            !hasRequirements
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
      return 'Set your security commitment to approve this request';
    }
    if (viewOnly) {
      return 'View the service request details';
    }
    return 'Review the service request details before taking action';
  };

  return (
    <ModalContent
      size="lg"
      onInteractOutside={(event) => event.preventDefault()}
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
