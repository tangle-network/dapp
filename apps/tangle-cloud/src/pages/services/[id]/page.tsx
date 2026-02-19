/**
 * Service detail page - view service info and submit jobs.
 */

import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useAccount } from 'wagmi';
import {
  Button,
  Card,
  CardVariant,
  Input,
  Typography,
  SkeletonLoader,
  EMPTY_VALUE_PLACEHOLDER,
} from '@tangle-network/ui-components';
import { shortenHex } from '@tangle-network/ui-components/utils/shortenHex';
import {
  ArrowLeft,
  ExternalLinkLine,
  ShieldKeyholeLineIcon,
} from '@tangle-network/icons';
import {
  useServiceById,
  useBlueprintDetails,
  useJobsByService,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  useServiceDetails,
  useIsPermittedCaller,
  useIsServiceOperator,
  useAddPermittedCallerTx,
  useRemovePermittedCallerTx,
  MembershipModel,
  useBlueprintJobs,
} from '@tangle-network/tangle-shared-ui/data/services';
import { addressesEqual } from '@tangle-network/tangle-shared-ui/utils/safeParseAddress';
import useEvmOperatorInfo from '../../../hooks/useEvmOperatorInfo';
import { twMerge } from 'tailwind-merge';
import { Address, getAddress, isAddress, zeroAddress } from 'viem';
import { JobSubmissionForm } from './JobSubmissionForm';
import { JobHistoryTable } from './JobHistoryTable';
import ServiceOnChainDetails from './ServiceOnChainDetails';
import FundServiceModal from './FundServiceModal';
import OperatorMembershipPanel from './OperatorMembershipPanel';
import OperatorExitPanel from './OperatorExitPanel';
import { PagePath } from '../../../types';

const validatePermittedCallerInput = ({
  value,
  owner,
  permittedCallers,
}: {
  value: string;
  owner?: Address;
  permittedCallers: Address[];
}): { normalized: Address | null; error: string | null } => {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return { normalized: null, error: 'Caller address is required.' };
  }

  if (!isAddress(trimmed, { strict: false })) {
    return { normalized: null, error: 'Please enter a valid EVM address.' };
  }

  const normalized = getAddress(trimmed);

  if (addressesEqual(normalized, zeroAddress)) {
    return {
      normalized: null,
      error: 'Zero address cannot be a permitted caller.',
    };
  }

  if (owner && addressesEqual(owner, normalized)) {
    return {
      normalized: null,
      error: 'Owner address already has access and cannot be added.',
    };
  }

  if (permittedCallers.some((caller) => addressesEqual(caller, normalized))) {
    return {
      normalized: null,
      error: 'Address is already a permitted caller.',
    };
  }

  return { normalized, error: null };
};

const ServiceDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { address } = useAccount();
  const { isOperator, operatorAddress } = useEvmOperatorInfo();

  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [callerInput, setCallerInput] = useState('');
  const [callerInputError, setCallerInputError] = useState<string | null>(null);
  const [removingCaller, setRemovingCaller] = useState<Address | null>(null);

  const serviceId = useMemo(() => {
    if (!id) return undefined;
    try {
      return BigInt(id);
    } catch {
      return undefined;
    }
  }, [id]);

  // Fetch service by ID (visible to all users)
  const {
    data: service,
    isLoading: isLoadingServices,
    refetch: refetchService,
  } = useServiceById(serviceId);

  // Fetch on-chain service details to get owner
  const { data: onChainDetails, isLoading: isLoadingOnChainDetails } =
    useServiceDetails(serviceId);

  // Fetch blueprint details for job definitions
  const { result: blueprintResult, isLoading: isLoadingBlueprint } =
    useBlueprintDetails(service?.blueprintId);

  // Fetch job history
  const { data: jobs, isLoading: isLoadingJobs } = useJobsByService(serviceId);

  // Fetch blueprint job definitions (for schema-based decoding/encoding)
  const { data: jobDefinitions } = useBlueprintJobs(
    service?.blueprintId !== undefined
      ? BigInt(service.blueprintId)
      : undefined,
  );

  // Check if user is permitted to submit jobs
  const {
    data: isPermittedCaller,
    isLoading: isLoadingPermission,
    refetch: refetchPermission,
  } = useIsPermittedCaller(serviceId, address);

  const {
    execute: addPermittedCaller,
    isPending: isAddingPermittedCaller,
    error: addPermittedCallerError,
    reset: resetAddPermittedCallerTx,
  } = useAddPermittedCallerTx({
    onSuccess: () => {
      void refetchPermission();
      void refetchService();
    },
  });

  const {
    execute: removePermittedCaller,
    isPending: isRemovingPermittedCaller,
    error: removePermittedCallerError,
    reset: resetRemovePermittedCallerTx,
  } = useRemovePermittedCallerTx({
    onSuccess: () => {
      void refetchPermission();
      void refetchService();
    },
  });

  // Check if current user is a service operator
  const { data: isServiceOperator } = useIsServiceOperator(
    serviceId,
    operatorAddress ?? undefined,
    { enabled: !!operatorAddress && isOperator },
  );

  // Determine if user is the owner
  const isOwner = useMemo(() => {
    if (!address || !onChainDetails?.owner) return false;
    return addressesEqual(onChainDetails.owner, address);
  }, [address, onChainDetails?.owner]);

  useEffect(() => {
    setCallerInput('');
    setCallerInputError(null);
    setRemovingCaller(null);
  }, [serviceId]);

  const permittedCallers = useMemo(() => {
    const owner = onChainDetails?.owner
      ? getAddress(onChainDetails.owner)
      : null;
    const callers = new Map<string, Address>();

    for (const caller of service?.permittedCallers ?? []) {
      if (!isAddress(caller, { strict: false })) {
        continue;
      }
      const normalized = getAddress(caller);
      callers.set(normalized.toLowerCase(), normalized);
    }

    if (owner) {
      callers.set(owner.toLowerCase(), owner);
    }

    const allCallers = [...callers.values()];
    if (!owner) {
      return allCallers;
    }

    const withoutOwner = allCallers.filter(
      (caller) => !addressesEqual(caller, owner),
    );
    return [owner, ...withoutOwner];
  }, [onChainDetails?.owner, service?.permittedCallers]);

  // User can submit jobs if they are the owner or a permitted caller
  const canSubmitJobs = useMemo(() => {
    if (isOwner || isPermittedCaller) {
      return true;
    }

    if (!address) {
      return false;
    }

    return permittedCallers.some((caller) => addressesEqual(caller, address));
  }, [address, isOwner, isPermittedCaller, permittedCallers]);

  const isAclTxPending = isAddingPermittedCaller || isRemovingPermittedCaller;
  const activeAclError = addPermittedCallerError ?? removePermittedCallerError;

  const callerValidation = useMemo(
    () =>
      validatePermittedCallerInput({
        value: callerInput,
        owner: onChainDetails?.owner,
        permittedCallers,
      }),
    [callerInput, onChainDetails?.owner, permittedCallers],
  );

  const canAddPermittedCaller =
    isOwner &&
    !isAclTxPending &&
    addPermittedCaller !== null &&
    callerValidation.error === null &&
    callerValidation.normalized !== null;

  const handleCallerInputChange = useCallback(
    (nextValue: string) => {
      setCallerInput(nextValue);
      const validation = validatePermittedCallerInput({
        value: nextValue,
        owner: onChainDetails?.owner,
        permittedCallers,
      });
      setCallerInputError(
        nextValue.trim().length === 0 ? null : validation.error,
      );
    },
    [onChainDetails?.owner, permittedCallers],
  );

  const handleCallerInputBlur = useCallback(() => {
    const trimmed = callerInput.trim();
    if (trimmed.length === 0) {
      setCallerInputError('Caller address is required.');
      return;
    }

    const validation = validatePermittedCallerInput({
      value: trimmed,
      owner: onChainDetails?.owner,
      permittedCallers,
    });
    setCallerInputError(validation.error);

    if (isAddress(trimmed, { strict: false })) {
      const normalized = getAddress(trimmed);
      if (normalized !== callerInput) {
        setCallerInput(normalized);
      }
    }
  }, [callerInput, onChainDetails?.owner, permittedCallers]);

  const handleAddPermittedCaller = useCallback(async () => {
    if (serviceId === undefined || !isOwner) {
      return;
    }

    if (!addPermittedCaller) {
      setCallerInputError('Connect your wallet to update ACL settings.');
      return;
    }

    resetAddPermittedCallerTx();
    resetRemovePermittedCallerTx();

    if (
      callerValidation.error !== null ||
      callerValidation.normalized === null
    ) {
      setCallerInputError(callerValidation.error ?? 'Invalid caller address.');
      return;
    }

    setCallerInputError(null);

    const result = await addPermittedCaller({
      serviceId,
      caller: callerValidation.normalized,
    });

    if (result?.status === 'success') {
      setCallerInput('');
      setCallerInputError(null);
    }
  }, [
    serviceId,
    isOwner,
    resetAddPermittedCallerTx,
    resetRemovePermittedCallerTx,
    callerValidation,
    addPermittedCaller,
  ]);

  const handleRemovePermittedCaller = useCallback(
    async (caller: Address) => {
      if (serviceId === undefined || !isOwner) {
        return;
      }

      if (!removePermittedCaller) {
        return;
      }

      setRemovingCaller(caller);
      resetAddPermittedCallerTx();
      resetRemovePermittedCallerTx();
      setCallerInputError(null);

      try {
        await removePermittedCaller({
          serviceId,
          caller,
        });
      } finally {
        setRemovingCaller(null);
      }
    },
    [
      serviceId,
      isOwner,
      resetAddPermittedCallerTx,
      resetRemovePermittedCallerTx,
      removePermittedCaller,
    ],
  );

  // Check if this is a dynamic membership service
  const isDynamicService =
    onChainDetails?.membership === MembershipModel.Dynamic;

  const isLoading = isLoadingServices || isLoadingBlueprint;

  if (serviceId === undefined) {
    return (
      <div className="text-center py-12">
        <Typography variant="h4">Invalid Service ID</Typography>
        <Button onClick={() => navigate('/instances')} className="mt-4">
          Back to Instances
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader className="h-12 w-64" />
        <SkeletonLoader className="h-48" />
        <SkeletonLoader className="h-64" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <Typography variant="h4">Service Not Found</Typography>
        <Typography variant="body1" className="text-mono-100 mt-2">
          This service does not exist or may have been removed.
        </Typography>
        <Button onClick={() => navigate('/instances')} className="mt-4">
          Back to Instances
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="utility"
          isJustIcon
          onClick={() => navigate('/instances')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <Typography variant="h4" fw="bold">
            Service #{serviceId.toString()}
          </Typography>
          <Typography variant="body2" className="text-mono-100">
            {blueprintResult?.details.name ?? 'Loading...'}
          </Typography>
        </div>
      </div>

      {/* Service Info Card */}
      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-4">
          Service Information
        </Typography>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoItem
            label="Status"
            value={
              <span
                className={twMerge(
                  'px-2 py-1 rounded text-sm',
                  service.status === 'ACTIVE'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-mono-100/20 text-mono-100',
                )}
              >
                {service.status}
              </span>
            }
          />
          <InfoItem
            label="Blueprint"
            value={
              blueprintResult?.details.name ? (
                <Link
                  to={PagePath.BLUEPRINTS_DETAILS.replace(
                    ':id',
                    service.blueprintId.toString(),
                  )}
                  className="inline-flex items-center gap-1 text-blue-50 hover:text-blue-40 transition-colors"
                >
                  <Typography variant="body1" fw="semibold">
                    {blueprintResult.details.name}
                  </Typography>

                  <ExternalLinkLine className="w-4 h-4" />
                </Link>
              ) : (
                EMPTY_VALUE_PLACEHOLDER
              )
            }
          />
          <InfoItem
            label="Operators"
            value={
              service.operators?.length?.toString() ?? EMPTY_VALUE_PLACEHOLDER
            }
          />
          <InfoItem
            label="Created"
            value={
              service.createdAt
                ? new Date(
                    Number(service.createdAt) * 1000,
                  ).toLocaleDateString()
                : EMPTY_VALUE_PLACEHOLDER
            }
          />
        </div>
      </Card>

      {/* On-Chain Service Details */}
      <ServiceOnChainDetails
        serviceId={serviceId}
        blueprintId={
          service.blueprintId !== undefined
            ? BigInt(service.blueprintId)
            : undefined
        }
        onFundClick={() => setIsFundModalOpen(true)}
      />

      {/* Permitted Callers Management */}
      <Card variant={CardVariant.GLASS} className="p-6 space-y-4">
        <div className="space-y-1">
          <Typography variant="h5" fw="bold">
            Service Settings: Permitted Callers
          </Typography>
          <Typography variant="body2" className="text-mono-100">
            Manage which addresses can submit jobs to this service at runtime.
          </Typography>
        </div>

        {isLoadingOnChainDetails || isLoadingServices ? (
          <div className="space-y-3">
            <SkeletonLoader className="h-10" />
            <SkeletonLoader className="h-14" />
            <SkeletonLoader className="h-14" />
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-mono-60 dark:border-mono-140 p-3">
              <Typography variant="body2" className="text-mono-100">
                Connected account access:{' '}
                <span
                  className={
                    canSubmitJobs
                      ? 'text-green-400 font-semibold'
                      : 'text-yellow-300 font-semibold'
                  }
                >
                  {canSubmitJobs ? 'Allowed' : 'Not allowed'}
                </span>
              </Typography>
            </div>

            <div className="space-y-2">
              <Typography variant="body2" className="text-mono-100">
                Current permitted callers
              </Typography>
              {permittedCallers.length === 0 ? (
                <Typography variant="body2" className="text-mono-120">
                  No permitted callers configured.
                </Typography>
              ) : (
                <div className="space-y-2">
                  {permittedCallers.map((caller) => (
                    <div
                      key={caller}
                      className="flex items-center justify-between gap-3 rounded-lg border border-mono-60 dark:border-mono-140 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Typography variant="body2" className="font-mono">
                          {shortenHex(caller, 6)}
                        </Typography>
                        {onChainDetails?.owner &&
                          addressesEqual(caller, onChainDetails.owner) && (
                            <span className="px-2 py-0.5 rounded bg-blue-20 dark:bg-blue-110 text-blue-70 dark:text-blue-30 text-xs font-semibold">
                              Owner
                            </span>
                          )}
                      </div>

                      {isOwner &&
                        !(
                          onChainDetails?.owner &&
                          addressesEqual(caller, onChainDetails.owner)
                        ) && (
                          <Button
                            variant="utility"
                            size="sm"
                            className="uppercase body4 bg-red-10 dark:bg-red-120 text-red-70 dark:text-red-40 hover:bg-red-20 dark:hover:bg-red-110 border border-red-30 dark:border-red-100 transition-all duration-200"
                            isLoading={
                              isRemovingPermittedCaller &&
                              removingCaller !== null &&
                              addressesEqual(caller, removingCaller)
                            }
                            isDisabled={isAclTxPending}
                            onClick={() =>
                              void handleRemovePermittedCaller(caller)
                            }
                          >
                            Remove
                          </Button>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isOwner ? (
              <div className="space-y-2">
                <Typography variant="body2" className="text-mono-100">
                  Add permitted caller
                </Typography>
                <div className="flex flex-col md:flex-row gap-2">
                  <Input
                    id="permitted-caller-input"
                    value={callerInput}
                    isControlled
                    onChange={handleCallerInputChange}
                    onBlur={handleCallerInputBlur}
                    placeholder="0x..."
                    autoComplete="off"
                    isInvalid={!!callerInputError}
                    errorMessage={callerInputError ?? undefined}
                    aria-invalid={callerInputError ? 'true' : undefined}
                    inputClassName="h-10"
                  />
                  <Button
                    onClick={() => void handleAddPermittedCaller()}
                    isLoading={isAddingPermittedCaller}
                    isDisabled={!canAddPermittedCaller}
                    className="md:min-w-40"
                  >
                    Add Caller
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Typography variant="body2" className="text-mono-100">
                  Add permitted caller
                </Typography>
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <Typography variant="body2" className="text-yellow-400">
                    Only the service owner can add or remove permitted callers.
                  </Typography>
                </div>
              </div>
            )}

            {activeAclError && (
              <Typography variant="body2" className="text-red-400">
                ACL update failed: {activeAclError.message}
              </Typography>
            )}
          </>
        )}
      </Card>

      {/* Operator Membership Panel - Show for Dynamic services */}
      {isDynamicService && service.status === 'ACTIVE' && (
        <OperatorMembershipPanel
          serviceId={serviceId}
          isCurrentUserOperator={isServiceOperator ?? false}
          serviceDetails={onChainDetails}
        />
      )}

      {/* Operator Exit Panel - Show for operators in Dynamic services */}
      {isDynamicService &&
        service.status === 'ACTIVE' &&
        isServiceOperator &&
        operatorAddress && (
          <OperatorExitPanel
            serviceId={serviceId}
            operatorAddress={operatorAddress}
            isOwner={isOwner}
          />
        )}

      {/* Job Submission */}
      {service.status === 'ACTIVE' && blueprintResult?.details && (
        <Card variant={CardVariant.GLASS} className="p-6">
          <Typography variant="h5" fw="bold" className="mb-4">
            Submit Job
          </Typography>

          {isLoadingPermission || isLoadingOnChainDetails ? (
            <SkeletonLoader className="h-32" />
          ) : canSubmitJobs ? (
            <JobSubmissionForm
              serviceId={serviceId}
              blueprint={blueprintResult.details}
            />
          ) : (
            <PermissionDeniedMessage />
          )}
        </Card>
      )}

      {/* Job History */}
      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-4">
          Job History
        </Typography>
        <JobHistoryTable
          jobs={jobs ?? []}
          isLoading={isLoadingJobs}
          jobDefinitions={jobDefinitions}
        />
      </Card>

      {/* Fund Service Modal */}
      {isFundModalOpen && (
        <FundServiceModal
          serviceId={serviceId}
          onClose={() => setIsFundModalOpen(false)}
        />
      )}
    </div>
  );
};

const InfoItem: FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div>
    <Typography variant="body2" className="text-mono-100 mb-1">
      {label}
    </Typography>
    {typeof value === 'string' ? (
      <Typography variant="body1" fw="semibold">
        {value}
      </Typography>
    ) : (
      value
    )}
  </div>
);

const PermissionDeniedMessage: FC = () => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <div className="p-4 rounded-full bg-yellow-500/20 mb-4">
      <ShieldKeyholeLineIcon className="w-8 h-8 text-yellow-400" />
    </div>
    <Typography variant="h5" fw="semibold" className="mb-2">
      Permission Required
    </Typography>
    <Typography variant="body2" className="text-center text-mono-100 max-w-md">
      You are not authorized to submit jobs to this service. Only the service
      owner or addresses added as permitted callers can submit jobs.
    </Typography>
    <Typography variant="body3" className="text-mono-120 mt-4">
      Contact the service owner to request access.
    </Typography>
  </div>
);

export default ServiceDetailPage;
