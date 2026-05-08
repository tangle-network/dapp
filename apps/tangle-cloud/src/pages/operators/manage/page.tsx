/**
 * Operator management page - blueprint registration and full slashing lifecycle.
 */

import {
  type ChangeEvent,
  type ComponentProps,
  type FC,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { Text } from '../../../components/sandbox/SandboxUi';
import {
  Badge,
  Button as SandboxButton,
  Card,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input as SandboxInput,
} from '@tangle-network/sandbox-ui/primitives';
import { useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import {
  useOperatorRegistrations,
  useUnregisterOperatorTx,
  useUpdateOperatorPreferencesTx,
  useServicesByOperator,
  useActiveServiceMemberships,
  useSlashProposals,
  useSlashConfig,
  useDisputeSlashTx,
  useCancelSlashTx,
  useProposeSlashTx,
  useExecuteSlashTx,
  useExecutableSlashes,
  useProposableServices,
  getSlashDisputeEligibility,
  getSlashExecutionEligibility,
  getSlashActionPermissions,
  buildSlashTimeline,
  formatSlashBps,
  type OperatorRegistration,
  type SlashProposal,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { MembershipModel } from '@tangle-network/tangle-shared-ui/data/services';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { TangleCloudTable } from '../../../components/tangleCloudTable/TangleCloudTable';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import { InformationLine } from '@tangle-network/icons';
import {
  ECDSA_PUBLIC_KEY_HEX_LENGTH,
  MIN_CANCEL_REASON_LENGTH,
  MIN_DISPUTE_REASON_LENGTH,
  SlashingTab,
} from './constants';
import {
  formatDateTime,
  formatTimeRemaining,
  getSlashProposerRoleChipColor,
  getSlashProposerRoleLabel,
  isValidEcdsaPublicKey,
} from './utils';
import useChainClock from './hooks/useChainClock';
import useSlashProposalForm from './hooks/useSlashProposalForm';
import useSlashActions from './hooks/useSlashActions';
import SlashingSummaryCards from './components/SlashingSummaryCards';
import SlashingTabsTable from './components/SlashingTabsTable';
import ProposeSlashModal from './components/modals/ProposeSlashModal';
import DisputeMessageModal from './components/modals/DisputeMessageModal';
import DisputeSlashModal from './components/modals/DisputeSlashModal';
import CancelSlashModal from './components/modals/CancelSlashModal';
import TimelineModal from './components/modals/TimelineModal';
import RequireWallet from '../../../components/RequireWallet';

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
};

const Button: FC<ButtonProps> = ({
  variant,
  size,
  isDisabled,
  isLoading,
  disabled,
  ...props
}) => (
  <SandboxButton
    variant={variant === 'utility' ? 'outline' : variant}
    size={size}
    disabled={disabled || isDisabled}
    loading={isLoading}
    {...props}
  />
);

type InputProps = Omit<ComponentProps<typeof SandboxInput>, 'onChange'> & {
  isControlled?: boolean;
  onChange?: (value: string) => void;
};

const Input: FC<InputProps> = ({
  isControlled: _isControlled,
  onChange,
  ...props
}) => (
  <SandboxInput
    {...props}
    onChange={(event: ChangeEvent<HTMLInputElement>) =>
      onChange?.(event.currentTarget.value)
    }
  />
);

const Chip: FC<{ color?: string; children: ReactNode }> = ({
  color,
  children,
}) => {
  const variant =
    color === 'green' ? 'success' : color === 'red' ? 'destructive' : 'outline';

  return <Badge variant={variant}>{children}</Badge>;
};

const Modal = Dialog;
const ModalContent = DialogContent;

const ModalHeader: FC<ComponentProps<'div'>> = ({ children, ...props }) => (
  <DialogHeader {...props}>
    <DialogTitle>{children}</DialogTitle>
  </DialogHeader>
);

const ModalBody: FC<ComponentProps<'div'>> = ({ className = '', ...props }) => (
  <div
    className={['space-y-4', className].filter(Boolean).join(' ')}
    {...props}
  />
);

const ModalFooterActions: FC<{
  hasCloseButton?: boolean;
  isConfirmDisabled?: boolean;
  isProcessing?: boolean;
  confirmButtonText: string;
  onConfirm: () => void | Promise<void>;
}> = ({
  hasCloseButton,
  isConfirmDisabled,
  isProcessing,
  confirmButtonText,
  onConfirm,
}) => (
  <DialogFooter>
    {hasCloseButton && (
      <DialogClose asChild>
        <Button variant="secondary">Cancel</Button>
      </DialogClose>
    )}
    <Button
      disabled={isConfirmDisabled}
      loading={isProcessing}
      onClick={() => void onConfirm()}
    >
      {confirmButtonText}
    </Button>
  </DialogFooter>
);

const Tooltip: FC<{ children: ReactNode; delayDuration?: number }> = ({
  children,
}) => children;

const TooltipTrigger: FC<{ children: ReactNode; asChild?: boolean }> = ({
  children,
}) => children;

const TooltipBody: FC<ComponentProps<'span'>> = ({
  className = '',
  ...props
}) => (
  <span
    className={['sr-only', className].filter(Boolean).join(' ')}
    {...props}
  />
);

const CopyWithTooltip: FC<{
  textToCopy: string;
  isButton?: boolean;
  iconSize?: string;
  iconClassName?: string;
}> = ({ textToCopy }) => (
  <button
    type="button"
    className="text-muted-foreground text-xs underline-offset-4 hover:text-foreground hover:underline"
    onClick={() => void navigator.clipboard?.writeText(textToCopy)}
  >
    Copy
  </button>
);

const registrationColumnHelper = createColumnHelper<OperatorRegistration>();
const slashColumnHelper = createColumnHelper<SlashProposal>();

interface RegistrationActionState {
  canUpdate: boolean;
  canUnregister: boolean;
  disableReason: string | null;
}

interface BlueprintServiceBreakdown {
  fixedCount: number;
  dynamicCount: number;
  totalCount: number;
}

const getRegistrationActionState = (
  registration: OperatorRegistration,
  options?: {
    breakdown?: BlueprintServiceBreakdown | null;
    isActiveServicePrecheckUnavailable?: boolean;
    isMembershipLoaded?: boolean;
  },
): RegistrationActionState => {
  const breakdown = options?.breakdown ?? null;
  const totalCount = breakdown?.totalCount ?? 0;
  const isActiveServicePrecheckUnavailable =
    options?.isActiveServicePrecheckUnavailable ?? false;
  const isMembershipLoaded = options?.isMembershipLoaded ?? false;

  if (!registration.active) {
    return {
      canUpdate: false,
      canUnregister: false,
      disableReason: 'Inactive',
    };
  }

  if (isActiveServicePrecheckUnavailable) {
    return {
      canUpdate: true,
      canUnregister: false,
      disableReason: 'Blocked: Service Precheck Unavailable',
    };
  }

  if (totalCount > 0) {
    let disableReason: string;

    if (!isMembershipLoaded || !breakdown) {
      disableReason = `Blocked: ${totalCount} Active Service${totalCount > 1 ? 's' : ''}`;
    } else if (breakdown.fixedCount > 0 && breakdown.dynamicCount > 0) {
      disableReason = `Blocked: ${breakdown.fixedCount} Fixed, ${breakdown.dynamicCount} Dynamic — Fixed services require deployer termination`;
    } else if (breakdown.fixedCount > 0) {
      disableReason = `Blocked: ${breakdown.fixedCount} Fixed Service${breakdown.fixedCount > 1 ? 's' : ''} — Deployer must terminate`;
    } else {
      disableReason = `Blocked: ${breakdown.dynamicCount} Active Service${breakdown.dynamicCount > 1 ? 's' : ''} — Leave services to unregister`;
    }

    return {
      canUpdate: true,
      canUnregister: false,
      disableReason,
    };
  }

  return {
    canUpdate: true,
    canUnregister: true,
    disableReason: null,
  };
};

const Page: FC = () => {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const { nowUnixSeconds, clockError, refreshNow } = useChainClock();

  // Data hooks (registration)
  const {
    data: registrations,
    isLoading: loadingRegistrations,
    error: registrationsError,
    refetch: refetchRegistrations,
  } = useOperatorRegistrations();
  const {
    data: activeServices,
    error: activeServicesError,
    refetch: refetchActiveServices,
  } = useServicesByOperator(address, {
    enabled: isConnected,
    status: 'ACTIVE',
  });

  // Data hooks (slashing)
  const {
    data: slashProposals,
    isLoading: loadingSlash,
    error: slashError,
    refetch: refetchSlashProposals,
  } = useSlashProposals({
    scope: 'all',
    enabled: isConnected,
  });
  const { data: proposableServices, isLoading: loadingProposableServices } =
    useProposableServices({
      enabled: isConnected,
    });
  const { data: executableSlashIds, refetch: refetchExecutableSlashes } =
    useExecutableSlashes({
      enabled: isConnected,
      proposals: slashProposals,
    });
  const { data: slashConfig } = useSlashConfig({ enabled: isConnected });

  // Transaction hooks (registration)
  const { unregisterOperator, status: unregisterStatus } =
    useUnregisterOperatorTx();
  const { updatePreferences, status: updateStatus } =
    useUpdateOperatorPreferencesTx();

  // Transaction hooks (slashing)
  const { proposeSlash, status: proposeStatus } = useProposeSlashTx();
  const { disputeSlash, status: disputeStatus } = useDisputeSlashTx();
  const { cancelSlash, status: cancelStatus } = useCancelSlashTx();
  const { executeSlash } = useExecuteSlashTx();

  // Registration modal state
  const [selectedRegistration, setSelectedRegistration] =
    useState<OperatorRegistration | null>(null);
  const [showUnregisterModal, setShowUnregisterModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newRpcAddress, setNewRpcAddress] = useState('');
  const [newEcdsaPublicKey, setNewEcdsaPublicKey] = useState('');

  // Slashing state
  const [selectedSlash, setSelectedSlash] = useState<SlashProposal | null>(
    null,
  );
  const [selectedSlashingTab, setSelectedSlashingTab] = useState<SlashingTab>(
    SlashingTab.MY_PROPOSALS,
  );
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showDisputeMessageModal, setShowDisputeMessageModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const trimmedDisputeReason = disputeReason.trim();
  const trimmedCancelReason = cancelReason.trim();
  const trimmedEcdsaPublicKey = newEcdsaPublicKey.trim();

  const {
    proposeServiceId,
    setProposeServiceId,
    proposeOperator,
    setProposeOperator,
    proposeSlashBps,
    setProposeSlashBps,
    proposeEvidence,
    setProposeEvidence,
    selectedProposableService,
    proposableServiceOptions,
    evidenceNormalization,
    proposeValidationError,
    canSubmitPropose,
    resetForm: resetProposeForm,
  } = useSlashProposalForm({
    proposableServices,
    proposeStatus,
    maxSlashBps: slashConfig?.maxSlashBps,
  });

  const executableSlashIdSet = useMemo(() => {
    const set = new Set<string>();
    for (const id of executableSlashIds ?? []) {
      set.add(id.toString());
    }
    return set;
  }, [executableSlashIds]);

  const activeServiceIds = useMemo(
    () => (activeServices ?? []).map((service) => service.serviceId),
    [activeServices],
  );

  const { data: serviceMemberships } = useActiveServiceMemberships(
    activeServiceIds,
    {
      enabled: isConnected && activeServiceIds.length > 0,
    },
  );

  const isMembershipLoaded = serviceMemberships !== undefined;

  const breakdownByBlueprint = useMemo(() => {
    const map = new Map<string, BlueprintServiceBreakdown>();

    for (const service of activeServices ?? []) {
      const blueprintId = service.blueprintId.toString();
      const existing = map.get(blueprintId) ?? {
        fixedCount: 0,
        dynamicCount: 0,
        totalCount: 0,
      };

      existing.totalCount += 1;

      const membership = serviceMemberships?.get(service.serviceId.toString());
      if (membership === MembershipModel.Fixed) {
        existing.fixedCount += 1;
      } else if (membership === MembershipModel.Dynamic) {
        existing.dynamicCount += 1;
      }

      map.set(blueprintId, existing);
    }

    return map;
  }, [activeServices, serviceMemberships]);

  const isActiveServicePrecheckUnavailable = Boolean(activeServicesError);

  const myProposals = useMemo(() => {
    if (!address) {
      return [] as SlashProposal[];
    }

    return (slashProposals ?? []).filter(
      (slash) => slash.proposer.toLowerCase() === address.toLowerCase(),
    );
  }, [address, slashProposals]);

  const againstMe = useMemo(() => {
    if (!address) {
      return [] as SlashProposal[];
    }

    return (slashProposals ?? []).filter(
      (slash) => slash.operator.toLowerCase() === address.toLowerCase(),
    );
  }, [address, slashProposals]);

  const myActiveProposalCount = useMemo(
    () =>
      myProposals.filter(
        (slash) => slash.status === 'Pending' || slash.status === 'Disputed',
      ).length,
    [myProposals],
  );

  const activeAgainstMeCount = useMemo(
    () =>
      againstMe.filter(
        (slash) => slash.status === 'Pending' || slash.status === 'Disputed',
      ).length,
    [againstMe],
  );

  const selectedSlashEligibility = useMemo(() => {
    if (!selectedSlash) {
      return null;
    }

    return getSlashDisputeEligibility(selectedSlash, nowUnixSeconds);
  }, [selectedSlash, nowUnixSeconds]);

  const selectedSlashPermissions = useMemo(() => {
    if (!selectedSlash) {
      return null;
    }

    return getSlashActionPermissions({
      slash: selectedSlash,
      connectedAddress: address,
      nowUnixSeconds,
    });
  }, [address, nowUnixSeconds, selectedSlash]);

  const selectedSlashTimeline = useMemo(() => {
    if (!selectedSlash) {
      return [];
    }

    return buildSlashTimeline(selectedSlash, nowUnixSeconds);
  }, [selectedSlash, nowUnixSeconds]);

  const disputeBond = slashConfig?.disputeBond ?? BigInt(0);
  const slashConfigMaxSlashBps = slashConfig?.maxSlashBps;

  // Only meaningful when the slash is already in `Disputed` state and we have
  // an authoritative on-chain disputeDeadline. Returns null otherwise so the
  // modal can decide not to render the row.
  const selectedSlashDisputeResolutionSecondsRemaining = useMemo(() => {
    if (!selectedSlash || selectedSlash.status !== 'Disputed') {
      return null;
    }
    if (selectedSlash.disputeDeadline === BigInt(0)) {
      return null;
    }
    return Number(selectedSlash.disputeDeadline) - nowUnixSeconds;
  }, [selectedSlash, nowUnixSeconds]);

  const nearestPendingSlash = useMemo(() => {
    const pendingAgainstMe = againstMe.filter(
      (slash) => slash.status === 'Pending',
    );

    if (pendingAgainstMe.length === 0) {
      return null;
    }

    return [...pendingAgainstMe].sort((a, b) => {
      return Number(a.executeAfter) - Number(b.executeAfter);
    })[0];
  }, [againstMe]);

  const nearestPendingSlashEligibility = useMemo(() => {
    if (!nearestPendingSlash) {
      return null;
    }

    return getSlashDisputeEligibility(nearestPendingSlash, nowUnixSeconds);
  }, [nearestPendingSlash, nowUnixSeconds]);

  const isDisputeReasonValid =
    trimmedDisputeReason.length >= MIN_DISPUTE_REASON_LENGTH;
  const canSubmitDispute =
    !!selectedSlashPermissions?.canDispute && isDisputeReasonValid;

  const isCancelReasonValid =
    trimmedCancelReason.length >= MIN_CANCEL_REASON_LENGTH;
  const canSubmitCancel =
    !!selectedSlashPermissions?.canCancel && isCancelReasonValid;

  const resolvedRpcAddress = useMemo(() => {
    if (!selectedRegistration) {
      return '';
    }

    return newRpcAddress.trim();
  }, [newRpcAddress, selectedRegistration]);

  const resolvedEcdsaPublicKey = useMemo(() => {
    if (!selectedRegistration) {
      return null;
    }

    const nextKey =
      trimmedEcdsaPublicKey || selectedRegistration.preferences.ecdsaPublicKey;

    return nextKey.trim();
  }, [selectedRegistration, trimmedEcdsaPublicKey]);

  const ecdsaPublicKeyError = useMemo(() => {
    if (!selectedRegistration || !resolvedEcdsaPublicKey) {
      return null;
    }

    if (!isValidEcdsaPublicKey(resolvedEcdsaPublicKey)) {
      if (!trimmedEcdsaPublicKey) {
        return `Current ECDSA public key is invalid. Enter a valid 65-byte key (${ECDSA_PUBLIC_KEY_HEX_LENGTH} hex chars including 0x) to continue.`;
      }

      return `ECDSA public key must be 65 bytes (${ECDSA_PUBLIC_KEY_HEX_LENGTH} hex chars including 0x).`;
    }

    return null;
  }, [resolvedEcdsaPublicKey, selectedRegistration, trimmedEcdsaPublicKey]);

  const rpcAddressError = useMemo(() => {
    if (!selectedRegistration) {
      return null;
    }

    const trimmedRpcAddress = newRpcAddress.trim();
    if (trimmedRpcAddress.length === 0) {
      return 'RPC endpoint is required.';
    }

    try {
      const url = new URL(trimmedRpcAddress);
      const isAllowedProtocol = ['http:', 'https:', 'ws:', 'wss:'].includes(
        url.protocol,
      );

      if (!isAllowedProtocol) {
        return 'RPC endpoint must use http(s) or ws(s).';
      }

      return null;
    } catch {
      return 'Please enter a valid RPC endpoint URL.';
    }
  }, [newRpcAddress, selectedRegistration]);

  const isNoopUpdate = useMemo(() => {
    if (!selectedRegistration) {
      return true;
    }

    const currentRpcAddress =
      selectedRegistration.preferences.rpcAddress.trim();
    const currentEcdsaKey =
      selectedRegistration.preferences.ecdsaPublicKey.toLowerCase();

    const rpcUnchanged = resolvedRpcAddress === currentRpcAddress;
    const keyUnchanged =
      trimmedEcdsaPublicKey.length === 0 ||
      trimmedEcdsaPublicKey.toLowerCase() === currentEcdsaKey;

    return rpcUnchanged && keyUnchanged;
  }, [resolvedRpcAddress, selectedRegistration, trimmedEcdsaPublicKey]);

  const {
    actionError,
    clearActionError,
    handleProposeSlash,
    handleDispute,
    handleCancel,
    handleExecuteSingle,
  } = useSlashActions({
    address,
    nowUnixSeconds,
    queryClient,
    refetchSlashProposals: async () => {
      const result = await refetchSlashProposals();
      return { data: result.data };
    },
    refetchExecutableSlashes,
    proposeSlash,
    disputeSlash,
    cancelSlash,
    executeSlash,
    executableSlashIdSet,
    selectedSlash,
    canSubmitDispute,
    canSubmitCancel,
    trimmedDisputeReason,
    trimmedCancelReason,
    canSubmitPropose,
    proposeServiceId,
    proposeOperator,
    proposeSlashBps,
    evidenceValue: evidenceNormalization.value,
    resetProposeForm,
    setSelectedSlashingTab,
    setShowProposeModal,
    setShowDisputeModal,
    setShowCancelModal,
    setSelectedSlash,
    setDisputeReason,
    setCancelReason,
  });

  const handleUnregister = useCallback(async () => {
    if (!selectedRegistration) {
      return;
    }

    const unregisteredBlueprintId = selectedRegistration.blueprintId;
    const result = await unregisterOperator(unregisteredBlueprintId);
    if (result) {
      queryClient.setQueriesData<OperatorRegistration[]>(
        { queryKey: ['operator', 'registrations'] },
        (existingRegistrations) => {
          if (!existingRegistrations) {
            return existingRegistrations;
          }

          return existingRegistrations.map((registration) =>
            registration.blueprintId === unregisteredBlueprintId
              ? { ...registration, active: false }
              : registration,
          );
        },
      );

      setShowUnregisterModal(false);
      setSelectedRegistration(null);
    }
  }, [selectedRegistration, unregisterOperator, queryClient]);

  const handleUpdatePreferences = useCallback(async () => {
    if (
      !selectedRegistration ||
      rpcAddressError ||
      ecdsaPublicKeyError ||
      !resolvedEcdsaPublicKey
    ) {
      return;
    }

    const updatedBlueprintId = selectedRegistration.blueprintId;
    const updatedRpcAddress = resolvedRpcAddress;
    const updatedEcdsaPublicKey = resolvedEcdsaPublicKey as `0x${string}`;

    const result = await updatePreferences(selectedRegistration.blueprintId, {
      ecdsaPublicKey: updatedEcdsaPublicKey,
      rpcAddress: updatedRpcAddress,
    });
    if (result) {
      queryClient.setQueriesData<OperatorRegistration[]>(
        { queryKey: ['operator', 'registrations'] },
        (existingRegistrations) => {
          if (!existingRegistrations) {
            return existingRegistrations;
          }

          return existingRegistrations.map((registration) =>
            registration.blueprintId === updatedBlueprintId
              ? {
                  ...registration,
                  preferences: {
                    ...registration.preferences,
                    rpcAddress: updatedRpcAddress,
                    ecdsaPublicKey: updatedEcdsaPublicKey,
                  },
                }
              : registration,
          );
        },
      );

      setShowUpdateModal(false);
      setSelectedRegistration(null);
      setNewRpcAddress('');
      setNewEcdsaPublicKey('');
    }
  }, [
    ecdsaPublicKeyError,
    queryClient,
    resolvedEcdsaPublicKey,
    resolvedRpcAddress,
    rpcAddressError,
    selectedRegistration,
    updatePreferences,
  ]);

  // Registration columns
  const registrationColumns = useMemo(
    () => [
      registrationColumnHelper.accessor('blueprintName', {
        header: () => 'Blueprint',
        cell: (info) => (
          <TableCellWrapper className="py-3 pr-3">
            <Text variant="body1" fw="semibold">
              {info.getValue()}
            </Text>
          </TableCellWrapper>
        ),
      }),
      registrationColumnHelper.accessor('preferences.rpcAddress', {
        header: () => 'RPC Endpoint',
        cell: (info) => (
          <TableCellWrapper className="py-3 pr-3">
            <Text variant="body2" className="font-mono">
              {info.getValue() || '-'}
            </Text>
          </TableCellWrapper>
        ),
      }),
      registrationColumnHelper.accessor('active', {
        header: () => 'Status',
        cell: (info) => (
          <TableCellWrapper className="py-3 pr-3">
            <div className="mr-auto">
              <Chip color={info.getValue() ? 'green' : 'yellow'}>
                {info.getValue() ? 'Active' : 'Inactive'}
              </Chip>
            </div>
          </TableCellWrapper>
        ),
      }),
      registrationColumnHelper.display({
        id: 'actions',
        header: () => '',
        cell: (info) => {
          const breakdown =
            breakdownByBlueprint.get(
              info.row.original.blueprintId.toString(),
            ) ?? null;
          const actionState = getRegistrationActionState(info.row.original, {
            breakdown,
            isActiveServicePrecheckUnavailable,
            isMembershipLoaded,
          });
          const canShowActions =
            actionState.canUpdate || actionState.canUnregister;

          const unregisterButton = (
            <Button
              variant="utility"
              size="sm"
              isDisabled={!actionState.canUnregister}
              className="uppercase body4 bg-destructive/10 text-destructive hover:bg-destructive/15 border border-destructive/20 disabled:!opacity-100 disabled:!text-muted-foreground disabled:!border-border disabled:!bg-transparent dark:disabled:!text-muted-foreground  disabled:cursor-not-allowed"
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                event.stopPropagation();
                setSelectedRegistration(info.row.original);
                setShowUnregisterModal(true);
              }}
            >
              Unregister
            </Button>
          );

          return (
            <TableCellWrapper removeRightBorder className="py-3 pr-3">
              {canShowActions ? (
                <div className="flex gap-2">
                  {actionState.canUpdate ? (
                    <Button
                      variant="utility"
                      size="sm"
                      className="uppercase body4 bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20"
                      onClick={(event: MouseEvent<HTMLButtonElement>) => {
                        event.stopPropagation();
                        setSelectedRegistration(info.row.original);
                        setNewRpcAddress(
                          info.row.original.preferences.rpcAddress,
                        );
                        setNewEcdsaPublicKey('');
                        setShowUpdateModal(true);
                      }}
                    >
                      Update
                    </Button>
                  ) : null}
                  {!actionState.canUnregister && actionState.disableReason ? (
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <span className="inline-flex cursor-not-allowed">
                          {unregisterButton}
                        </span>
                      </TooltipTrigger>
                      <TooltipBody>{actionState.disableReason}</TooltipBody>
                    </Tooltip>
                  ) : (
                    unregisterButton
                  )}
                </div>
              ) : null}
            </TableCellWrapper>
          );
        },
      }),
    ],
    [
      breakdownByBlueprint,
      isActiveServicePrecheckUnavailable,
      isMembershipLoaded,
    ],
  );

  // Slashing columns
  const slashColumns = useMemo(
    () => [
      slashColumnHelper.accessor('id', {
        header: () => 'ID',
        minSize: 100,
        cell: (info) => (
          <TableCellWrapper className="py-3 pr-3">
            <Text variant="body2">#{info.getValue().toString()}</Text>
          </TableCellWrapper>
        ),
      }),
      slashColumnHelper.accessor('serviceId', {
        header: () => 'Service',
        minSize: 120,
        cell: (info) => (
          <TableCellWrapper className="py-3 pr-3">
            <Text variant="body2">#{info.getValue().toString()}</Text>
          </TableCellWrapper>
        ),
      }),
      slashColumnHelper.accessor('operator', {
        header: () => 'Operator',
        cell: (info) => (
          <TableCellWrapper className="py-3 pr-3">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Text variant="body2" className="font-mono whitespace-nowrap">
                {shortenHex(info.getValue())}
              </Text>
              <CopyWithTooltip
                textToCopy={info.getValue()}
                isButton={false}
                iconSize="md"
                iconClassName="!fill-muted-foreground"
              />
            </div>
          </TableCellWrapper>
        ),
      }),
      slashColumnHelper.accessor('slashBps', {
        header: () => (
          <div className="flex items-center gap-1 !text-inherit">
            Slash %
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <InformationLine className="w-3.5 h-3.5 !fill-muted-foreground" />
                </span>
              </TooltipTrigger>
              <TooltipBody className="max-w-[220px]">
                The proposed slash percentage in basis points (100 bps = 1%).
              </TooltipBody>
            </Tooltip>
          </div>
        ),
        minSize: 120,
        cell: (info) => (
          <TableCellWrapper className="py-3 pr-3">
            <Text variant="body1" fw="semibold" className="text-red-500">
              {formatSlashBps(info.getValue())}
            </Text>
          </TableCellWrapper>
        ),
      }),
      slashColumnHelper.accessor('effectiveSlashBps', {
        header: () => (
          <div className="flex items-center gap-1 !text-inherit">
            Effective Slash %
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <InformationLine className="w-3.5 h-3.5 !fill-muted-foreground" />
                </span>
              </TooltipTrigger>
              <TooltipBody className="max-w-[220px]">
                The actual slash percentage applied after on-chain deductions
                and adjustments.
              </TooltipBody>
            </Tooltip>
          </div>
        ),
        minSize: 140,
        cell: (info) => (
          <TableCellWrapper className="py-3 pr-3">
            <Text variant="body1" fw="semibold" className="text-red-500">
              {formatSlashBps(info.getValue())}
            </Text>
          </TableCellWrapper>
        ),
      }),
      slashColumnHelper.accessor('proposer', {
        header: () => 'Proposer',
        cell: (info) => {
          const slash = info.row.original;

          return (
            <TableCellWrapper className="py-3 pr-3">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Text variant="body2" className="font-mono whitespace-nowrap">
                  {shortenHex(info.getValue())}
                </Text>
                <CopyWithTooltip
                  textToCopy={info.getValue()}
                  isButton={false}
                  iconSize="md"
                  iconClassName="!fill-muted-foreground"
                />
                <Chip color={getSlashProposerRoleChipColor(slash.proposerRole)}>
                  {getSlashProposerRoleLabel(slash.proposerRole)}
                </Chip>
              </div>
            </TableCellWrapper>
          );
        },
      }),
      slashColumnHelper.accessor('status', {
        header: () => 'Status',
        cell: (info) => {
          const status = info.getValue();
          const colorMap = {
            Pending: 'yellow',
            Executed: 'red',
            Cancelled: 'dark-grey',
            Disputed: 'blue',
          } as const;
          return (
            <TableCellWrapper className="py-3 pr-3">
              <Chip color={colorMap[status]}>{status}</Chip>
            </TableCellWrapper>
          );
        },
      }),
      slashColumnHelper.accessor('executeAfter', {
        header: () => 'Execute After',
        cell: (info) => (
          <TableCellWrapper className="py-3 pr-3">
            <Text variant="body2">{formatDateTime(info.getValue())}</Text>
          </TableCellWrapper>
        ),
      }),
      slashColumnHelper.display({
        id: 'actions',
        header: () => '',
        cell: (info) => {
          const slash = info.row.original;
          const permissions = getSlashActionPermissions({
            slash,
            connectedAddress: address,
            nowUnixSeconds,
          });
          const executionEligibility = getSlashExecutionEligibility(
            slash,
            nowUnixSeconds,
          );

          const isSlashedOperator =
            !!address && slash.operator.toLowerCase() === address.toLowerCase();
          const isExecutable = executableSlashIdSet.has(slash.id.toString());
          const canExecute = permissions.canExecute && isExecutable;
          const executeDisabledReason = !canExecute
            ? (permissions.executeReason ??
              'Not executable per on-chain discovery.')
            : null;

          return (
            <TableCellWrapper removeRightBorder className="py-3 pr-3">
              <div className="flex flex-nowrap items-center gap-2 overflow-x-auto whitespace-nowrap pb-1">
                {slash.status === 'Pending' && isSlashedOperator ? (
                  <Button
                    variant="utility"
                    size="sm"
                    isDisabled={!permissions.canDispute}
                    className="uppercase body4 bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={(event: MouseEvent<HTMLButtonElement>) => {
                      event.stopPropagation();
                      clearActionError('dispute');
                      setSelectedSlash(slash);
                      setDisputeReason('');
                      setShowDisputeModal(true);
                    }}
                  >
                    Dispute
                  </Button>
                ) : null}

                {!isSlashedOperator &&
                (slash.status === 'Pending' || slash.status === 'Disputed') ? (
                  <Button
                    variant="utility"
                    size="sm"
                    isDisabled={!permissions.canCancel}
                    className="uppercase body4 bg-destructive/10 text-destructive hover:bg-destructive/15 border border-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={(event: MouseEvent<HTMLButtonElement>) => {
                      event.stopPropagation();
                      clearActionError('cancel');
                      setSelectedSlash(slash);
                      setCancelReason('');
                      setShowCancelModal(true);
                    }}
                  >
                    Cancel
                  </Button>
                ) : null}

                {!isSlashedOperator &&
                (slash.status === 'Pending' || slash.status === 'Disputed')
                  ? (() => {
                      const executeButton = (
                        <Button
                          variant="utility"
                          size="sm"
                          isDisabled={!canExecute}
                          className="uppercase body4 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15 border border-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={(event: MouseEvent<HTMLButtonElement>) => {
                            event.stopPropagation();
                            void handleExecuteSingle(slash);
                          }}
                        >
                          Execute
                        </Button>
                      );

                      if (!canExecute) {
                        const reason =
                          executeDisabledReason ??
                          (executionEligibility.reason === 'DisputeWindowOpen'
                            ? `Ready in ${formatTimeRemaining(executionEligibility.secondsUntilExecutable)}`
                            : 'Not executable yet');

                        return (
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <span className="inline-flex cursor-not-allowed">
                                {executeButton}
                              </span>
                            </TooltipTrigger>
                            <TooltipBody>{reason}</TooltipBody>
                          </Tooltip>
                        );
                      }

                      return executeButton;
                    })()
                  : null}

                <Button
                  variant="utility"
                  size="sm"
                  className="uppercase body4"
                  onClick={(event: MouseEvent<HTMLButtonElement>) => {
                    event.stopPropagation();
                    setSelectedSlash(slash);
                    setShowTimelineModal(true);
                  }}
                >
                  Timeline
                </Button>

                {slash.status === 'Disputed' ? (
                  <Button
                    variant="utility"
                    size="sm"
                    className="uppercase body4"
                    onClick={(event: MouseEvent<HTMLButtonElement>) => {
                      event.stopPropagation();
                      setSelectedSlash(slash);
                      setShowDisputeMessageModal(true);
                    }}
                  >
                    View Dispute
                  </Button>
                ) : null}
              </div>
            </TableCellWrapper>
          );
        },
      }),
    ],
    [
      address,
      executableSlashIdSet,
      handleExecuteSingle,
      nowUnixSeconds,
      clearActionError,
    ],
  );

  const registrationTable = useReactTable({
    data: registrations ?? [],
    columns: registrationColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const myProposalsTable = useReactTable({
    data: myProposals,
    columns: slashColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const againstMeTable = useReactTable({
    data: againstMe,
    columns: slashColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div>
          <Text variant="h4" fw="bold">
            Operator management
          </Text>
          <Text variant="body1" className="text-muted-foreground mt-1">
            Review operator registrations, disputes, and slash actions for the
            connected wallet.
          </Text>
        </div>
        <RequireWallet
          eyebrow="Operator management"
          title="Connect an operator wallet"
          description="Connect a wallet to load registrations, disputes, and slash proposals."
          checks={['Registrations', 'Disputes', 'Slash lifecycle']}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Text variant="h4" fw="bold">
          Operator management
        </Text>
        <Text variant="body1" className="text-muted-foreground mt-1">
          Review registrations, propose slash actions, dispute claims, execute
          finalized slashes, or cancel proposals.
        </Text>
      </div>

      <SlashingSummaryCards
        activeRegistrationsCount={
          registrations?.filter((registration) => registration.active).length ??
          0
        }
        activeAgainstMeCount={activeAgainstMeCount}
        myActiveProposalCount={myActiveProposalCount}
        nearestPendingSlash={nearestPendingSlash}
        nearestPendingSlashEligibility={nearestPendingSlashEligibility}
      />

      {clockError ? (
        <Card className="p-4 border border-yellow-500/20 bg-yellow-500/10">
          <Text variant="body2" className="text-muted-foreground">
            {clockError}
          </Text>
          <div className="mt-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void refreshNow()}
            >
              Retry Block Clock
            </Button>
          </div>
        </Card>
      ) : null}

      {isActiveServicePrecheckUnavailable ? (
        <Card className="p-4 border border-yellow-500/20 bg-yellow-500/10">
          <Text variant="body2" className="text-muted-foreground">
            Active service precheck is unavailable. Unregister actions are
            temporarily disabled until indexer/service data can be fetched.
          </Text>
          <div className="mt-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void refetchActiveServices()}
            >
              Retry Precheck
            </Button>
          </div>
        </Card>
      ) : null}

      <TangleCloudTable
        title="Blueprint Registrations"
        data={registrations ?? []}
        isLoading={loadingRegistrations}
        error={registrationsError}
        onRetry={() => void refetchRegistrations()}
        tableProps={registrationTable}
        loadingTableProps={{
          title: 'Loading registrations...',
          description:
            'Please wait while we fetch your operator registrations.',
          icon: '🔄',
        }}
        errorTableProps={{
          title: 'Failed to load registrations',
          description:
            'Indexer or network request failed while loading your registrations.',
          icon: '⚠️',
        }}
        emptyTableProps={{
          title: 'No Registrations',
          description:
            'You are not registered as an operator for any blueprints.',
          icon: '📋',
          className: 'before:!hidden',
        }}
      />

      <SlashingTabsTable
        selectedSlashingTab={selectedSlashingTab}
        onSlashingTabChange={setSelectedSlashingTab}
        onOpenProposeModal={() => {
          clearActionError('propose');
          setShowProposeModal(true);
        }}
        myProposals={myProposals}
        againstMe={againstMe}
        loadingSlash={loadingSlash}
        slashError={slashError}
        refetchSlashProposals={() => void refetchSlashProposals()}
        myProposalsTable={myProposalsTable}
        againstMeTable={againstMeTable}
        executeError={actionError.execute}
        onDismissExecuteError={() => clearActionError('execute')}
      />

      {/* Unregister Modal */}
      <Modal open={showUnregisterModal} onOpenChange={setShowUnregisterModal}>
        <ModalContent>
          <ModalHeader>Unregister from Blueprint</ModalHeader>
          <ModalBody>
            <Text variant="body1">
              Are you sure you want to unregister from{' '}
              <strong>{selectedRegistration?.blueprintName}</strong>?
            </Text>
            <Text variant="body2" className="text-muted-foreground mt-2">
              This action removes your operator registration from this blueprint
              after chain checks pass.
            </Text>
          </ModalBody>
          <ModalFooterActions
            hasCloseButton
            isConfirmDisabled={unregisterStatus === 'pending'}
            isProcessing={unregisterStatus === 'pending'}
            confirmButtonText="Unregister"
            onConfirm={handleUnregister}
          />
        </ModalContent>
      </Modal>

      {/* Update Preferences Modal */}
      <Modal open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <ModalContent>
          <ModalHeader>Update Operator Preferences</ModalHeader>
          <ModalBody>
            <Text variant="body1" className="mb-4">
              Update your preferences for{' '}
              <strong>{selectedRegistration?.blueprintName}</strong>
            </Text>
            <div className="space-y-4">
              <div>
                <Text variant="body2" className="mb-1">
                  RPC Endpoint <span className="text-destructive">*</span>
                </Text>
                <Input
                  id="rpcAddress"
                  isControlled
                  value={newRpcAddress}
                  onChange={(value) => setNewRpcAddress(value)}
                  placeholder="https://your-node.example.com"
                />
                {rpcAddressError ? (
                  <Text variant="body3" className="mt-1 !text-destructive">
                    {rpcAddressError}
                  </Text>
                ) : null}
              </div>
              <div>
                <Text variant="body2" className="mb-1">
                  ECDSA Public Key (Optional Rotation)
                </Text>
                <Input
                  id="ecdsaPublicKey"
                  isControlled
                  value={newEcdsaPublicKey}
                  onChange={(value) => setNewEcdsaPublicKey(value)}
                  placeholder="0x... (65-byte uncompressed key)"
                />
                <Text variant="body3" className="text-muted-foreground mt-1">
                  Leave empty to keep your current key.
                </Text>
                {ecdsaPublicKeyError ? (
                  <Text variant="body3" className="mt-1 !text-destructive">
                    {ecdsaPublicKeyError}
                  </Text>
                ) : null}
              </div>
            </div>
          </ModalBody>
          <ModalFooterActions
            hasCloseButton
            isConfirmDisabled={
              updateStatus === 'pending' ||
              !!rpcAddressError ||
              !!ecdsaPublicKeyError ||
              isNoopUpdate
            }
            isProcessing={updateStatus === 'pending'}
            confirmButtonText="Update"
            onConfirm={handleUpdatePreferences}
          />
        </ModalContent>
      </Modal>

      <ProposeSlashModal
        open={showProposeModal}
        onOpenChange={(open) => {
          setShowProposeModal(open);
          if (!open) {
            clearActionError('propose');
            resetProposeForm();
          }
        }}
        loadingProposableServices={loadingProposableServices}
        proposableServicesCount={proposableServices?.length ?? 0}
        proposableServiceOptions={proposableServiceOptions}
        selectedProposableService={selectedProposableService}
        proposeServiceId={proposeServiceId}
        setProposeServiceId={setProposeServiceId}
        proposeOperator={proposeOperator}
        setProposeOperator={setProposeOperator}
        proposeSlashBps={proposeSlashBps}
        setProposeSlashBps={setProposeSlashBps}
        proposeEvidence={proposeEvidence}
        setProposeEvidence={setProposeEvidence}
        proposeValidationError={proposeValidationError}
        errorMessage={actionError.propose}
        onDismissError={() => clearActionError('propose')}
        canSubmitPropose={canSubmitPropose}
        isSubmitting={proposeStatus === 'pending'}
        onConfirm={() => void handleProposeSlash()}
        maxSlashBps={slashConfigMaxSlashBps}
      />

      <DisputeMessageModal
        open={showDisputeMessageModal}
        onOpenChange={setShowDisputeMessageModal}
        selectedSlash={selectedSlash}
      />

      <DisputeSlashModal
        open={showDisputeModal}
        onOpenChange={(open) => {
          setShowDisputeModal(open);
          if (!open) {
            clearActionError('dispute');
          }
        }}
        selectedSlash={selectedSlash}
        selectedSlashEligibility={selectedSlashEligibility}
        selectedSlashPermissions={selectedSlashPermissions}
        disputeReason={disputeReason}
        onDisputeReasonChange={setDisputeReason}
        minDisputeReasonLength={MIN_DISPUTE_REASON_LENGTH}
        trimmedDisputeReasonLength={trimmedDisputeReason.length}
        canSubmitDispute={canSubmitDispute}
        isSubmitting={disputeStatus === 'pending'}
        onConfirm={() => void handleDispute()}
        errorMessage={actionError.dispute}
        onDismissError={() => clearActionError('dispute')}
        disputeBond={disputeBond}
        disputeResolutionSecondsRemaining={
          selectedSlashDisputeResolutionSecondsRemaining
        }
      />

      <CancelSlashModal
        open={showCancelModal}
        onOpenChange={(open) => {
          setShowCancelModal(open);
          if (!open) {
            clearActionError('cancel');
          }
        }}
        selectedSlash={selectedSlash}
        selectedSlashPermissions={selectedSlashPermissions}
        cancelReason={cancelReason}
        onCancelReasonChange={setCancelReason}
        minCancelReasonLength={MIN_CANCEL_REASON_LENGTH}
        trimmedCancelReasonLength={trimmedCancelReason.length}
        canSubmitCancel={canSubmitCancel}
        isSubmitting={cancelStatus === 'pending'}
        onConfirm={() => void handleCancel()}
        errorMessage={actionError.cancel}
        onDismissError={() => clearActionError('cancel')}
      />

      <TimelineModal
        open={showTimelineModal}
        onOpenChange={setShowTimelineModal}
        selectedSlash={selectedSlash}
        timeline={selectedSlashTimeline}
      />
    </div>
  );
};

export default Page;
