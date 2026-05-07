/**
 * Service detail page - view service info and submit jobs.
 */

import {
  type ChangeEvent,
  type ComponentProps,
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Text } from '../../../components/sandbox/SandboxUi';
import { useParams, useNavigate, Link } from 'react-router';
import { useAccount } from 'wagmi';
import {
  Button as SandboxButton,
  Card,
  Input as SandboxInput,
  Skeleton,
} from '@tangle-network/sandbox-ui/primitives';
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
import BlueprintHostCard from '../../../components/blueprintApps/BlueprintHostCard';

const EMPTY_VALUE_PLACEHOLDER = '-';
const CARD_SURFACE = 'sandbox' as const;

const shortenHex = (value: string, chars = 6) =>
  value.length <= chars * 2 + 2
    ? value
    : `${value.slice(0, chars)}...${value.slice(-chars)}`;

type ButtonProps = Omit<
  ComponentProps<typeof SandboxButton>,
  'variant' | 'size'
> & {
  variant?: ComponentProps<typeof SandboxButton>['variant'] | 'utility';
  size?: ComponentProps<typeof SandboxButton>['size'];
  isDisabled?: boolean;
  isLoading?: boolean;
  isJustIcon?: boolean;
};

const Button: FC<ButtonProps> = ({
  variant,
  size,
  isDisabled,
  isLoading,
  isJustIcon,
  disabled,
  ...props
}) => (
  <SandboxButton
    variant={variant === 'utility' ? 'outline' : variant}
    size={isJustIcon ? 'icon' : size}
    disabled={disabled || isDisabled}
    loading={isLoading}
    {...props}
  />
);

type InputProps = Omit<ComponentProps<typeof SandboxInput>, 'onChange'> & {
  isControlled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  inputClassName?: string;
  onChange?: (value: string) => void;
};

const Input: FC<InputProps> = ({
  isControlled: _isControlled,
  isInvalid,
  errorMessage,
  inputClassName,
  className = '',
  onChange,
  ...props
}) => (
  <div className={className}>
    <SandboxInput
      {...props}
      className={[inputClassName, isInvalid ? 'border-destructive' : '']
        .filter(Boolean)
        .join(' ')}
      onChange={(event: ChangeEvent<HTMLInputElement>) =>
        onChange?.(event.currentTarget.value)
      }
    />
    {errorMessage && (
      <p className="mt-1 text-destructive text-xs">{errorMessage}</p>
    )}
  </div>
);

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
        <Text variant="h4">Invalid Service ID</Text>
        <Button onClick={() => navigate(PagePath.INSTANCES)} className="mt-4">
          Back to Instances
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <Text variant="h4">Service Not Found</Text>
        <Text variant="body1" className="text-muted-foreground mt-2">
          This service does not exist or may have been removed.
        </Text>
        <Button onClick={() => navigate(PagePath.INSTANCES)} className="mt-4">
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
          onClick={() => navigate(PagePath.INSTANCES)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <Text variant="h4" fw="bold">
            Service #{serviceId.toString()}
          </Text>
          <Text variant="body2" className="text-muted-foreground">
            {blueprintResult?.details.name ?? 'Loading...'}
          </Text>
        </div>
      </div>

      {/* Service Info Card */}
      <Card variant={CARD_SURFACE} className="p-6">
        <Text variant="h5" fw="bold" className="mb-4">
          Service Information
        </Text>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoItem
            label="Status"
            value={
              <span
                className={twMerge(
                  'px-2 py-1 rounded text-sm',
                  service.status === 'ACTIVE'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-muted text-muted-foreground',
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
                  className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                >
                  <Text variant="body1" fw="semibold">
                    {blueprintResult.details.name}
                  </Text>

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

      {blueprintResult?.details && (
        <BlueprintHostCard
          blueprint={blueprintResult.details}
          serviceId={serviceId}
        />
      )}

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
      <Card variant={CARD_SURFACE} className="p-6 space-y-4">
        <div className="space-y-1">
          <Text variant="h5" fw="bold">
            Service Settings: Permitted Callers
          </Text>
          <Text variant="body2" className="text-muted-foreground">
            Manage which addresses can submit jobs to this service at runtime.
          </Text>
        </div>

        {isLoadingOnChainDetails || isLoadingServices ? (
          <div className="space-y-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-border p-3">
              <Text variant="body2" className="text-muted-foreground">
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
              </Text>
            </div>

            <div className="space-y-2">
              <Text variant="body2" className="text-muted-foreground">
                Current permitted callers
              </Text>
              {permittedCallers.length === 0 ? (
                <Text variant="body2" className="text-muted-foreground">
                  No permitted callers configured.
                </Text>
              ) : (
                <div className="space-y-2">
                  {permittedCallers.map((caller) => (
                    <div
                      key={caller}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Text variant="body2" className="font-mono">
                          {shortenHex(caller, 6)}
                        </Text>
                        {onChainDetails?.owner &&
                          addressesEqual(caller, onChainDetails.owner) && (
                            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-semibold">
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
                <Text variant="body2" className="text-muted-foreground">
                  Add permitted caller
                </Text>
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
                <Text variant="body2" className="text-muted-foreground">
                  Add permitted caller
                </Text>
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <Text variant="body2" className="text-yellow-400">
                    Only the service owner can add or remove permitted callers.
                  </Text>
                </div>
              </div>
            )}

            {activeAclError && (
              <Text variant="body2" className="text-red-400">
                ACL update failed: {activeAclError.message}
              </Text>
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
        <Card variant={CARD_SURFACE} className="p-6">
          <Text variant="h5" fw="bold" className="mb-4">
            Submit Job
          </Text>

          {isLoadingPermission || isLoadingOnChainDetails ? (
            <Skeleton className="h-32" />
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
      <Card variant={CARD_SURFACE} className="p-6">
        <Text variant="h5" fw="bold" className="mb-4">
          Job History
        </Text>
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

const InfoItem: FC<{ label: string; value: ReactNode }> = ({
  label,
  value,
}) => (
  <div>
    <Text variant="body2" className="text-muted-foreground mb-1">
      {label}
    </Text>
    {typeof value === 'string' ? (
      <Text variant="body1" fw="semibold">
        {value}
      </Text>
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
    <Text variant="h5" fw="semibold" className="mb-2">
      Permission Required
    </Text>
    <Text
      variant="body2"
      className="text-center text-muted-foreground max-w-md"
    >
      You are not authorized to submit jobs to this service. Only the service
      owner or addresses added as permitted callers can submit jobs.
    </Text>
    <Text variant="body3" className="text-muted-foreground mt-4">
      Contact the service owner to request access.
    </Text>
  </div>
);

export default ServiceDetailPage;
