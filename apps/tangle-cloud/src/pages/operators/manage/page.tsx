/**
 * Operator management page - view and manage blueprint registrations and slashing.
 */

import { FC, useState, useMemo, useCallback } from 'react';
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
  useSlashProposals,
  useDisputeSlashTx,
  formatSlashAmount,
  type OperatorRegistration,
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

const registrationColumnHelper = createColumnHelper<OperatorRegistration>();
const slashColumnHelper = createColumnHelper<SlashProposal>();

const Page: FC = () => {
  const { isConnected } = useAccount();
  const queryClient = useQueryClient();

  // Data hooks
  const {
    data: registrations,
    isLoading: loadingRegistrations,
    error: registrationsError,
  } = useOperatorRegistrations();
  const {
    data: slashProposals,
    isLoading: loadingSlash,
    error: slashError,
  } = useSlashProposals();

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
  const [disputeReason, setDisputeReason] = useState('');

  const handleUnregister = useCallback(async () => {
    if (!selectedRegistration) return;
    const result = await unregisterOperator(selectedRegistration.blueprintId);
    if (result) {
      setShowUnregisterModal(false);
      setSelectedRegistration(null);
      queryClient.invalidateQueries({ queryKey: ['operator', 'registrations'] });
    }
  }, [selectedRegistration, unregisterOperator, queryClient]);

  const handleUpdatePreferences = useCallback(async () => {
    if (!selectedRegistration) return;
    const result = await updatePreferences(selectedRegistration.blueprintId, {
      ecdsaPublicKey: selectedRegistration.preferences.ecdsaPublicKey,
      rpcAddress: newRpcAddress,
    });
    if (result) {
      setShowUpdateModal(false);
      setSelectedRegistration(null);
      setNewRpcAddress('');
      queryClient.invalidateQueries({ queryKey: ['operator', 'registrations'] });
    }
  }, [selectedRegistration, newRpcAddress, updatePreferences, queryClient]);

  const handleDispute = useCallback(async () => {
    if (!selectedSlash || !disputeReason.trim()) return;
    const result = await disputeSlash(selectedSlash.id, disputeReason);
    if (result) {
      setShowDisputeModal(false);
      setSelectedSlash(null);
      setDisputeReason('');
      queryClient.invalidateQueries({ queryKey: ['slashing', 'proposals'] });
    }
  }, [selectedSlash, disputeReason, disputeSlash, queryClient]);

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
        cell: (info) => (
          <TableCellWrapper removeRightBorder className="p-3">
            <div className="flex gap-2">
              <Button
                variant="utility"
                size="sm"
                className="uppercase body4 bg-blue-10 dark:bg-blue-120 text-blue-70 dark:text-blue-40 hover:bg-blue-20 dark:hover:bg-blue-110 border border-blue-30 dark:border-blue-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRegistration(info.row.original);
                  setNewRpcAddress(info.row.original.preferences.rpcAddress);
                  setShowUpdateModal(true);
                }}
              >
                Update
              </Button>
              <Button
                variant="utility"
                size="sm"
                className="uppercase body4 bg-red-10 dark:bg-red-120 text-red-70 dark:text-red-40 hover:bg-red-20 dark:hover:bg-red-110 border border-red-30 dark:border-red-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRegistration(info.row.original);
                  setShowUnregisterModal(true);
                }}
              >
                Unregister
              </Button>
            </div>
          </TableCellWrapper>
        ),
      }),
    ],
    [],
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
      slashColumnHelper.accessor('amount', {
        header: () => 'Amount',
        cell: (info) => (
          <TableCellWrapper className="p-3">
            <Typography variant="body1" fw="semibold" className="text-red-500">
              {formatSlashAmount(info.getValue())} TNT
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
          const timestamp = Number(info.getValue());
          const date = new Date(timestamp * 1000);
          return (
            <TableCellWrapper className="p-3">
              <Typography variant="body2">
                {date.toLocaleDateString()}
              </Typography>
            </TableCellWrapper>
          );
        },
      }),
      slashColumnHelper.display({
        id: 'actions',
        header: () => '',
        cell: (info) => (
          <TableCellWrapper removeRightBorder className="p-3">
            {info.row.original.status === 'Pending' ? (
              <Button
                variant="utility"
                size="sm"
                className="uppercase body4 bg-yellow-10 dark:bg-yellow-120 text-yellow-70 dark:text-yellow-40 hover:bg-yellow-20 dark:hover:bg-yellow-110 border border-yellow-30 dark:border-yellow-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSlash(info.row.original);
                  setShowDisputeModal(true);
                }}
              >
                Dispute
              </Button>
            ) : (
              <Typography variant="body3" className="text-mono-100">
                {info.row.original.status === 'Disputed' ? 'Under review' : '-'}
              </Typography>
            )}
          </TableCellWrapper>
        ),
      }),
    ],
    [],
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
            Total Blueprints
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
            {slashProposals?.filter((s) => s.status === 'Pending').length ?? 0}
          </Typography>
        </Card>
      </div>

      {/* Registrations Table */}
      <TangleCloudTable
        title="Blueprint Registrations"
        data={registrations ?? []}
        isLoading={loadingRegistrations}
        error={registrationsError}
        tableProps={registrationTable}
        loadingTableProps={{
          title: 'Loading registrations...',
          description: 'Please wait while we fetch your operator registrations.',
          icon: '🔄',
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
        tableProps={slashTable}
        loadingTableProps={{
          title: 'Loading slash proposals...',
          description: 'Please wait while we fetch slashing proposals.',
          icon: '🔄',
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
              This will remove you as an operator from this blueprint. Any
              pending jobs may be affected.
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
                  RPC Endpoint
                </Typography>
                <Input
                  id="rpcAddress"
                  value={newRpcAddress}
                  onChange={(v) => setNewRpcAddress(v)}
                  placeholder="https://your-node.example.com"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooterActions
            hasCloseButton
            isConfirmDisabled={updateStatus === 'pending'}
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
              <div className="grid grid-cols-2 gap-2">
                <Typography variant="body3" className="text-mono-100">
                  Amount:
                </Typography>
                <Typography variant="body3" className="text-red-500">
                  {selectedSlash
                    ? formatSlashAmount(selectedSlash.amount)
                    : '0'}{' '}
                  TNT
                </Typography>
                <Typography variant="body3" className="text-mono-100">
                  Proposer:
                </Typography>
                <Typography variant="body3" className="font-mono">
                  {selectedSlash ? shortenHex(selectedSlash.proposer) : '-'}
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
            </div>
          </ModalBody>
          <ModalFooterActions
            hasCloseButton
            isConfirmDisabled={disputeStatus === 'pending' || !disputeReason.trim()}
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
