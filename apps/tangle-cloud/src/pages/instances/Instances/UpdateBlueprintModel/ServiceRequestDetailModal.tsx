import {
  Button,
  ModalBody,
  ModalContent,
  ModalHeader,
  Skeleton,
  Text,
} from '../../../../components/sandbox/SandboxUi';
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
  useExpireServiceRequestTx,
  isServiceRequestExpired,
} from '@tangle-network/tangle-shared-ui/data/services';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
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
};

const addCommasToNumber = (value: number) => value.toLocaleString();

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

  // Permissionless cleanup. Available once `now > createdAt + grace` and the
  // request has not already been activated or rejected. The contract
  // re-validates these conditions, but we gate the button to avoid wasting a
  // user's gas on a guaranteed revert.
  const {
    execute: expireServiceRequest,
    error: expireError,
    reset: resetExpire,
    isPending: isExpiring,
    isSuccess: isExpireSuccess,
  } = useExpireServiceRequestTx();

  const canExpireRequest = useMemo(() => {
    if (!contractDetails || !selectedRequest) {
      return false;
    }
    if (contractDetails.rejected) {
      return false;
    }
    return isServiceRequestExpired(contractDetails.createdAt);
  }, [contractDetails, selectedRequest]);

  const handleExpireRequest = useCallback(async () => {
    if (!selectedRequest || !canExpireRequest) {
      return;
    }
    await expireServiceRequest?.({ requestId: selectedRequest.requestId });
  }, [canExpireRequest, expireServiceRequest, selectedRequest]);

  // After a successful expire the request is gone — close the modal so the
  // parent list refetches against an invalidated `serviceRequestDetails` cache.
  useEffect(() => {
    if (isExpireSuccess) {
      onClose();
    }
  }, [isExpireSuccess, onClose]);

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

  // Seed the commitment record from every requirement on the request — including
  // the default-TNT one when present. The contract's unified `approveService`
  // entrypoint accepts an explicit per-asset commitment array; sending the
  // operator's actual slider value (rather than dropping it and relying on
  // on-chain auto-fill at the minimum) is what lets operators commit above
  // `minExposureBps` from this UI.
  const initialCommitments = useMemo(() => {
    const commitments: Record<string, number> = {};
    if (requirements && requirements.length > 0) {
      for (const req of requirements) {
        commitments[toAssetMapKey(req.asset.token)] = req.minExposureBps;
      }
    } else if (defaultTntRequirement) {
      commitments[toAssetMapKey(defaultTntRequirement.asset.token)] =
        defaultTntRequirement.minExposureBps;
    }
    return commitments;
  }, [requirements, defaultTntRequirement]);

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
      queueMicrotask(() => {
        setView('details');
      });
    }
  }, [requestId]);

  const buildSecurityCommitments = useCallback(
    (commitments: Record<string, number>): ContractSecurityCommitment[] => {
      // Map every active requirement (custom set OR the default-TNT) into a
      // per-asset commitment using the operator's slider value, falling back
      // to the requirement's `minExposureBps` only if the slider is unset.
      const sourceRequirements =
        requirements && requirements.length > 0
          ? requirements
          : defaultTntRequirement
            ? [defaultTntRequirement]
            : [];

      return sourceRequirements.map((req) => ({
        asset: { kind: req.asset.kind, token: req.asset.token },
        exposureBps:
          commitments[toAssetMapKey(req.asset.token)] ?? req.minExposureBps,
      }));
    },
    [requirements, defaultTntRequirement],
  );

  const handleFormSubmit = useCallback(
    (data: FormValues) => {
      const securityCommitments = buildSecurityCommitments(data.commitments);
      return onApprove({
        requestId: Number(data.requestId),
        securityCommitments:
          securityCommitments.length > 0 ? securityCommitments : undefined,
      });
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

      {expireError ? (
        <div className="px-6 pt-2">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 space-y-2">
            <Text variant="body3" className="text-red-500 dark:text-red-400">
              {expireError.message ||
                'Failed to expire the service request. Please try again.'}
            </Text>
            <button
              type="button"
              className="text-xs underline text-red-500 dark:text-red-400"
              onClick={resetExpire}
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {!viewOnly && (
        <div className="flex flex-wrap justify-end gap-3 p-6 pt-4 shrink-0 bg-mono-0 dark:bg-mono-190">
          {canExpireRequest ? (
            <Button
              variant="secondary"
              onClick={() => void handleExpireRequest()}
              isLoading={isExpiring}
              isDisabled={
                isExpiring || isApproving || isRejecting || !canExpireRequest
              }
              title="Refunds the requester and frees the operator candidates. Anyone can call this once the grace period has passed."
            >
              Expire request
            </Button>
          ) : null}

          <Button
            variant="secondary"
            className="bg-destructive text-red-500 dark:text-red-400-foreground hover:bg-destructive/90"
            onClick={onReject}
            isLoading={isRejecting}
            isDisabled={isRejecting || isExpiring}
          >
            Reject
          </Button>

          <Button
            variant="primary"
            onClick={handleApproveClick}
            isDisabled={isExpiring}
          >
            Approve
          </Button>
        </div>
      )}

      {viewOnly && (
        <div className="flex flex-wrap justify-end gap-3 p-6 pt-4 shrink-0 bg-mono-0 dark:bg-mono-190">
          {canExpireRequest ? (
            <Button
              variant="secondary"
              onClick={() => void handleExpireRequest()}
              isLoading={isExpiring}
              isDisabled={isExpiring || !canExpireRequest}
              title="Refunds the requester and frees the operator candidates. Anyone can call this once the grace period has passed."
            >
              Expire request
            </Button>
          ) : null}
          <Button variant="secondary" onClick={onClose} isDisabled={isExpiring}>
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
          <Text variant="h4" className="text-center mb-3">
            Security Commitment
          </Text>

          {(isLoadingRequirements || isLoadingStake) && (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          )}

          {!isLoadingRequirements &&
            !isLoadingStake &&
            (() => {
              // Unified rendering: every requirement on the request — custom or
              // the default-TNT one — becomes a single per-asset slider bound to
              // `commitments.${tokenKey}`. The contract's unified
              // `approveService(ApprovalParams)` accepts the resulting array
              // directly, so the operator's slider value is no longer dropped
              // for the default-TNT case.
              const renderable =
                requirements && requirements.length > 0
                  ? requirements
                  : defaultTntRequirement
                    ? [defaultTntRequirement]
                    : [];

              if (renderable.length === 0) {
                return (
                  <Text
                    variant="body2"
                    className="text-center text-mono-100 dark:text-mono-60"
                  >
                    No security commitments required for this request.
                  </Text>
                );
              }

              return (
                <div className="space-y-4">
                  <Text
                    variant="body2"
                    className="text-mono-100 dark:text-mono-60 text-center"
                  >
                    Set your exposure percentage within the allowed bounds for
                    each asset.
                  </Text>

                  {renderable.map((req) => {
                    const key = toAssetMapKey(req.asset.token);
                    const isDefaultTnt =
                      !hasCustomRequirements &&
                      defaultTntRequirement !== null &&
                      toAssetMapKey(defaultTntRequirement.asset.token) === key;

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
                            operatorExposureBps={
                              isDefaultTnt
                                ? derivedSimpleStakingPercent * 100
                                : undefined
                            }
                          />
                        )}
                      />
                    );
                  })}
                </div>
              );
            })()}
        </form>
      </ModalBody>

      <div className="flex justify-between gap-3 p-6 pt-4 shrink-0 bg-mono-0 dark:bg-mono-190">
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
