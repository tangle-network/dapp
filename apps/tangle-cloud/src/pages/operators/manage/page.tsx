/**
 * Operator management page - blueprint registration and full slashing lifecycle.
 */

import { FC, ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Chip,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooterActions,
  Tooltip,
  TooltipTrigger,
  TooltipBody,
  CopyWithTooltip,
  TabContent,
} from '@tangle-network/ui-components';
import { TableAndChartTabs } from '@tangle-network/ui-components/components/TableAndChartTabs';
import { useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import {
  useOperatorRegistrations,
  useUnregisterOperatorTx,
  useUpdateOperatorPreferencesTx,
  useServicesByOperator,
  useActiveServiceMemberships,
  useSlashProposals,
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
  toSlashEvidenceBytes32,
  type OperatorRegistration,
  type SlashProposerRole,
  type SlashStatus,
  type SlashProposal,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { MembershipModel } from '@tangle-network/tangle-shared-ui/data/services';
import { shortenHex } from '@tangle-network/ui-components/utils/shortenHex';
import { isAddress, type Address } from 'viem';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { TangleCloudTable } from '../../../components/tangleCloudTable/TangleCloudTable';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import ConnectWalletButton from '@tangle-network/tangle-shared-ui/components/ConnectWalletButton';
import {
  PlayFillIcon,
  TimeLineIcon,
  CheckboxCircleLine,
  GlobalLine,
} from '@tangle-network/icons';

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

interface SlashSyncTarget {
  slashId: bigint;
  status: SlashStatus;
  disputeReason?: string | null;
  cancelReason?: string | null;
}

enum SlashingTab {
  PROPOSE = 'Propose',
  ACTIVE = 'Active',
  EXECUTABLE = 'Executable',
  HISTORY = 'History',
}

const SLASHING_TAB_ICONS: ReactElement[] = [
  <GlobalLine className="w-4 h-4 !fill-blue-50" />,
  <TimeLineIcon className="w-4 h-4 !fill-yellow-100" />,
  <PlayFillIcon className="w-4 h-4 !fill-green-50" />,
  <CheckboxCircleLine className="w-4 h-4 !fill-mono-120" />,
];
const SLASHING_TABS = Object.values(SlashingTab);

const MIN_DISPUTE_REASON_LENGTH = 20;
const MIN_CANCEL_REASON_LENGTH = 8;
const ECDSA_PUBLIC_KEY_HEX_LENGTH = 132; // 65-byte key => "0x" + 130 hex chars

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

const formatDateTime = (unixSeconds: bigint): string =>
  new Date(Number(unixSeconds) * 1000).toLocaleString();

const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) {
    return 'Ready now';
  }

  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  const sec = seconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${sec}s`;
  }

  return `${sec}s`;
};

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getSlashStatusReason = (
  status: SlashStatus,
  deadlineReason: 'NotPending' | 'DeadlinePassed' | null,
): string | null => {
  if (status === 'Pending' && deadlineReason === 'DeadlinePassed') {
    return 'Dispute window closed';
  }

  if (status === 'Executed') {
    return 'Already executed';
  }
  if (status === 'Cancelled') {
    return 'Cancelled';
  }
  if (status === 'Disputed') {
    return 'Disputed';
  }

  return null;
};

const decodeBytes32Ascii = (value: `0x${string}`): string | null => {
  if (!value || value.length !== 66) {
    return null;
  }

  const hex = value.slice(2).toLowerCase();
  let decoded = '';

  for (let i = 0; i < hex.length; i += 2) {
    const byte = Number.parseInt(hex.slice(i, i + 2), 16);
    if (!Number.isFinite(byte)) {
      return null;
    }
    if (byte === 0) {
      break;
    }
    if (byte < 32 || byte > 126) {
      return null;
    }
    decoded += String.fromCharCode(byte);
  }

  const text = decoded.trim();
  return text.length > 0 ? text : null;
};

const getSlashClaimContext = (slash: SlashProposal): string => {
  const cancelReason = slash.cancelReason?.trim();
  if (cancelReason) {
    return `Cancel reason: ${cancelReason}`;
  }

  const evidenceText = decodeBytes32Ascii(slash.evidence);
  if (evidenceText) {
    return `Claim: ${evidenceText}`;
  }

  return 'No human-readable reason on-chain';
};

const getSlashDisputeMessage = (slash: SlashProposal): string | null => {
  const disputeReason = slash.disputeReason?.trim();
  return disputeReason ? disputeReason : null;
};

const getSlashProposerRoleLabel = (role: SlashProposerRole): string => {
  if (role === 'ServiceOwner') {
    return 'Service Owner';
  }
  if (role === 'BlueprintOwner') {
    return 'Blueprint Owner';
  }
  if (role === 'SlashingOrigin') {
    return 'Slashing Origin';
  }

  return 'Authorized Proposer';
};

const getSlashProposerRoleChipColor = (
  role: SlashProposerRole,
): 'green' | 'blue' | 'yellow' | 'dark-grey' => {
  if (role === 'ServiceOwner') {
    return 'green';
  }
  if (role === 'BlueprintOwner') {
    return 'blue';
  }
  if (role === 'SlashingOrigin') {
    return 'yellow';
  }

  return 'dark-grey';
};

const isValidEcdsaPublicKey = (value: string): boolean =>
  /^0x[0-9a-fA-F]+$/.test(value) &&
  value.length === ECDSA_PUBLIC_KEY_HEX_LENGTH;

const Page: FC = () => {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const [nowUnixSeconds, setNowUnixSeconds] = useState(() =>
    Math.floor(Date.now() / 1000),
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowUnixSeconds(Math.floor(Date.now() / 1000));
    }, 5_000);

    return () => window.clearInterval(interval);
  }, []);

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
  const {
    data: proposableServices,
    isLoading: loadingProposableServices,
  } = useProposableServices({
    enabled: isConnected,
  });
  const {
    data: executableSlashIds,
    refetch: refetchExecutableSlashes,
  } = useExecutableSlashes({
    enabled: isConnected,
    proposals: slashProposals,
  });

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
  const [selectedSlash, setSelectedSlash] = useState<SlashProposal | null>(null);
  const [selectedSlashingTab, setSelectedSlashingTab] = useState<SlashingTab>(
    SlashingTab.PROPOSE,
  );
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showDisputeMessageModal, setShowDisputeMessageModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  // Propose form state
  const [proposeServiceId, setProposeServiceId] = useState('');
  const [proposeOperator, setProposeOperator] = useState('');
  const [proposeSlashBps, setProposeSlashBps] = useState('');
  const [proposeEvidence, setProposeEvidence] = useState('');

  const trimmedDisputeReason = disputeReason.trim();
  const trimmedCancelReason = cancelReason.trim();
  const trimmedEcdsaPublicKey = newEcdsaPublicKey.trim();

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

  const pendingSlashProposals = useMemo(
    () => (slashProposals ?? []).filter((slash) => slash.status === 'Pending'),
    [slashProposals],
  );

  const disputedSlashProposals = useMemo(
    () => (slashProposals ?? []).filter((slash) => slash.status === 'Disputed'),
    [slashProposals],
  );

  const proposedByMe = useMemo(() => {
    if (!address) {
      return [] as SlashProposal[];
    }

    return (slashProposals ?? []).filter(
      (slash) => slash.proposer.toLowerCase() === address.toLowerCase(),
    );
  }, [address, slashProposals]);

  const executableDiscoveryRows = useMemo(() => {
    return (slashProposals ?? []).filter(
      (slash) => slash.status === 'Pending' || slash.status === 'Disputed',
    );
  }, [slashProposals]);

  const activeSlashRows = useMemo(
    () => [...pendingSlashProposals, ...disputedSlashProposals],
    [pendingSlashProposals, disputedSlashProposals],
  );

  const historyRows = useMemo(
    () =>
      (slashProposals ?? []).filter(
        (slash) => slash.status === 'Executed' || slash.status === 'Cancelled',
      ),
    [slashProposals],
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

  const nearestPendingSlash = useMemo(() => {
    if (!pendingSlashProposals.length) {
      return null;
    }

    return [...pendingSlashProposals].sort((a, b) => {
      return Number(a.executeAfter) - Number(b.executeAfter);
    })[0];
  }, [pendingSlashProposals]);

  const nearestPendingSlashEligibility = useMemo(() => {
    if (!nearestPendingSlash) {
      return null;
    }

    return getSlashDisputeEligibility(nearestPendingSlash, nowUnixSeconds);
  }, [nearestPendingSlash, nowUnixSeconds]);

  const selectedProposableService = useMemo(() => {
    if (!proposeServiceId) {
      return null;
    }

    return (proposableServices ?? []).find(
      (service) => service.serviceId.toString() === proposeServiceId,
    ) ?? null;
  }, [proposableServices, proposeServiceId]);

  useEffect(() => {
    if (!selectedProposableService) {
      return;
    }

    const firstOperator = selectedProposableService.operatorCandidates[0];
    if (firstOperator && proposeOperator.length === 0) {
      setProposeOperator(firstOperator);
    }
  }, [selectedProposableService, proposeOperator.length]);

  const proposableServiceOptions = useMemo(() => {
    return (proposableServices ?? []).map((service) => ({
      value: service.serviceId.toString(),
      label: `Service #${service.serviceId.toString()} • ${service.blueprintName}`,
    }));
  }, [proposableServices]);

  const evidenceNormalization = useMemo(
    () => toSlashEvidenceBytes32(proposeEvidence),
    [proposeEvidence],
  );

  const proposeValidationError = useMemo(() => {
    if (!proposeServiceId) {
      return 'Select a service.';
    }

    if (!isAddress(proposeOperator)) {
      return 'Operator must be a valid EVM address.';
    }

    const slashBps = Number(proposeSlashBps);
    if (
      !Number.isInteger(slashBps) ||
      slashBps <= 0 ||
      slashBps > 10_000
    ) {
      return 'Slash BPS must be an integer between 1 and 10000.';
    }

    if (evidenceNormalization.error) {
      return evidenceNormalization.error;
    }

    return null;
  }, [
    evidenceNormalization.error,
    proposeOperator,
    proposeServiceId,
    proposeSlashBps,
  ]);

  const canSubmitPropose =
    proposeValidationError === null && proposeStatus !== 'pending';

  const isDisputeReasonValid =
    trimmedDisputeReason.length >= MIN_DISPUTE_REASON_LENGTH;
  const canSubmitDispute =
    !!selectedSlashPermissions?.canDispute && isDisputeReasonValid;

  const isCancelReasonValid = trimmedCancelReason.length >= MIN_CANCEL_REASON_LENGTH;
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

  const patchSlashInCache = useCallback(
    (
      slashId: bigint,
      updater: (proposal: SlashProposal) => SlashProposal,
    ) => {
      queryClient.setQueriesData<SlashProposal[]>(
        { queryKey: ['slashing', 'proposals'] },
        (existingProposals) => {
          if (!existingProposals) {
            return existingProposals;
          }

          return existingProposals.map((proposal) =>
            proposal.id === slashId ? updater(proposal) : proposal,
          );
        },
      );
    },
    [queryClient],
  );

  const upsertSlashInCache = useCallback(
    (slash: SlashProposal) => {
      queryClient.setQueriesData<SlashProposal[]>(
        { queryKey: ['slashing', 'proposals'] },
        (existingProposals) => {
          if (!existingProposals) {
            return [slash];
          }

          const index = existingProposals.findIndex(
            (proposal) => proposal.id === slash.id,
          );

          if (index === -1) {
            return [slash, ...existingProposals];
          }

          const next = [...existingProposals];
          next[index] = slash;
          return next;
        },
      );
    },
    [queryClient],
  );

  const refreshSlashingData = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['slashing'] });
    await refetchSlashProposals();
    await refetchExecutableSlashes();
  }, [queryClient, refetchExecutableSlashes, refetchSlashProposals]);

  const applySlashSyncTargetToCache = useCallback(
    (target: SlashSyncTarget) => {
      patchSlashInCache(target.slashId, (proposal) => ({
        ...proposal,
        status: target.status,
        disputeReason:
          target.disputeReason !== undefined
            ? target.disputeReason
            : proposal.disputeReason,
        cancelReason:
          target.cancelReason !== undefined
            ? target.cancelReason
            : proposal.cancelReason,
      }));
    },
    [patchSlashInCache],
  );

  const waitForSlashStatusSync = useCallback(
    async (targets: SlashSyncTarget[]) => {
      if (targets.length === 0) {
        return;
      }

      targets.forEach((target) => {
        applySlashSyncTargetToCache(target);
      });

      const matchesTarget = (
        proposal: SlashProposal | undefined,
        target: SlashSyncTarget,
      ): boolean => {
        if (!proposal || proposal.status !== target.status) {
          return false;
        }

        if (target.disputeReason !== undefined) {
          if (target.disputeReason === null) {
            if (proposal.disputeReason !== null) {
              return false;
            }
          } else {
            const expectedDispute = target.disputeReason.trim();
            const actualDispute = proposal.disputeReason?.trim() ?? '';
            if (expectedDispute.length > 0 && actualDispute !== expectedDispute) {
              return false;
            }
          }
        }

        if (target.cancelReason !== undefined) {
          if (target.cancelReason === null) {
            if (proposal.cancelReason !== null) {
              return false;
            }
          } else {
            const expectedCancel = target.cancelReason.trim();
            const actualCancel = proposal.cancelReason?.trim() ?? '';
            if (expectedCancel.length > 0 && actualCancel !== expectedCancel) {
              return false;
            }
          }
        }

        return true;
      };

      for (let attempt = 0; attempt < 8; attempt += 1) {
        try {
          const refreshed = await refetchSlashProposals();
          const refreshedProposals = refreshed.data ?? [];
          const allSynced = targets.every((target) => {
            const proposal = refreshedProposals.find(
              (item) => item.id === target.slashId,
            );
            return matchesTarget(proposal, target);
          });

          if (allSynced) {
            break;
          }
        } catch {
          // Keep optimistic cache values while waiting for indexer recovery.
        }

        targets.forEach((target) => {
          applySlashSyncTargetToCache(target);
        });

        await sleep(1_000);
      }

      await refetchExecutableSlashes();
    },
    [applySlashSyncTargetToCache, refetchExecutableSlashes, refetchSlashProposals],
  );

  const handleUnregister = useCallback(async () => {
    if (!selectedRegistration) return;
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

  const handleProposeSlash = useCallback(async () => {
    if (!canSubmitPropose || !evidenceNormalization.value) {
      return;
    }

    const proposalStartedAt = BigInt(Math.floor(Date.now() / 1000));
    const slashBps = Number(proposeSlashBps);
    const operatorAddress = proposeOperator as Address;
    const targetServiceId = BigInt(proposeServiceId);
    const targetEvidence = evidenceNormalization.value.toLowerCase();
    const proposerAddress = address?.toLowerCase() ?? null;
    const result = await proposeSlash(
      targetServiceId,
      operatorAddress,
      slashBps,
      evidenceNormalization.value,
    );

    if (result) {
      if (result.proposal) {
        upsertSlashInCache(result.proposal);
      }

      setProposeServiceId('');
      setProposeOperator('');
      setProposeSlashBps('');
      setProposeEvidence('');
      setShowProposeModal(false);
      setSelectedSlashingTab(SlashingTab.ACTIVE);
      await refreshSlashingData();

      for (let attempt = 0; attempt < 8; attempt += 1) {
        const refreshed = await refetchSlashProposals();
        const isVisible = (refreshed.data ?? []).some((proposal) => {
          if (result.slashId !== undefined) {
            return proposal.id === result.slashId;
          }

          return (
            proposerAddress !== null &&
            proposal.proposer.toLowerCase() === proposerAddress &&
            proposal.serviceId === targetServiceId &&
            proposal.operator.toLowerCase() === operatorAddress.toLowerCase() &&
            proposal.slashBps === BigInt(slashBps) &&
            proposal.evidence.toLowerCase() === targetEvidence &&
            proposal.proposedAt >= proposalStartedAt - BigInt(5)
          );
        });

        if (isVisible) {
          break;
        }

        await sleep(1_000);
      }
    }
  }, [
    address,
    canSubmitPropose,
    evidenceNormalization.value,
    proposeOperator,
    proposeServiceId,
    proposeSlashBps,
    proposeSlash,
    refetchSlashProposals,
    refreshSlashingData,
    upsertSlashInCache,
  ]);

  const handleDispute = useCallback(async () => {
    if (!selectedSlash || !canSubmitDispute) return;
    const disputedSlashId = selectedSlash.id;
    const submittedDisputeReason = trimmedDisputeReason;
    const result = await disputeSlash(disputedSlashId, submittedDisputeReason);
    if (result) {
      setShowDisputeModal(false);
      setSelectedSlash(null);
      setDisputeReason('');
      await waitForSlashStatusSync([
        {
          slashId: disputedSlashId,
          status: 'Disputed',
          disputeReason: submittedDisputeReason,
        },
      ]);
    }
  }, [
    canSubmitDispute,
    disputeSlash,
    selectedSlash,
    trimmedDisputeReason,
    waitForSlashStatusSync,
  ]);

  const handleCancel = useCallback(async () => {
    if (!selectedSlash || !canSubmitCancel) return;
    const cancelledSlashId = selectedSlash.id;
    const submittedCancelReason = trimmedCancelReason;
    const result = await cancelSlash(cancelledSlashId, submittedCancelReason);
    if (result) {
      setShowCancelModal(false);
      setSelectedSlash(null);
      setCancelReason('');
      await waitForSlashStatusSync([
        {
          slashId: cancelledSlashId,
          status: 'Cancelled',
          cancelReason: submittedCancelReason,
        },
      ]);
    }
  }, [
    cancelSlash,
    canSubmitCancel,
    selectedSlash,
    trimmedCancelReason,
    waitForSlashStatusSync,
  ]);

  const handleExecuteSingle = useCallback(
    async (slash: SlashProposal) => {
      const permissions = getSlashActionPermissions({
        slash,
        connectedAddress: address,
        nowUnixSeconds,
      });
      const isExecutable = executableSlashIdSet.has(slash.id.toString());

      if (!permissions.canExecute || !isExecutable) {
        return;
      }

      const result = await executeSlash(slash.id);
      if (result) {
        await waitForSlashStatusSync([
          {
            slashId: slash.id,
            status: 'Executed',
          },
        ]);
      }
    },
    [
      address,
      executableSlashIdSet,
      executeSlash,
      nowUnixSeconds,
      waitForSlashStatusSync,
    ],
  );

  // Registration columns
  const registrationColumns = useMemo(
    () => [
      registrationColumnHelper.accessor('blueprintName', {
        header: () => 'Blueprint',
        cell: (info) => (
          <TableCellWrapper className="py-3 pr-3">
            <Typography variant="body1" fw="semibold">
              {info.getValue()}
            </Typography>
          </TableCellWrapper>
        ),
      }),
      registrationColumnHelper.accessor('preferences.rpcAddress', {
        header: () => 'RPC Endpoint',
        cell: (info) => (
          <TableCellWrapper className="py-3 pr-3">
            <Typography variant="body2" className="font-mono">
              {info.getValue() || '-'}
            </Typography>
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
              className="uppercase body4 bg-red-10 dark:bg-red-120 text-red-70 dark:text-red-40 hover:bg-red-20 dark:hover:bg-red-110 border border-red-30 dark:border-red-100 disabled:!opacity-100 disabled:!text-mono-100 disabled:!border-mono-100/30 disabled:!bg-transparent dark:disabled:!text-mono-100 dark:disabled:!border-mono-120 dark:disabled:!bg-mono-160 disabled:cursor-not-allowed"
              onClick={(event) => {
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
                      className="uppercase body4 bg-blue-10 dark:bg-blue-120 text-blue-70 dark:text-blue-40 hover:bg-blue-20 dark:hover:bg-blue-110 border border-blue-30 dark:border-blue-100"
                      onClick={(event) => {
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

  const getSlashExecutionReadinessText = useCallback(
    (slash: SlashProposal): string => {
      if (executableSlashIdSet.has(slash.id.toString())) {
        return 'Executable (contract confirmed)';
      }

      const eligibility = getSlashExecutionEligibility(slash, nowUnixSeconds);
      if (eligibility.reason === 'DisputeWindowOpen') {
        return `Not executable: dispute window open (${formatTimeRemaining(
          eligibility.secondsUntilExecutable,
        )})`;
      }

      if (eligibility.reason === 'Disputed') {
        return 'Not executable: disputed slash';
      }

      if (eligibility.reason === 'NotPending') {
        return 'Not executable: not pending';
      }

      return 'Not executable yet';
    },
    [executableSlashIdSet, nowUnixSeconds],
  );

  // Slashing columns
  const slashColumns = useMemo(
    () => [
      slashColumnHelper.accessor('id', {
        header: () => 'ID',
        minSize: 100,
        cell: (info) => (
          <TableCellWrapper className="py-3 pr-3">
            <Typography variant="body2">
              #{info.getValue().toString()}
            </Typography>
          </TableCellWrapper>
        ),
      }),
      slashColumnHelper.accessor('serviceId', {
        header: () => 'Service',
        minSize: 120,
        cell: (info) => (
          <TableCellWrapper className="py-3 pr-3">
            <Typography variant="body2">
              #{info.getValue().toString()}
            </Typography>
          </TableCellWrapper>
        ),
      }),
      slashColumnHelper.accessor('slashBps', {
        header: () => 'Slash %',
        minSize: 120,
        cell: (info) => (
          <TableCellWrapper className="py-3 pr-3">
            <Typography variant="body1" fw="semibold" className="text-red-500">
              {formatSlashBps(info.getValue())}
            </Typography>
          </TableCellWrapper>
        ),
      }),
      slashColumnHelper.accessor('effectiveSlashBps', {
        header: () => 'Effective %',
        minSize: 120,
        cell: (info) => (
          <TableCellWrapper className="py-3 pr-3">
            <Typography variant="body1" fw="semibold" className="text-red-500">
              {formatSlashBps(info.getValue())}
            </Typography>
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
                <Typography
                  variant="body2"
                  className="font-mono whitespace-nowrap"
                >
                  {shortenHex(info.getValue())}
                </Typography>
                <CopyWithTooltip
                  textToCopy={info.getValue()}
                  isButton={false}
                  iconSize="md"
                  iconClassName="!fill-mono-160 dark:!fill-mono-80"
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
            <Typography variant="body2">
              {formatDateTime(info.getValue())}
            </Typography>
          </TableCellWrapper>
        ),
      }),
      slashColumnHelper.display({
        id: 'readiness',
        header: () => 'Execution Readiness',
        cell: (info) => {
          const slash = info.row.original;
          const text = getSlashExecutionReadinessText(slash);
          return (
            <TableCellWrapper className="py-3 pr-3">
              <Typography variant="body3">{text}</Typography>
            </TableCellWrapper>
          );
        },
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
          const disputeEligibility = getSlashDisputeEligibility(
            slash,
            nowUnixSeconds,
          );
          const executionEligibility = getSlashExecutionEligibility(
            slash,
            nowUnixSeconds,
          );

          const isExecutable = executableSlashIdSet.has(slash.id.toString());
          const canExecute = permissions.canExecute && isExecutable;
          const executeDisabledReason = !canExecute
            ? permissions.executeReason ?? 'Not executable per on-chain discovery.'
            : null;

          return (
            <TableCellWrapper removeRightBorder className="py-3 pr-3">
              <div className="flex flex-nowrap items-center gap-2 overflow-x-auto whitespace-nowrap pb-1">
                {slash.status === 'Pending' && (
                  <Button
                    variant="utility"
                    size="sm"
                    isDisabled={!permissions.canDispute}
                    className="uppercase body4 bg-blue-10 dark:bg-blue-120 text-blue-70 dark:text-blue-40 hover:bg-blue-20 dark:hover:bg-blue-110 border border-blue-30 dark:border-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedSlash(slash);
                      setDisputeReason('');
                      setShowDisputeModal(true);
                    }}
                  >
                    Dispute
                  </Button>
                )}

                {(slash.status === 'Pending' || slash.status === 'Disputed') && (
                  <Button
                    variant="utility"
                    size="sm"
                    isDisabled={!permissions.canCancel}
                    className="uppercase body4 bg-red-10 dark:bg-red-120 text-red-70 dark:text-red-40 hover:bg-red-20 dark:hover:bg-red-110 border border-red-30 dark:border-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedSlash(slash);
                      setCancelReason('');
                      setShowCancelModal(true);
                    }}
                  >
                    Cancel
                  </Button>
                )}

                {(slash.status === 'Pending' || slash.status === 'Disputed') && (
                  <Button
                    variant="utility"
                    size="sm"
                    isDisabled={!canExecute}
                    className="uppercase body4 bg-green-10 dark:bg-green-120 text-green-70 dark:text-green-40 hover:bg-green-20 dark:hover:bg-green-110 border border-green-30 dark:border-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleExecuteSingle(slash);
                    }}
                  >
                    Execute
                  </Button>
                )}

                <Button
                  variant="utility"
                  size="sm"
                  className="uppercase body4"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedSlash(slash);
                    setShowTimelineModal(true);
                  }}
                >
                  Timeline
                </Button>

                {slash.status === 'Disputed' && (
                  <Button
                    variant="utility"
                    size="sm"
                    className="uppercase body4"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedSlash(slash);
                      setShowDisputeMessageModal(true);
                    }}
                  >
                    View Dispute
                  </Button>
                )}
              </div>

              <div className="mt-1">
                {!permissions.canDispute && slash.status === 'Pending' ? (
                  <Typography variant="body3" className="text-mono-100">
                    {permissions.disputeReason}
                  </Typography>
                ) : null}

                {!permissions.canExecute &&
                (slash.status === 'Pending' || slash.status === 'Disputed') ? (
                  <Typography variant="body3" className="text-mono-100">
                    {executeDisabledReason ??
                      (executionEligibility.reason === 'DisputeWindowOpen'
                        ? `Ready in ${formatTimeRemaining(
                            executionEligibility.secondsUntilExecutable,
                          )}`
                        : null)}
                  </Typography>
                ) : null}

                {permissions.canExecute &&
                !isExecutable &&
                (slash.status === 'Pending' || slash.status === 'Disputed') ? (
                  <Typography variant="body3" className="text-mono-100">
                    Not executable per on-chain discovery.
                  </Typography>
                ) : null}

                {!permissions.canCancel &&
                (slash.status === 'Pending' || slash.status === 'Disputed') ? (
                  <Typography variant="body3" className="text-mono-100">
                    {permissions.cancelReason}
                  </Typography>
                ) : null}

                {slash.status !== 'Pending' && slash.status !== 'Disputed' ? (
                  <Typography variant="body3" className="text-mono-100">
                    {getSlashStatusReason(slash.status, disputeEligibility.reason) ??
                      '-'}
                  </Typography>
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
      getSlashExecutionReadinessText,
      handleExecuteSingle,
      nowUnixSeconds,
    ],
  );

  const registrationTable = useReactTable({
    data: registrations ?? [],
    columns: registrationColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const proposeQueueTable = useReactTable({
    data: proposedByMe,
    columns: slashColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const activeSlashTable = useReactTable({
    data: activeSlashRows,
    columns: slashColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const executableSlashTable = useReactTable({
    data: executableDiscoveryRows,
    columns: slashColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const historySlashTable = useReactTable({
    data: historyRows,
    columns: slashColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (!isConnected) {
    return (
      <div className="p-8">
        <Card className="p-8 text-center">
          <Typography variant="h4" className="mb-4">
            Connect Your Wallet
          </Typography>
          <Typography variant="body1" className="text-mono-100">
            Please connect your wallet to manage operator registrations and
            slashing lifecycle actions.
          </Typography>
          <div className="mt-4 flex justify-center">
            <ConnectWalletButton />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h4">Operator Management</Typography>
        <Typography variant="body1" className="text-mono-100 mt-1">
          Manage registrations and the full slash lifecycle: propose, dispute,
          execute, batch-execute, and cancel.
        </Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <Typography variant="body2" className="text-mono-100">
            Pending Slashes
          </Typography>
          <Typography variant="h4" className="mt-1">
            {pendingSlashProposals.length}
          </Typography>
        </Card>

        <Card className="p-4">
          <Typography variant="body2" className="text-mono-100">
            Disputed Slashes
          </Typography>
          <Typography variant="h4" className="mt-1">
            {disputedSlashProposals.length}
          </Typography>
        </Card>

        <Card className="p-4">
          <Typography variant="body2" className="text-mono-100">
            Executable Now
          </Typography>
          <Typography variant="h4" className="mt-1">
            {executableSlashIdSet.size}
          </Typography>
        </Card>

        <Card className="p-4">
          <Typography variant="body2" className="text-mono-100">
            Active Registrations
          </Typography>
          <Typography variant="h4" className="mt-1">
            {registrations?.filter((registration) => registration.active).length ??
              0}
          </Typography>
        </Card>
      </div>

      {nearestPendingSlash && nearestPendingSlashEligibility ? (
        <Card className="p-4 !border-yellow-400/30 !bg-yellow-500/15">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <Typography variant="body2" fw="bold" className="text-yellow-400">
              Nearest Dispute Deadline
            </Typography>
          </div>
          <Typography variant="h5" fw="bold" className="text-mono-0">
            Slash #{nearestPendingSlash.id.toString()}{' '}
            <span className="font-normal text-mono-100">expires at</span>{' '}
            {formatDateTime(nearestPendingSlash.executeAfter)}
          </Typography>
          <Typography
            variant="body2"
            fw="semibold"
            className="text-yellow-300/80 mt-1.5"
          >
            Time remaining:{' '}
            {formatTimeRemaining(
              nearestPendingSlashEligibility.secondsUntilDeadline,
            )}
          </Typography>
        </Card>
      ) : null}

      {isActiveServicePrecheckUnavailable ? (
        <Card className="p-4 border border-yellow-500/20 bg-yellow-500/10">
          <Typography variant="body2" className="text-mono-100">
            Active service precheck is unavailable. Unregister actions are
            temporarily disabled until indexer/service data can be fetched.
          </Typography>
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
        }}
      />

      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Typography variant="h5" fw="bold">
            Slashing Management
          </Typography>
          <Button
            variant="secondary"
            onClick={() => setShowProposeModal(true)}
          >
            New Proposal
          </Button>
         </div>

        <TableAndChartTabs
          tabs={SLASHING_TABS}
          icons={SLASHING_TAB_ICONS}
          value={selectedSlashingTab}
          onValueChange={(tab) => setSelectedSlashingTab(tab as SlashingTab)}
          className="space-y-5"
          enableAdvancedDivider
        >
          <TabContent value={SlashingTab.PROPOSE}>
            <TangleCloudTable
              title="Proposals Created By You"
              hideTitle
              data={proposedByMe}
              isLoading={loadingSlash}
              error={slashError}
              onRetry={() => void refetchSlashProposals()}
              tableProps={proposeQueueTable}
              tableConfig={{
                tdClassName: '!p-3 max-w-none whitespace-nowrap',
                thClassName: 'whitespace-nowrap',
              }}
              loadingTableProps={{
                title: 'Loading proposals...',
                description: 'Fetching slash proposals you proposed.',
                icon: '🔄',
              }}
              emptyTableProps={{
                title: 'No Proposals Yet',
                description:
                  'You have not proposed any slash in the current index scope.',
                icon: '🧾',
              }}
            />
          </TabContent>

          <TabContent value={SlashingTab.ACTIVE}>
            <TangleCloudTable
              title="Active Slash Proposals"
              hideTitle
              data={activeSlashRows}
              isLoading={loadingSlash}
              error={slashError}
              onRetry={() => void refetchSlashProposals()}
              tableProps={activeSlashTable}
              tableConfig={{
                tdClassName: '!p-3 max-w-none whitespace-nowrap',
                thClassName: 'whitespace-nowrap',
              }}
              loadingTableProps={{
                title: 'Loading active proposals...',
                description: 'Fetching pending and disputed slash proposals.',
                icon: '🔄',
              }}
              emptyTableProps={{
                title: 'No Active Proposals',
                description:
                  'There are no pending or disputed slash proposals currently.',
                icon: '✅',
              }}
            />
          </TabContent>

          <TabContent value={SlashingTab.EXECUTABLE}>
            <TangleCloudTable
              title="Executable Discovery"
              hideTitle
              data={executableDiscoveryRows}
              isLoading={loadingSlash}
              error={slashError}
              onRetry={() => void refetchSlashProposals()}
              tableProps={executableSlashTable}
              tableConfig={{
                tdClassName: '!p-3 max-w-none whitespace-nowrap',
                thClassName: 'whitespace-nowrap',
              }}
              loadingTableProps={{
                title: 'Scanning executable slashes...',
                description:
                  'Discovering executable slash IDs and reasons for non-executable proposals.',
                icon: '🔄',
              }}
              emptyTableProps={{
                title: 'No Pending/Disputed Proposals',
                description:
                  'There are no proposals to evaluate for execution at this time.',
                icon: '🔍',
              }}
            />
          </TabContent>

          <TabContent value={SlashingTab.HISTORY}>
            <TangleCloudTable
              title="Slash History"
              hideTitle
              data={historyRows}
              isLoading={loadingSlash}
              error={slashError}
              onRetry={() => void refetchSlashProposals()}
              tableProps={historySlashTable}
              tableConfig={{
                tdClassName: '!p-3 max-w-none whitespace-nowrap',
                thClassName: 'whitespace-nowrap',
              }}
              loadingTableProps={{
                title: 'Loading slash history...',
                description: 'Fetching executed and cancelled slash proposals.',
                icon: '🔄',
              }}
              emptyTableProps={{
                title: 'No History Yet',
                description:
                  'No executed or cancelled slash proposals are available yet.',
                icon: '📚',
              }}
            />
          </TabContent>
        </TableAndChartTabs>
      </Card>

      {/* Unregister Modal */}
      <Modal open={showUnregisterModal} onOpenChange={setShowUnregisterModal}>
        <ModalContent>
          <ModalHeader>Unregister from Blueprint</ModalHeader>
          <ModalBody>
            <Typography variant="body1">
              Are you sure you want to unregister from{' '}
              <strong>{selectedRegistration?.blueprintName}</strong>?
            </Typography>
            <Typography variant="body2" className="text-mono-100 mt-2">
              This action removes your operator registration from this blueprint
              after chain checks pass.
            </Typography>
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
            <Typography variant="body1" className="mb-4">
              Update your preferences for{' '}
              <strong>{selectedRegistration?.blueprintName}</strong>
            </Typography>
            <div className="space-y-4">
              <div>
                <Typography variant="body2" className="mb-1">
                  RPC Endpoint{' '}
                  <span className="text-red-70 dark:text-red-50">*</span>
                </Typography>
                <Input
                  id="rpcAddress"
                  isControlled
                  value={newRpcAddress}
                  onChange={(value) => setNewRpcAddress(value)}
                  placeholder="https://your-node.example.com"
                />
                {rpcAddressError ? (
                  <Typography
                    variant="body3"
                    className="mt-1 !text-red-70 dark:!text-red-50"
                  >
                    {rpcAddressError}
                  </Typography>
                ) : null}
              </div>
              <div>
                <Typography variant="body2" className="mb-1">
                  ECDSA Public Key (Optional Rotation)
                </Typography>
                <Input
                  id="ecdsaPublicKey"
                  isControlled
                  value={newEcdsaPublicKey}
                  onChange={(value) => setNewEcdsaPublicKey(value)}
                  placeholder="0x... (65-byte uncompressed key)"
                />
                <Typography variant="body3" className="text-mono-100 mt-1">
                  Leave empty to keep your current key.
                </Typography>
                {ecdsaPublicKeyError ? (
                  <Typography
                    variant="body3"
                    className="mt-1 !text-red-70 dark:!text-red-50"
                  >
                    {ecdsaPublicKeyError}
                  </Typography>
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

      {/* Propose Slash Modal */}
      <Modal open={showProposeModal} onOpenChange={setShowProposeModal}>
        <ModalContent>
          <ModalHeader>Create Slash Proposal</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {loadingProposableServices ? (
                <Typography variant="body2" className="text-mono-100">
                  Loading eligible services...
                </Typography>
              ) : null}

              {!loadingProposableServices && (proposableServices?.length ?? 0) === 0 ? (
                <Typography variant="body2" className="text-mono-100">
                  No active services where your account appears as service or
                  blueprint owner.
                </Typography>
              ) : null}

              {(proposableServices?.length ?? 0) > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Typography variant="body3" className="mb-1">
                      Service
                    </Typography>
                    <select
                      className="w-full rounded-lg border border-mono-60 dark:border-mono-140 px-3 py-2 bg-mono-0 dark:bg-mono-180"
                      value={proposeServiceId}
                      onChange={(event) => setProposeServiceId(event.target.value)}
                    >
                      <option value="">Select service</option>
                      {proposableServiceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Typography variant="body3" className="mb-1">
                      Operator
                    </Typography>
                    {selectedProposableService &&
                    selectedProposableService.operatorCandidates.length > 0 ? (
                      <select
                        className="w-full rounded-lg border border-mono-60 dark:border-mono-140 px-3 py-2 bg-mono-0 dark:bg-mono-180"
                        value={proposeOperator}
                        onChange={(event) => setProposeOperator(event.target.value)}
                      >
                        <option value="">Select operator</option>
                        {selectedProposableService.operatorCandidates.map(
                          (operatorAddress) => (
                            <option key={operatorAddress} value={operatorAddress}>
                              {operatorAddress}
                            </option>
                          ),
                        )}
                      </select>
                    ) : (
                      <Input
                        id="propose-operator"
                        isControlled
                        value={proposeOperator}
                        onChange={(value) => setProposeOperator(value)}
                        placeholder="0x..."
                      />
                    )}
                  </div>

                  <div>
                    <Typography variant="body3" className="mb-1">
                      Slash BPS (1 - 10000)
                    </Typography>
                    <Input
                      id="propose-slash-bps"
                      isControlled
                      value={proposeSlashBps}
                      onChange={(value) => setProposeSlashBps(value)}
                      placeholder="e.g. 500 (5%)"
                    />
                  </div>

                  <div>
                    <Typography variant="body3" className="mb-1">
                      Evidence (text or bytes32 hex)
                    </Typography>
                    <Input
                      id="propose-evidence"
                      isControlled
                      value={proposeEvidence}
                      onChange={(value) => setProposeEvidence(value)}
                      placeholder="ipfs://... or 0x..."
                    />
                  </div>
                </div>
              ) : null}

              {proposeValidationError ? (
                <Typography variant="body3" className="!text-red-60">
                  {proposeValidationError}
                </Typography>
              ) : null}
            </div>
          </ModalBody>
          <ModalFooterActions
            hasCloseButton
            isConfirmDisabled={!canSubmitPropose}
            isProcessing={proposeStatus === 'pending'}
            confirmButtonText="Submit Proposal"
            onConfirm={handleProposeSlash}
          />
        </ModalContent>
      </Modal>

      {/* Dispute Reason Modal */}
      <Modal
        open={showDisputeMessageModal}
        onOpenChange={setShowDisputeMessageModal}
      >
        <ModalContent>
          <ModalHeader>Dispute Reason</ModalHeader>
          <ModalBody>
            <Typography variant="body1" className="mb-2">
              Slash proposal #{selectedSlash?.id.toString()}
            </Typography>
            <Typography variant="body2" className="text-mono-100 mb-2">
              Submitted dispute reason:
            </Typography>
            <div className="rounded-lg border border-mono-40 dark:border-mono-140 p-3 bg-mono-20 dark:bg-mono-170">
              <Typography
                variant="body2"
                className="whitespace-pre-wrap break-words"
              >
                {selectedSlash
                  ? (getSlashDisputeMessage(selectedSlash) ??
                    'No dispute reason available for this proposal yet.')
                  : '-'}
              </Typography>
            </div>
          </ModalBody>
          <ModalFooterActions
            confirmButtonText="Close"
            onConfirm={() => setShowDisputeMessageModal(false)}
          />
        </ModalContent>
      </Modal>

      {/* Dispute Slash Modal */}
      <Modal open={showDisputeModal} onOpenChange={setShowDisputeModal}>
        <ModalContent>
          <ModalHeader>Dispute Slash Proposal</ModalHeader>
          <ModalBody>
            <Typography variant="body1" className="mb-2">
              Dispute slash proposal #{selectedSlash?.id.toString()}
            </Typography>
            <div className="p-3 bg-mono-20 dark:bg-mono-170 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                <Typography variant="body3" className="text-mono-100">
                  Slash %:
                </Typography>
                <Typography variant="body3" className="text-red-500">
                  {selectedSlash ? formatSlashBps(selectedSlash.slashBps) : '-'}
                </Typography>
                <Typography variant="body3" className="text-mono-100">
                  Effective Slash %:
                </Typography>
                <Typography variant="body3" className="text-red-500">
                  {selectedSlash
                    ? formatSlashBps(selectedSlash.effectiveSlashBps)
                    : '-'}
                </Typography>
                <Typography variant="body3" className="text-mono-100">
                  Dispute Deadline:
                </Typography>
                <Typography variant="body3">
                  {selectedSlash
                    ? formatDateTime(selectedSlash.executeAfter)
                    : '-'}
                </Typography>
                <Typography variant="body3" className="text-mono-100">
                  Time Remaining:
                </Typography>
                <Typography variant="body3">
                  {selectedSlashEligibility
                    ? formatTimeRemaining(
                        selectedSlashEligibility.secondsUntilDeadline,
                      )
                    : '-'}
                </Typography>
                <Typography variant="body3" className="text-mono-100">
                  Proposer:
                </Typography>
                <Typography variant="body3" className="font-mono">
                  {selectedSlash ? shortenHex(selectedSlash.proposer) : '-'}
                </Typography>
                <Typography variant="body3" className="text-mono-100">
                  Proposer Role:
                </Typography>
                <Typography variant="body3">
                  {selectedSlash
                    ? getSlashProposerRoleLabel(selectedSlash.proposerRole)
                    : '-'}
                </Typography>
                <Typography variant="body3" className="text-mono-100">
                  Claim Context:
                </Typography>
                <Typography
                  variant="body3"
                  title={
                    selectedSlash ? getSlashClaimContext(selectedSlash) : '-'
                  }
                >
                  {selectedSlash ? getSlashClaimContext(selectedSlash) : '-'}
                </Typography>
                <Typography variant="body3" className="text-mono-100">
                  Evidence Hash:
                </Typography>
                <Typography variant="body3" className="font-mono break-all">
                  {selectedSlash?.evidence ?? '-'}
                </Typography>
              </div>
            </div>
            <div>
              <Typography variant="body2" className="mb-1">
                Reason for Dispute
              </Typography>
              <textarea
                className="w-full p-3 rounded-lg border border-mono-40 dark:border-mono-140 bg-mono-0 dark:bg-mono-180 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={4}
                value={disputeReason}
                onChange={(event) => setDisputeReason(event.target.value)}
                placeholder="Explain why this slash proposal is invalid..."
              />
              <Typography variant="body3" className="text-mono-100 mt-1">
                Minimum {MIN_DISPUTE_REASON_LENGTH} characters (
                {trimmedDisputeReason.length}/{MIN_DISPUTE_REASON_LENGTH}).
              </Typography>
              {!selectedSlashPermissions?.canDispute ? (
                <Typography variant="body3" className="text-red-500 mt-1">
                  {selectedSlashPermissions?.disputeReason ??
                    'Dispute is not available for this slash.'}
                </Typography>
              ) : null}
            </div>
          </ModalBody>
          <ModalFooterActions
            hasCloseButton
            isConfirmDisabled={disputeStatus === 'pending' || !canSubmitDispute}
            isProcessing={disputeStatus === 'pending'}
            confirmButtonText="Submit Dispute"
            onConfirm={handleDispute}
          />
        </ModalContent>
      </Modal>

      {/* Cancel Slash Modal */}
      <Modal open={showCancelModal} onOpenChange={setShowCancelModal}>
        <ModalContent>
          <ModalHeader>Cancel Slash Proposal</ModalHeader>
          <ModalBody>
            <Typography variant="body1" className="mb-2">
              Cancel slash proposal #{selectedSlash?.id.toString()}
            </Typography>
            <Typography variant="body2" className="text-mono-100 mb-2">
              Admin-only action. Authorization is validated on-chain at
              submission time.
            </Typography>
            <div>
              <Typography variant="body2" className="mb-1">
                Reason for cancellation
              </Typography>
              <textarea
                className="w-full p-3 rounded-lg border border-mono-40 dark:border-mono-140 bg-mono-0 dark:bg-mono-180 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={4}
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Provide cancellation reason..."
              />
              <Typography variant="body3" className="text-mono-100 mt-1">
                Minimum {MIN_CANCEL_REASON_LENGTH} characters (
                {trimmedCancelReason.length}/{MIN_CANCEL_REASON_LENGTH}).
              </Typography>
              {!selectedSlashPermissions?.canCancel ? (
                <Typography variant="body3" className="text-red-500 mt-1">
                  {selectedSlashPermissions?.cancelReason ??
                    'Cancellation is not available for this slash.'}
                </Typography>
              ) : null}
            </div>
          </ModalBody>
          <ModalFooterActions
            hasCloseButton
            isConfirmDisabled={cancelStatus === 'pending' || !canSubmitCancel}
            isProcessing={cancelStatus === 'pending'}
            confirmButtonText="Cancel Slash"
            onConfirm={handleCancel}
          />
        </ModalContent>
      </Modal>

      {/* Timeline Modal */}
      <Modal open={showTimelineModal} onOpenChange={setShowTimelineModal}>
        <ModalContent>
          <ModalHeader>Slash Timeline</ModalHeader>
          <ModalBody>
            <Typography variant="body1" className="mb-3">
              Slash proposal #{selectedSlash?.id.toString()}
            </Typography>
            <div className="space-y-3">
              {selectedSlashTimeline.map((stage) => {
                const colorByState: Record<
                  typeof stage.state,
                  'green' | 'blue' | 'yellow' | 'dark-grey' | 'red'
                > = {
                  done: 'green',
                  current: 'blue',
                  upcoming: 'yellow',
                  skipped: 'dark-grey',
                };

                return (
                  <div
                    key={stage.key}
                    className="flex items-start gap-3 rounded-lg border border-mono-40 dark:border-mono-140 p-3"
                  >
                    <Chip color={colorByState[stage.state]}>
                      {stage.state.toUpperCase()}
                    </Chip>
                    <div className="space-y-1">
                      <Typography variant="body2" fw="bold">
                        {stage.label}
                      </Typography>
                      <Typography variant="body3" className="text-mono-100">
                        {stage.description}
                      </Typography>
                      <Typography variant="body3" className="text-mono-120">
                        {stage.timestamp !== null
                          ? formatDateTime(stage.timestamp)
                          : 'Timestamp unavailable'}
                      </Typography>
                    </div>
                  </div>
                );
              })}
            </div>
          </ModalBody>
          <ModalFooterActions
            confirmButtonText="Close"
            onConfirm={() => setShowTimelineModal(false)}
          />
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Page;
