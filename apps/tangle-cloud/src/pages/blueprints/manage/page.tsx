/**
 * Blueprint management page - view and manage owned blueprints.
 */

import { FC, useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router';
import { useAccount } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
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
import { EditLine } from '@tangle-network/icons';
import {
  useBlueprintsByOwner,
  useDeactivateBlueprintTx,
  useTransferBlueprintTx,
  useUpdateBlueprintTx,
  type OwnedBlueprint,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { twMerge } from 'tailwind-merge';
import { PagePath } from '../../../types';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';
import { isAddress } from 'viem';
import pollWithBackoff from '../../../utils/pollWithBackoff';

const columnHelper = createColumnHelper<OwnedBlueprint>();

type BlueprintMetadataPreview = {
  name?: string;
  description?: string;
  author?: string;
  logo?: string;
  website?: string;
  codeRepository?: string;
  docs?: string;
};

const applyBlueprintMetadataPreview = (
  blueprint: OwnedBlueprint,
  metadataUri: string,
  preview: BlueprintMetadataPreview | null,
): OwnedBlueprint => {
  if (!preview) {
    return {
      ...blueprint,
      metadataUri,
    };
  }

  const nextMetadata = { ...blueprint.metadata };

  if (preview.name !== undefined) {
    nextMetadata.name = preview.name;
  }
  if (preview.description !== undefined) {
    nextMetadata.description = preview.description;
  }
  if (preview.author !== undefined) {
    nextMetadata.author = preview.author;
  }
  if (preview.logo !== undefined) {
    nextMetadata.logo = preview.logo;
  }
  if (preview.website !== undefined) {
    nextMetadata.website = preview.website;
  }
  if (preview.codeRepository !== undefined) {
    nextMetadata.codeRepository = preview.codeRepository;
  }
  if (preview.docs !== undefined) {
    nextMetadata.docs = preview.docs;
  }

  return {
    ...blueprint,
    metadataUri,
    name: preview.name ?? blueprint.name,
    description: preview.description ?? blueprint.description,
    metadata: nextMetadata,
  };
};

const readString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const resolveMetadataUri = (metadataUri: string): string => {
  if (!metadataUri.startsWith('ipfs://')) {
    return metadataUri;
  }

  const cid = metadataUri.replace('ipfs://', '');
  return `https://ipfs.io/ipfs/${cid}`;
};

const getMetadataUriValidationError = (metadataUri: string): string | null => {
  const trimmed = metadataUri.trim();

  if (!trimmed) {
    return 'Metadata URI is required';
  }

  if (!/^(ipfs:\/\/|https?:\/\/).+/i.test(trimmed)) {
    return 'Metadata URI must start with ipfs://, https://, or http://';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return 'Metadata URI must use http(s) or ipfs:// protocol';
      }
    } catch {
      return 'Please enter a valid metadata URI';
    }
  }

  return null;
};

