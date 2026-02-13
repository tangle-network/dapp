/**
 * Operator management page - view and manage blueprint registrations and slashing.
 */

import { FC, useState, useMemo, useCallback, useEffect } from 'react';
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
} from '@tangle-network/ui-components';
import { useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import {
  useOperatorRegistrations,
  useUnregisterOperatorTx,
  useUpdateOperatorPreferencesTx,
  useServicesByOperator,
  useSlashProposals,
  useDisputeSlashTx,
  getSlashDisputeEligibility,
  formatSlashBps,
  type OperatorRegistration,
  type SlashStatus,
  type SlashProposal,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { shortenHex } from '@tangle-network/ui-components/utils/shortenHex';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { TangleCloudTable } from '../../../components/tangleCloudTable/TangleCloudTable';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import ConnectWalletButton from '@tangle-network/tangle-shared-ui/components/ConnectWalletButton';

const registrationColumnHelper = createColumnHelper<OperatorRegistration>();
const slashColumnHelper = createColumnHelper<SlashProposal>();

interface RegistrationActionState {
  canUpdate: boolean;
  canUnregister: boolean;
  disableReason: string | null;
}

const MIN_DISPUTE_REASON_LENGTH = 20;
const ECDSA_PUBLIC_KEY_HEX_LENGTH = 132; // 65-byte key => "0x" + 130 hex chars

const getRegistrationActionState = (
  registration: OperatorRegistration,
  options?: {
    activeServiceCount?: number | null;
    isActiveServicePrecheckUnavailable?: boolean;
  },
): RegistrationActionState => {
  const activeServiceCount = options?.activeServiceCount ?? 0;
  const isActiveServicePrecheckUnavailable =
    options?.isActiveServicePrecheckUnavailable ?? false;

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

  if (activeServiceCount > 0) {
    return {
      canUpdate: true,
      canUnregister: false,
      disableReason: `Blocked: ${activeServiceCount} Active Service${
        activeServiceCount > 1 ? 's' : ''
      }`,
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

const formatTimeRemaining = (secondsUntilDeadline: number): string => {
  if (secondsUntilDeadline <= 0) {
    return 'Expired';
  }

  const days = Math.floor(secondsUntilDeadline / 86_400);
  const hours = Math.floor((secondsUntilDeadline % 86_400) / 3_600);
  const minutes = Math.floor((secondsUntilDeadline % 3_600) / 60);
  const seconds = secondsUntilDeadline % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
};

const getSlashStatusReason = (
  status: SlashStatus,
  deadlineReason: 'NotPending' | 'DeadlinePassed' | null,
): string | null => {
  if (status === 'Pending' && deadlineReason === 'DeadlinePassed') {
    return 'Dispute window closed';
  }

  if (status === 'Disputed') {
    return 'Under review';
  }
  if (status === 'Executed') {
    return 'Already executed';
  }
  if (status === 'Cancelled') {
    return 'Cancelled';
  }

  return null;
};

const isValidEcdsaPublicKey = (value: string): boolean =>
  /^0x[0-9a-fA-F]+$/.test(value) && value.length === ECDSA_PUBLIC_KEY_HEX_LENGTH;

const Page: FC = () => {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const [nowUnixSeconds, setNowUnixSeconds] = useState(() =>
    Math.floor(Date.now() / 1000),
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowUnixSeconds(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  // Data hooks
  const {
    data: registrations,
    isLoading: loadingRegistrations,
    error: registrationsError,
    refetch: refetchRegistrations,
  } = useOperatorRegistrations();
  const {
    data: slashProposals,
    isLoading: loadingSlash,
    error: slashError,
    refetch: refetchSlashProposals,
  } = useSlashProposals();
  const {
    data: activeServices,
    error: activeServicesError,
    refetch: refetchActiveServices,
  } = useServicesByOperator(address, {
    enabled: isConnected,
    status: 'ACTIVE',
  });

  // Transaction hooks
  const { unregisterOperator, status: unregisterStatus } =
    useUnregisterOperatorTx();
  const { updatePreferences, status: updateStatus } =
    useUpdateOperatorPreferencesTx();
  const { disputeSlash, status: disputeStatus } = useDisputeSlashTx();

  // Modal state
  const [selectedRegistration, setSelectedRegistration] =
    useState<OperatorRegistration | null>(null);
  const [selectedSlash, setSelectedSlash] = useState<SlashProposal | null>(
    null,
  );
  const [showUnregisterModal, setShowUnregisterModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  // Form state
  const [newRpcAddress, setNewRpcAddress] = useState('');
  const [newEcdsaPublicKey, setNewEcdsaPublicKey] = useState('');
  const [disputeReason, setDisputeReason] = useState('');

  const trimmedDisputeReason = disputeReason.trim();
  const trimmedEcdsaPublicKey = newEcdsaPublicKey.trim();

  const resolvedRpcAddress = useMemo(() => {
    if (!selectedRegistration) {
      return '';
    }

    const trimmedRpcAddress = newRpcAddress.trim();
    return trimmedRpcAddress.length > 0
      ? trimmedRpcAddress
      : selectedRegistration.preferences.rpcAddress.trim();
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
  }, [
    resolvedEcdsaPublicKey,
    selectedRegistration,
    trimmedEcdsaPublicKey,
  ]);

  const activeServiceCountByBlueprint = useMemo(() => {
    const counts = new Map<string, number>();

    for (const service of activeServices ?? []) {
      const blueprintId = service.blueprintId.toString();
      counts.set(blueprintId, (counts.get(blueprintId) ?? 0) + 1);
    }

    return counts;
  }, [activeServices]);
  const isActiveServicePrecheckUnavailable = Boolean(activeServicesError);

  const selectedSlashEligibility = useMemo(() => {
    if (!selectedSlash) {
      return null;
    }
    return getSlashDisputeEligibility(selectedSlash, nowUnixSeconds);
  }, [selectedSlash, nowUnixSeconds]);

  const isDisputeReasonValid =
    trimmedDisputeReason.length >= MIN_DISPUTE_REASON_LENGTH;
  const canSubmitDispute =
    !!selectedSlashEligibility?.isEligible && isDisputeReasonValid;

  const pendingSlashProposals = useMemo(
    () => (slashProposals ?? []).filter((slash) => slash.status === 'Pending'),
    [slashProposals],
  );

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

  const isNoopUpdate = useMemo(() => {
    if (!selectedRegistration) {
      return true;
    }

    const currentRpcAddress = selectedRegistration.preferences.rpcAddress.trim();
    const currentEcdsaKey =
      selectedRegistration.preferences.ecdsaPublicKey.toLowerCase();

    const rpcUnchanged = resolvedRpcAddress === currentRpcAddress;
    const keyUnchanged =
      trimmedEcdsaPublicKey.length === 0 ||
      trimmedEcdsaPublicKey.toLowerCase() === currentEcdsaKey;

    return rpcUnchanged && keyUnchanged;
  }, [resolvedRpcAddress, selectedRegistration, trimmedEcdsaPublicKey]);

  const handleUnregister = useCallback(async () => {
    if (!selectedRegistration) return;
    const result = await unregisterOperator(selectedRegistration.blueprintId);
    if (result) {
      setShowUnregisterModal(false);
      setSelectedRegistration(null);
      queryClient.invalidateQueries({
        queryKey: ['operator', 'registrations'],
      });
    }
  }, [selectedRegistration, unregisterOperator, queryClient]);

  const handleUpdatePreferences = useCallback(async () => {
    if (
      !selectedRegistration ||
      ecdsaPublicKeyError ||
      !resolvedEcdsaPublicKey
    )
      return;

    const result = await updatePreferences(selectedRegistration.blueprintId, {
      ecdsaPublicKey: resolvedEcdsaPublicKey as `0x${string}`,
      rpcAddress: resolvedRpcAddress,
    });
    if (result) {
      setShowUpdateModal(false);
      setSelectedRegistration(null);
      setNewRpcAddress('');
      setNewEcdsaPublicKey('');
      queryClient.invalidateQueries({
        queryKey: ['operator', 'registrations'],
      });
    }
  }, [
    ecdsaPublicKeyError,
    queryClient,
    resolvedEcdsaPublicKey,
    resolvedRpcAddress,
    selectedRegistration,
    updatePreferences,
  ]);

  const handleDispute = useCallback(async () => {
    if (!selectedSlash || !canSubmitDispute) return;
    const result = await disputeSlash(selectedSlash.id, trimmedDisputeReason);
    if (result) {
      setShowDisputeModal(false);
      setSelectedSlash(null);
      setDisputeReason('');
      queryClient.invalidateQueries({ queryKey: ['slashing', 'proposals'] });
    }
  }, [
    canSubmitDispute,
    selectedSlash,
    trimmedDisputeReason,
    disputeSlash,
    queryClient,
  ]);

  // Registration columns
  const registrationColumns = useMemo(
    () => [
      registrationColumnHelper.accessor('blueprintName', {
        header: () => 'Blueprint',
        cell: (info) => (
          <TableCellWrapper className="p-3">
            <Typography variant="body1" fw="semibold">
              {info.getValue()}
            </Typography>
            <Typography variant="body3" className="text-mono-100">
              ID: #{info.row.original.blueprintId.toString()}
            </Typography>
          </TableCellWrapper>
        ),
      }),
      registrationColumnHelper.accessor('preferences.rpcAddress', {
        header: () => 'RPC Endpoint',
        cell: (info) => (
          <TableCellWrapper className="p-3">
            <Typography variant="body2" className="font-mono">
              {info.getValue() || '-'}
            </Typography>
          </TableCellWrapper>
        ),
      }),
      registrationColumnHelper.accessor('active', {
        header: () => 'Status',
        cell: (info) => (
          <TableCellWrapper className="p-3">
            <Chip color={info.getValue() ? 'green' : 'yellow'}>
              {info.getValue() ? 'Active' : 'Inactive'}
            </Chip>
          </TableCellWrapper>
        ),
      }),
      registrationColumnHelper.display({
        id: 'actions',
        header: () => '',
        cell: (info) => {
          const activeServiceCount =
            activeServiceCountByBlueprint.get(
              info.row.original.blueprintId.toString(),
            ) ?? 0;
          const actionState = getRegistrationActionState(info.row.original, {
            activeServiceCount,
            isActiveServicePrecheckUnavailable,
          });
          const reasonColor = actionState.disableReason?.startsWith('Blocked')
            ? 'yellow'
            : 'dark-grey';
          const canShowActions =
            actionState.canUpdate || actionState.canUnregister;

          return (
            <TableCellWrapper removeRightBorder className="p-3">
              {canShowActions ? (
                <div className="flex gap-2">
                  {actionState.canUpdate ? (
                    <Button
                      variant="utility"
                      size="sm"
                      className="uppercase body4 bg-blue-10 dark:bg-blue-120 text-blue-70 dark:text-blue-40 hover:bg-blue-20 dark:hover:bg-blue-110 border border-blue-30 dark:border-blue-100"
                      onClick={(e) => {
                        e.stopPropagation();
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
                  <Button
                    variant="utility"
                    size="sm"
                    isDisabled={!actionState.canUnregister}
                    className="uppercase body4 bg-red-10 dark:bg-red-120 text-red-70 dark:text-red-40 hover:bg-red-20 dark:hover:bg-red-110 border border-red-30 dark:border-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRegistration(info.row.original);
                      setShowUnregisterModal(true);
                    }}
                  >
                    Unregister
                  </Button>
                </div>
              ) : null}
              {actionState.disableReason && (
                <div className="mt-2">
                  <Chip color={reasonColor}>{actionState.disableReason}</Chip>
                </div>
              )}
            </TableCellWrapper>
          );
        },
      }),
    ],
    [activeServiceCountByBlueprint, isActiveServicePrecheckUnavailable],
  );

  // Slash columns
  const slashColumns = useMemo(
    () => [
      slashColumnHelper.accessor('id', {
        header: () => 'ID',
        cell: (info) => (
          <TableCellWrapper className="p-3">
            <Typography variant="body2">
              #{info.getValue().toString()}
            </Typography>
          </TableCellWrapper>
        ),
      }),
      slashColumnHelper.accessor('serviceId', {
        header: () => 'Service',
        cell: (info) => (
          <TableCellWrapper className="p-3">
            <Typography variant="body2">
              #{info.getValue().toString()}
            </Typography>
          </TableCellWrapper>
        ),
      }),
      slashColumnHelper.accessor('slashBps', {
        header: () => 'Slash %',
        cell: (info) => (
          <TableCellWrapper className="p-3">
            <Typography variant="body1" fw="semibold" className="text-red-500">
              {formatSlashBps(info.getValue())}
            </Typography>
          </TableCellWrapper>
        ),
      }),
      slashColumnHelper.accessor('effectiveSlashBps', {
        header: () => 'Effective Slash %',
        cell: (info) => (
          <TableCellWrapper className="p-3">
            <Typography variant="body1" fw="semibold" className="text-red-500">
              {formatSlashBps(info.getValue())}
            </Typography>
          </TableCellWrapper>
        ),
      }),
      slashColumnHelper.accessor('evidence', {
        header: () => 'Evidence',
        cell: (info) => (
          <TableCellWrapper className="p-3">
            <Typography variant="body2" className="font-mono">
              {shortenHex(info.getValue())}
            </Typography>
          </TableCellWrapper>
        ),
      }),
      slashColumnHelper.accessor('proposer', {
        header: () => 'Proposer',
        cell: (info) => (
          <TableCellWrapper className="p-3">
            <Typography variant="body2" className="font-mono">
              {shortenHex(info.getValue())}
            </Typography>
          </TableCellWrapper>
        ),
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
            <TableCellWrapper className="p-3">
              <Chip color={colorMap[status]}>{status}</Chip>
            </TableCellWrapper>
          );
        },
      }),
      slashColumnHelper.accessor('executeAfter', {
        header: () => 'Execute After',
        cell: (info) => {
          return (
            <TableCellWrapper className="p-3">
              <Typography variant="body2">{formatDateTime(info.getValue())}</Typography>
            </TableCellWrapper>
          );
        },
      }),
      slashColumnHelper.display({
        id: 'actions',
        header: () => '',
        cell: (info) => {
          const slash = info.row.original;
          const eligibility = getSlashDisputeEligibility(slash, nowUnixSeconds);
          const showDisputeButton = slash.status === 'Pending';
          const reasonText = getSlashStatusReason(slash.status, eligibility.reason);

          return (
            <TableCellWrapper removeRightBorder className="p-3">
              {showDisputeButton ? (
                <>
                  <Button
                    variant="utility"
                    size="sm"
                    isDisabled={!eligibility.isEligible}
                    className="uppercase body4 bg-yellow-10 dark:bg-yellow-120 text-yellow-70 dark:text-yellow-40 hover:bg-yellow-20 dark:hover:bg-yellow-110 border border-yellow-30 dark:border-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSlash(slash);
                      setDisputeReason('');
                      setShowDisputeModal(true);
                    }}
                  >
                    Dispute
                  </Button>
                  {!eligibility.isEligible && reasonText && (
                    <Typography variant="body3" className="text-mono-100 mt-1">
                      {reasonText}
                    </Typography>
                  )}
                </>
              ) : (
                <Typography variant="body3" className="text-mono-100">
                  {reasonText ?? '-'}
                </Typography>
              )}
            </TableCellWrapper>
          );
        },
      }),
    ],
    [nowUnixSeconds],
  );

  // Tables
  const registrationTable = useReactTable({
    data: registrations ?? [],
    columns: registrationColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const slashTable = useReactTable({
    data: slashProposals ?? [],
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
            Please connect your wallet to view your operator registrations.
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
      {/* Header */}
      <div>
        <Typography variant="h4">Operator Management</Typography>
        <Typography variant="body1" className="text-mono-100 mt-1">
          Manage your blueprint registrations, update preferences, and handle
          slashing disputes.
        </Typography>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <Typography variant="body2" className="text-mono-100">
            Active Registrations
          </Typography>
          <Typography variant="h4" className="mt-1">
            {registrations?.filter((r) => r.active).length ?? 0}
          </Typography>
        </Card>
        <Card className="p-4">
          <Typography variant="body2" className="text-mono-100">
            Registrations (All-Time)
          </Typography>
          <Typography variant="h4" className="mt-1">
            {registrations?.length ?? 0}
          </Typography>
        </Card>
        <Card className="p-4">
          <Typography variant="body2" className="text-mono-100">
            Pending Slashes
          </Typography>
          <Typography
            variant="h4"
            className={`mt-1 ${(slashProposals?.filter((s) => s.status === 'Pending').length ?? 0) > 0 ? 'text-red-500' : ''}`}
          >
            {pendingSlashProposals.length}
          </Typography>
        </Card>
      </div>

      {nearestPendingSlash && nearestPendingSlashEligibility ? (
        <Card className="p-4 border border-yellow-40 dark:border-yellow-110 bg-yellow-10 dark:bg-yellow-170">
          <Typography variant="body2" className="text-mono-100">
            Nearest Dispute Deadline
          </Typography>
          <Typography variant="body1" fw="semibold" className="mt-1">
            Slash #{nearestPendingSlash.id.toString()} expires at{' '}
            {formatDateTime(nearestPendingSlash.executeAfter)}
          </Typography>
          <Typography variant="body2" className="text-mono-100 mt-1">
            Time remaining:{' '}
            {formatTimeRemaining(
              nearestPendingSlashEligibility.secondsUntilDeadline,
            )}
          </Typography>
        </Card>
      ) : null}

      {isActiveServicePrecheckUnavailable ? (
        <Card className="p-4 border border-yellow-40 dark:border-yellow-110 bg-yellow-10 dark:bg-yellow-170">
          <Typography variant="body2" className="text-mono-100">
            Active service precheck is unavailable. Unregister actions are
            temporarily disabled until indexer/service data can be fetched.
          </Typography>
          <div className="mt-3">
            <Button variant="secondary" size="sm" onClick={() => void refetchActiveServices()}>
              Retry Precheck
            </Button>
          </div>
        </Card>
      ) : null}

      {/* Registrations Table */}
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

      {/* Slashing Table */}
      <TangleCloudTable
        title="Slashing Proposals"
        data={slashProposals ?? []}
        isLoading={loadingSlash}
        error={slashError}
        onRetry={() => void refetchSlashProposals()}
        tableProps={slashTable}
        loadingTableProps={{
          title: 'Loading slash proposals...',
          description: 'Please wait while we fetch slashing proposals.',
          icon: '🔄',
        }}
        errorTableProps={{
          title: 'Failed to load slash proposals',
          description:
            'Indexer or network request failed while loading slashing proposals.',
          icon: '⚠️',
        }}
        emptyTableProps={{
          title: 'No Slash Proposals',
          description: 'No slashing proposals against your operator account.',
          icon: '✅',
        }}
      />

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
              This action removes your operator registration from this
              blueprint after chain checks pass.
            </Typography>
            <div className="mt-3 p-3 rounded-lg border border-yellow-40 dark:border-yellow-110 bg-yellow-10 dark:bg-yellow-170">
              <Typography variant="body2" className="text-yellow-800 dark:text-yellow-30">
                Unregister fails if active services &gt; 0.
              </Typography>
              {isActiveServicePrecheckUnavailable ? (
                <Typography variant="body3" className="text-red-500 mt-1">
                  Active-service precheck is currently unavailable. Retry
                  precheck before confirming unregister.
                </Typography>
              ) : (
                <Typography variant="body3" className="text-mono-110 mt-1">
                  Precheck: terminate all active services for this blueprint,
                  then refresh before confirming.
                </Typography>
              )}
            </div>
          </ModalBody>
          <ModalFooterActions
            hasCloseButton
            isConfirmDisabled={
              unregisterStatus === 'pending' || isActiveServicePrecheckUnavailable
            }
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
                  RPC Endpoint
                </Typography>
                <Input
                  id="rpcAddress"
                  value={newRpcAddress}
                  onChange={(v) => setNewRpcAddress(v)}
                  placeholder="https://your-node.example.com"
                />
                <Typography variant="body3" className="text-mono-100 mt-1">
                  Leave empty to keep the current RPC endpoint.
                </Typography>
              </div>
              <div>
                <Typography variant="body2" className="mb-1">
                  ECDSA Public Key (Optional Rotation)
                </Typography>
                <Input
                  id="ecdsaPublicKey"
                  value={newEcdsaPublicKey}
                  onChange={(v) => setNewEcdsaPublicKey(v)}
                  placeholder="0x... (65-byte uncompressed key)"
                />
                <Typography variant="body3" className="text-mono-100 mt-1">
                  Leave empty to keep your current key.
                </Typography>
                {ecdsaPublicKeyError ? (
                  <Typography variant="body3" className="text-red-500 mt-1">
                    {ecdsaPublicKeyError}
                  </Typography>
                ) : null}
              </div>
            </div>
          </ModalBody>
          <ModalFooterActions
            hasCloseButton
            isConfirmDisabled={
              updateStatus === 'pending' || !!ecdsaPublicKeyError || isNoopUpdate
            }
            isProcessing={updateStatus === 'pending'}
            confirmButtonText="Update"
            onConfirm={handleUpdatePreferences}
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
                  {selectedSlash
                    ? formatSlashBps(selectedSlash.slashBps)
                    : '-'}
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
                  {selectedSlash ? formatDateTime(selectedSlash.executeAfter) : '-'}
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
                  Evidence:
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
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Explain why this slash proposal is invalid..."
              />
              <Typography variant="body3" className="text-mono-100 mt-1">
                Minimum {MIN_DISPUTE_REASON_LENGTH} characters (
                {trimmedDisputeReason.length}/{MIN_DISPUTE_REASON_LENGTH}).
              </Typography>
              {!selectedSlashEligibility?.isEligible ? (
                <Typography variant="body3" className="text-red-500 mt-1">
                  {getSlashStatusReason(
                    selectedSlash?.status ?? 'Pending',
                    selectedSlashEligibility?.reason ?? null,
                  ) ?? 'Dispute is not available for this slash.'}
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
    </div>
  );
};

export default Page;
