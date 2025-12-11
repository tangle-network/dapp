/**
 * Blueprint management page - view and manage owned blueprints.
 */

import { FC, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAccount } from 'wagmi';
import {
  Button,
  Card,
  CardVariant,
  Typography,
  SkeletonLoader,
  EMPTY_VALUE_PLACEHOLDER,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from '@tangle-network/ui-components';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
} from '@tanstack/react-table';
import { AddLineIcon, EditLine } from '@tangle-network/icons';
import {
  useBlueprintsByOwner,
  useDeactivateBlueprintTx,
  useTransferBlueprintTx,
  type OwnedBlueprint,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { twMerge } from 'tailwind-merge';
import { PagePath } from '../../../types';
import ErrorMessage from '../../../components/ErrorMessage';
import { isAddress } from 'viem';

const columnHelper = createColumnHelper<OwnedBlueprint>();

const ManageBlueprintsPage: FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const {
    data: blueprints,
    isLoading,
    error,
    refetch,
  } = useBlueprintsByOwner();

  const [selectedBlueprint, setSelectedBlueprint] =
    useState<OwnedBlueprint | null>(null);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Blueprint',
        cell: (info) => (
          <div>
            <Typography variant="body1" fw="semibold">
              {info.getValue()}
            </Typography>
            <Typography variant="body3" className="text-mono-100">
              ID: {info.row.original.id.toString()}
            </Typography>
          </div>
        ),
      }),
      columnHelper.accessor('active', {
        header: 'Status',
        cell: (info) => (
          <span
            className={twMerge(
              'px-2 py-1 rounded text-xs',
              info.getValue()
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400',
            )}
          >
            {info.getValue() ? 'Active' : 'Inactive'}
          </span>
        ),
      }),
      columnHelper.accessor('operatorCount', {
        header: 'Operators',
        cell: (info) => (
          <Typography variant="body2">{info.getValue()}</Typography>
        ),
      }),
      columnHelper.accessor('serviceCount', {
        header: 'Services',
        cell: (info) => (
          <Typography variant="body2">
            {info.getValue() ?? EMPTY_VALUE_PLACEHOLDER}
          </Typography>
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created',
        cell: (info) => (
          <Typography variant="body2">
            {new Date(Number(info.getValue()) * 1000).toLocaleDateString()}
          </Typography>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const blueprint = info.row.original;
          return (
            <div className="flex gap-2">
              <Link
                to={PagePath.BLUEPRINTS_DETAILS.replace(
                  ':id',
                  blueprint.id.toString(),
                )}
              >
                <Button variant="utility" size="sm">
                  View
                </Button>
              </Link>

              {blueprint.active && (
                <>
                  <Button
                    variant="utility"
                    size="sm"
                    onClick={() => {
                      setSelectedBlueprint(blueprint);
                      setIsTransferModalOpen(true);
                    }}
                  >
                    Transfer
                  </Button>

                  <Button
                    variant="utility"
                    size="sm"
                    className="text-red-400"
                    onClick={() => {
                      setSelectedBlueprint(blueprint);
                      setIsDeactivateModalOpen(true);
                    }}
                  >
                    Deactivate
                  </Button>
                </>
              )}
            </div>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: blueprints ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Typography variant="h4">Connect Wallet</Typography>
        <Typography variant="body1" className="text-mono-100 mt-2">
          Please connect your wallet to manage blueprints.
        </Typography>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h4" fw="bold">
            My Blueprints
          </Typography>
          <Typography variant="body2" className="text-mono-100">
            View and manage blueprints you have created.
          </Typography>
        </div>

        <Button onClick={() => navigate(PagePath.BLUEPRINTS_CREATE)}>
          <AddLineIcon className="w-4 h-4 mr-2" />
          Create Blueprint
        </Button>
      </div>

      {/* Blueprints Table */}
      <Card variant={CardVariant.GLASS} className="p-6">
        {isLoading ? (
          <div className="space-y-2">
            <SkeletonLoader className="h-12" />
            <SkeletonLoader className="h-12" />
            <SkeletonLoader className="h-12" />
          </div>
        ) : error ? (
          <ErrorMessage>{error.message}</ErrorMessage>
        ) : blueprints && blueprints.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className="border-b border-mono-60 dark:border-mono-140"
                    >
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="text-left py-3 px-4 text-mono-100 font-medium"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-mono-40 dark:border-mono-160 hover:bg-mono-20 dark:hover:bg-mono-170"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="py-3 px-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {table.getPageCount() > 1 && (
              <div className="flex items-center justify-between mt-4">
                <Typography variant="body2" className="text-mono-100">
                  Page {table.getState().pagination.pageIndex + 1} of{' '}
                  {table.getPageCount()}
                </Typography>
                <div className="flex gap-2">
                  <Button
                    variant="utility"
                    size="sm"
                    onClick={() => table.previousPage()}
                    isDisabled={!table.getCanPreviousPage()}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="utility"
                    size="sm"
                    onClick={() => table.nextPage()}
                    isDisabled={!table.getCanNextPage()}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <EditLine className="w-12 h-12 text-mono-100 mx-auto mb-4" />
            <Typography variant="h5" fw="semibold">
              No Blueprints Yet
            </Typography>
            <Typography variant="body1" className="text-mono-100 mt-2 mb-6">
              Create your first blueprint to start offering services on Tangle
              Network.
            </Typography>
            <Button onClick={() => navigate(PagePath.BLUEPRINTS_CREATE)}>
              <AddLineIcon className="w-4 h-4 mr-2" />
              Create Blueprint
            </Button>
          </div>
        )}
      </Card>

      {/* Deactivate Modal */}
      {selectedBlueprint && (
        <DeactivateModal
          blueprint={selectedBlueprint}
          isOpen={isDeactivateModalOpen}
          onClose={() => {
            setIsDeactivateModalOpen(false);
            setSelectedBlueprint(null);
          }}
          onSuccess={() => {
            refetch();
            setIsDeactivateModalOpen(false);
            setSelectedBlueprint(null);
          }}
        />
      )}

      {/* Transfer Modal */}
      {selectedBlueprint && (
        <TransferModal
          blueprint={selectedBlueprint}
          isOpen={isTransferModalOpen}
          onClose={() => {
            setIsTransferModalOpen(false);
            setSelectedBlueprint(null);
          }}
          onSuccess={() => {
            refetch();
            setIsTransferModalOpen(false);
            setSelectedBlueprint(null);
          }}
        />
      )}
    </div>
  );
};

interface DeactivateModalProps {
  blueprint: OwnedBlueprint;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DeactivateModal: FC<DeactivateModalProps> = ({
  blueprint,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    deactivateBlueprint,
    status,
    error,
    reset: _reset,
  } = useDeactivateBlueprintTx();

  const isSubmitting = status === 'pending';
  const _isSuccess = status === 'success';

  const handleDeactivate = async () => {
    const hash = await deactivateBlueprint(blueprint.id);
    if (hash) {
      onSuccess();
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent>
        <ModalHeader>Deactivate Blueprint</ModalHeader>
        <ModalBody>
          <Typography variant="body1">
            Are you sure you want to deactivate{' '}
            <strong>{blueprint.name}</strong>?
          </Typography>
          <Typography variant="body2" className="text-mono-100 mt-2">
            This will prevent new operators from registering and new services
            from being created. Existing services will continue to operate.
          </Typography>

          {error && (
            <div className="mt-4">
              <ErrorMessage>{error.message}</ErrorMessage>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="secondary"
            onClick={onClose}
            isDisabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeactivate}
            isLoading={isSubmitting}
            className="bg-red-500 hover:bg-red-600"
          >
            {isSubmitting ? 'Deactivating...' : 'Deactivate'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

interface TransferModalProps {
  blueprint: OwnedBlueprint;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TransferModal: FC<TransferModalProps> = ({
  blueprint,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [newOwner, setNewOwner] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const {
    transferBlueprint,
    status,
    error,
    reset: _resetTransfer,
  } = useTransferBlueprintTx();

  const isSubmitting = status === 'pending';

  const handleTransfer = async () => {
    if (!newOwner.trim()) {
      setValidationError('New owner address is required');
      return;
    }
    if (!isAddress(newOwner)) {
      setValidationError('Invalid Ethereum address');
      return;
    }

    const hash = await transferBlueprint(
      blueprint.id,
      newOwner as `0x${string}`,
    );
    if (hash) {
      onSuccess();
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent>
        <ModalHeader>Transfer Blueprint</ModalHeader>
        <ModalBody>
          <Typography variant="body1" className="mb-4">
            Transfer ownership of <strong>{blueprint.name}</strong> to another
            address.
          </Typography>

          <div>
            <Typography variant="body2" className="mb-2">
              New Owner Address
            </Typography>
            <Input
              id="newOwner"
              value={newOwner}
              onChange={(v) => {
                setNewOwner(v);
                setValidationError(null);
              }}
              placeholder="0x..."
            />
          </div>

          {validationError && (
            <div className="mt-4">
              <ErrorMessage>{validationError}</ErrorMessage>
            </div>
          )}

          {error && (
            <div className="mt-4">
              <ErrorMessage>{error.message}</ErrorMessage>
            </div>
          )}

          <Typography variant="body3" className="text-mono-100 mt-4">
            Warning: This action cannot be undone. You will lose ownership of
            this blueprint.
          </Typography>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="secondary"
            onClick={onClose}
            isDisabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleTransfer} isLoading={isSubmitting}>
            {isSubmitting ? 'Transferring...' : 'Transfer'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ManageBlueprintsPage;