const fetchBlueprintMetadataPreview = async (
  metadataUri: string,
): Promise<BlueprintMetadataPreview> => {
  const fetchUrl = resolveMetadataUri(metadataUri);

  const response = await fetch(fetchUrl, {
    signal: AbortSignal.timeout(5000),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch metadata: ${response.status}`);
  }

  const metadataJson = (await response.json()) as Record<string, unknown>;

  return {
    name: readString(metadataJson.name),
    description: readString(metadataJson.description),
    author: readString(metadataJson.author),
    logo: readString(metadataJson.logo) ?? readString(metadataJson.image),
    website:
      readString(metadataJson.website) ?? readString(metadataJson.homepage),
    codeRepository:
      readString(metadataJson.codeRepository) ??
      readString(metadataJson.codeUrl) ??
      readString(metadataJson.repository),
    docs:
      readString(metadataJson.docs) ?? readString(metadataJson.documentation),
  };
};

const ManageBlueprintsPage: FC = () => {
  const { isConnected, address } = useAccount();
  const queryClient = useQueryClient();
  const {
    data: blueprints,
    isLoading,
    error,
    refetch: refetchOwnedBlueprints,
  } = useBlueprintsByOwner();

  const [selectedBlueprint, setSelectedBlueprint] =
    useState<OwnedBlueprint | null>(null);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const cacheKey = useMemo(
    () => ['blueprints', 'byOwner', address, undefined],
    [address],
  );

  // Optimistically update the blueprint status in the cache, returning rollback function
  const updateBlueprintInCache = useCallback(
    (
      blueprintId: bigint,
      updates: Partial<OwnedBlueprint>,
    ): (() => void) | null => {
      const previousData = queryClient.getQueryData<OwnedBlueprint[]>(cacheKey);

      queryClient.setQueryData<OwnedBlueprint[]>(cacheKey, (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((bp) =>
          bp.id === blueprintId ? { ...bp, ...updates } : bp,
        );
      });

      // Return rollback function
      if (previousData) {
        return () =>
          queryClient.setQueryData<OwnedBlueprint[]>(cacheKey, previousData);
      }
      return null;
    },
    [queryClient, cacheKey],
  );

  // Remove a blueprint from the cache (for transfers), returning rollback function
  const removeBlueprintFromCache = useCallback(
    (blueprintId: bigint): (() => void) | null => {
      const previousData = queryClient.getQueryData<OwnedBlueprint[]>(cacheKey);

      queryClient.setQueryData<OwnedBlueprint[]>(cacheKey, (oldData) => {
        if (!oldData) return oldData;
        return oldData.filter((bp) => bp.id !== blueprintId);
      });

      // Return rollback function
      if (previousData) {
        return () =>
          queryClient.setQueryData<OwnedBlueprint[]>(cacheKey, previousData);
      }
      return null;
    },
    [queryClient, cacheKey],
  );

  const handleUpdateMetadataSuccess = useCallback(
    async (
      blueprintId: bigint,
      metadataUri: string,
      preview: BlueprintMetadataPreview | null,
    ) => {
      const normalizedUri = metadataUri.trim();

      queryClient.setQueryData<OwnedBlueprint[]>(cacheKey, (current) => {
        if (!current) {
          return current;
        }

        return current.map((bp) =>
          bp.id === blueprintId
            ? applyBlueprintMetadataPreview(bp, normalizedUri, preview)
            : bp,
        );
      });

      if (!preview) {
        try {
          const fetchedPreview =
            await fetchBlueprintMetadataPreview(normalizedUri);
          queryClient.setQueryData<OwnedBlueprint[]>(cacheKey, (current) => {
            if (!current) {
              return current;
            }

            return current.map((bp) =>
              bp.id === blueprintId
                ? applyBlueprintMetadataPreview(
                    bp,
                    normalizedUri,
                    fetchedPreview,
                  )
                : bp,
            );
          });
        } catch {
          // Best-effort preview fetch. Polling below reconciles with indexer state.
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['blueprints', 'byOwner'] }),
        queryClient.invalidateQueries({ queryKey: ['envio', 'blueprints'] }),
        queryClient.invalidateQueries({
          queryKey: ['envio', 'blueprintsWithMetadata'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['envio', 'blueprint', blueprintId.toString()],
        }),
        queryClient.invalidateQueries({
          queryKey: ['envio', 'blueprintDetails', blueprintId.toString()],
        }),
      ]);

      const synced = await pollWithBackoff(
        async () => {
          const latest = await refetchOwnedBlueprints();
          return (
            latest.data?.some(
              (bp) =>
                bp.id === blueprintId &&
                bp.metadataUri?.trim() === normalizedUri,
            ) ?? false
          );
        },
        {
          maxTotalTime: 120_000,
          maxDelay: 12_000,
        },
      );

      if (!synced) {
        await queryClient.invalidateQueries({
          queryKey: ['blueprints', 'byOwner'],
        });
      }

      await refetchOwnedBlueprints();
    },
    [cacheKey, queryClient, refetchOwnedBlueprints],
  );

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
          const isOwner =
            address !== undefined &&
            blueprint.owner.toLowerCase() === address.toLowerCase();

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

              {blueprint.active && isOwner && (
                <>
                  <Button
                    variant="utility"
                    size="sm"
                    onClick={() => {
                      setSelectedBlueprint(blueprint);
                      setIsUpdateModalOpen(true);
                    }}
                  >
                    Update Metadata
                  </Button>

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
    [address],
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
          <div className="flex flex-col items-center justify-center py-12">
            <EditLine className="w-12 h-12 text-mono-100 mb-4" />
            <Typography variant="h5" fw="semibold">
              No Blueprints Yet
            </Typography>
            <Typography variant="body1" className="text-mono-100 mt-2">
              Create your first blueprint to start offering services on Tangle
              Network.
            </Typography>
          </div>
        )}
      </Card>

      {/* Update Metadata Modal */}
      {selectedBlueprint && (
        <UpdateMetadataModal
          blueprint={selectedBlueprint}
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedBlueprint(null);
          }}
          onSuccess={async (metadataUri, metadataPreview) => {
            await handleUpdateMetadataSuccess(
              selectedBlueprint.id,
              metadataUri,
              metadataPreview,
            );
            setIsUpdateModalOpen(false);
            setSelectedBlueprint(null);
          }}
        />
      )}

      {/* Deactivate Modal */}
      {selectedBlueprint && (
        <DeactivateModal
          blueprint={selectedBlueprint}
          isOpen={isDeactivateModalOpen}
          onClose={() => {
            setIsDeactivateModalOpen(false);
            setSelectedBlueprint(null);
          }}
          onOptimisticUpdate={() => {
            // Apply optimistic update and return rollback function
            return updateBlueprintInCache(selectedBlueprint.id, {
              active: false,
            });
          }}
          onSuccess={() => {
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
          onOptimisticUpdate={() => {
            // Apply optimistic update and return rollback function
            return removeBlueprintFromCache(selectedBlueprint.id);
          }}
          onSuccess={() => {
            setIsTransferModalOpen(false);
            setSelectedBlueprint(null);
          }}
        />
      )}
    </div>
  );
};

interface UpdateMetadataModalProps {
  blueprint: OwnedBlueprint;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (
    metadataUri: string,
    metadataPreview: BlueprintMetadataPreview | null,
  ) => Promise<void>;
}

const UpdateMetadataModal: FC<UpdateMetadataModalProps> = ({
  blueprint,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [metadataUri, setMetadataUri] = useState(blueprint.metadataUri ?? '');
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewData, setPreviewData] =
    useState<BlueprintMetadataPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const { updateBlueprint, status, error, reset } = useUpdateBlueprintTx();
  const isSubmitting = status === 'pending';

  const trimmedUri = metadataUri.trim();
  const uriError = getMetadataUriValidationError(trimmedUri);
  const hasValidUri =
    trimmedUri.length > 0 && getMetadataUriValidationError(trimmedUri) === null;
  const isUnchanged = trimmedUri === (blueprint.metadataUri ?? '').trim();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setMetadataUri(blueprint.metadataUri ?? '');
    setPreviewError(null);
    setPreviewData(null);
    setIsLoadingPreview(false);
    reset();
  }, [blueprint.metadataUri, isOpen, reset]);

  const handleLoadPreview = async () => {
    const trimmedMetadataUri = metadataUri.trim();

    if (getMetadataUriValidationError(trimmedMetadataUri)) {
      return;
    }

    setPreviewError(null);
    setIsLoadingPreview(true);

    try {
      const metadata = await fetchBlueprintMetadataPreview(trimmedMetadataUri);
      setPreviewData(metadata);
    } catch {
      setPreviewData(null);
      setPreviewError('Unable to fetch metadata preview from this URI');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleSubmit = async () => {
    const trimmedMetadataUri = metadataUri.trim();

    if (getMetadataUriValidationError(trimmedMetadataUri)) {
      return;
    }

    const hash = await updateBlueprint(blueprint.id, trimmedMetadataUri);

    if (hash) {
      onClose();
      await onSuccess(trimmedMetadataUri, previewData);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent>
        <ModalHeader>Update Blueprint Metadata</ModalHeader>
        <ModalBody>
          <Typography variant="body1" className="mb-4">
            Update metadata URI for <strong>{blueprint.name}</strong>.
          </Typography>

          <div>
            <Typography variant="body2" className="mb-2">
              Metadata URI
            </Typography>
            <Input
              id="metadataUri"
              value={metadataUri}
              isControlled
              onChange={(value) => {
                setMetadataUri(value);
                setPreviewError(null);
              }}
              placeholder="ipfs://... or https://..."
            />
            {(uriError || previewError || error?.message) && (
              <div className="mt-1">
                {uriError && <ErrorMessage>{uriError}</ErrorMessage>}
                {previewError && <ErrorMessage>{previewError}</ErrorMessage>}
                {error?.message && <ErrorMessage>{error.message}</ErrorMessage>}
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              variant="utility"
              onClick={handleLoadPreview}
              isLoading={isLoadingPreview}
              isDisabled={isSubmitting || !hasValidUri}
            >
              {isLoadingPreview ? 'Loading Preview...' : 'Load Preview'}
            </Button>
          </div>

          {previewData && (
            <div className="mt-4 rounded border border-mono-60 dark:border-mono-140 p-4 space-y-2">
              <Typography variant="body2" fw="semibold">
                Metadata Preview
              </Typography>

              {previewData.logo && (
                <img
                  src={previewData.logo}
                  alt={previewData.name ?? 'Blueprint logo'}
                  className="h-14 w-14 rounded object-cover"
                />
              )}

              <Typography variant="body3">
                <strong>Name:</strong>{' '}
                {previewData.name ?? EMPTY_VALUE_PLACEHOLDER}
              </Typography>
              <Typography variant="body3">
                <strong>Description:</strong>{' '}
                {previewData.description ?? EMPTY_VALUE_PLACEHOLDER}
              </Typography>
              <Typography variant="body3">
                <strong>Author:</strong>{' '}
                {previewData.author ?? EMPTY_VALUE_PLACEHOLDER}
              </Typography>

              <Typography variant="body3">
                <strong>Website:</strong>{' '}
                {previewData.website ? (
                  <a
                    href={previewData.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-70 underline break-all"
                  >
                    {previewData.website}
                  </a>
                ) : (
                  EMPTY_VALUE_PLACEHOLDER
                )}
              </Typography>

              <Typography variant="body3">
                <strong>Repository:</strong>{' '}
                {previewData.codeRepository ? (
                  <a
                    href={previewData.codeRepository}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-70 underline break-all"
                  >
                    {previewData.codeRepository}
                  </a>
                ) : (
                  EMPTY_VALUE_PLACEHOLDER
                )}
              </Typography>

              <Typography variant="body3">
                <strong>Docs:</strong>{' '}
                {previewData.docs ? (
                  <a
                    href={previewData.docs}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-70 underline break-all"
                  >
                    {previewData.docs}
                  </a>
                ) : (
                  EMPTY_VALUE_PLACEHOLDER
                )}
              </Typography>
            </div>
          )}

          {!previewData && blueprint.metadata && (
            <div className="mt-4 rounded border border-mono-60 dark:border-mono-140 p-4 space-y-2">
              <Typography variant="body2" fw="semibold">
                Current Metadata
              </Typography>
              <Typography variant="body3">
                <strong>Name:</strong>{' '}
                {blueprint.metadata.name ?? EMPTY_VALUE_PLACEHOLDER}
              </Typography>
              <Typography variant="body3">
                <strong>Description:</strong>{' '}
                {blueprint.metadata.description ?? EMPTY_VALUE_PLACEHOLDER}
              </Typography>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="secondary"
            onClick={onClose}
            isDisabled={isSubmitting || isLoadingPreview}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={isLoadingPreview || !hasValidUri || isUnchanged}
          >
            {isSubmitting ? 'Updating...' : 'Update Metadata'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

interface DeactivateModalProps {
  blueprint: OwnedBlueprint;
  isOpen: boolean;
  onClose: () => void;
  onOptimisticUpdate: () => (() => void) | null;
  onSuccess: () => void;
}

const DeactivateModal: FC<DeactivateModalProps> = ({
  blueprint,
  isOpen,
  onClose,
  onOptimisticUpdate,
  onSuccess,
}) => {
  const { deactivateBlueprint, status } = useDeactivateBlueprintTx();

  const isSubmitting = status === 'pending';

  const handleDeactivate = async () => {
    // Apply optimistic update immediately for instant UI feedback
    const rollback = onOptimisticUpdate();

    const hash = await deactivateBlueprint(blueprint.id);

    if (hash) {
      // Transaction succeeded, keep the optimistic update
      onSuccess();
    } else {
      // Transaction failed, rollback the optimistic update
      rollback?.();
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
  onOptimisticUpdate: () => (() => void) | null;
  onSuccess: () => void;
}

const TransferModal: FC<TransferModalProps> = ({
  blueprint,
  isOpen,
  onClose,
  onOptimisticUpdate,
  onSuccess,
}) => {
  const [newOwner, setNewOwner] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { transferBlueprint, status } = useTransferBlueprintTx();

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

    // Apply optimistic update immediately for instant UI feedback
    const rollback = onOptimisticUpdate();

    const hash = await transferBlueprint(
      blueprint.id,
      newOwner as `0x${string}`,
    );

    if (hash) {
      // Transaction succeeded, keep the optimistic update
      onSuccess();
    } else {
      // Transaction failed, rollback the optimistic update
      rollback?.();
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
              isControlled
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
