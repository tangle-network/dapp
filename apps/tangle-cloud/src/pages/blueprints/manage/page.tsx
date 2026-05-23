/**
 * Blueprint management page - view and manage owned blueprints.
 */

import {
  type ChangeEvent,
  type ComponentProps,
  type FC,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { Text } from '../../../components/sandbox/SandboxUi';
import { Link } from 'react-router';
import { useAccount } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button as SandboxButton,
  Card,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Input as SandboxInput,
  Skeleton,
} from '@tangle-network/sandbox-ui/primitives';
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
  type Blueprint as EnvioBlueprint,
  type BlueprintWithMetadata as EnvioBlueprintWithMetadata,
  type OwnedBlueprint,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  computeBlueprintMetadataPayloadHash,
  parseBlueprintMetadataJsonText,
  resolveBlueprintMetadataFetchUrl,
  isAllowedBlueprintMetadataUri,
} from '@tangle-network/tangle-shared-ui/blueprintApps/authoring';
import { requiresIpfsForBlueprintMetadata } from '@tangle-network/tangle-shared-ui/blueprintApps/runtime';
import { twMerge } from 'tailwind-merge';
import { PagePath } from '../../../types';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';
import { isAddress } from 'viem';
import pollWithBackoff from '../../../utils/pollWithBackoff';
import RequireWallet from '../../../components/RequireWallet';

const columnHelper = createColumnHelper<OwnedBlueprint>();
const EMPTY_VALUE_PLACEHOLDER = '-';
const CARD_SURFACE = 'sandbox' as const;
const METADATA_FETCH_TIMEOUT_MS = 5_000;
// Keep owner list reconciliation long enough for indexer lag after on-chain tx.
const BLUEPRINT_SYNC_POLL_MAX_TOTAL_TIME_MS = 120_000;
// Cap retry spacing to avoid too sparse checks while waiting for sync.
const BLUEPRINT_SYNC_POLL_MAX_DELAY_MS = 12_000;

type BlueprintMetadataPreview = {
  name?: string;
  description?: string;
  author?: string;
  logo?: string;
  website?: string;
  codeRepository?: string;
  docs?: string;
  metadataHash: `0x${string}`;
};

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

const ModalFooter = DialogFooter;

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
    metadataHash: preview.metadataHash,
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

const getMetadataUriValidationError = (metadataUri: string): string | null => {
  const trimmed = metadataUri.trim();

  if (!trimmed) {
    return 'Metadata URI is required';
  }

  if (!/^(ipfs:\/\/|https?:\/\/).+/i.test(trimmed)) {
    return 'Metadata URI must start with ipfs://, https://, or http://';
  }

  if (!isAllowedBlueprintMetadataUri(trimmed)) {
    return 'Production hosted blueprints must publish metadata to an ipfs:// URI';
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
  signal?: AbortSignal,
): Promise<BlueprintMetadataPreview> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    METADATA_FETCH_TIMEOUT_MS,
  );

  const abortFromCaller = () => controller.abort();
  signal?.addEventListener('abort', abortFromCaller, { once: true });

  try {
    if (signal?.aborted) {
      controller.abort();
    }

    const response = await fetch(
      resolveBlueprintMetadataFetchUrl(metadataUri),
      {
        signal: controller.signal,
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`);
    }

    const metadataText = await response.text();
    const { parsed, rawMetadata } =
      parseBlueprintMetadataJsonText(metadataText);
    const metadataJson = rawMetadata;
    if (metadataJson === null) {
      throw new Error('Metadata payload must be a JSON object');
    }

    return {
      name: parsed.name,
      description: parsed.description,
      author: parsed.author,
      logo: parsed.imageUrl ?? undefined,
      website: parsed.website ?? undefined,
      codeRepository: parsed.codeUrl ?? undefined,
      docs:
        metadataJson !== null
          ? (readString(metadataJson.docs) ??
            readString(metadataJson.documentation))
          : undefined,
      metadataHash: computeBlueprintMetadataPayloadHash(metadataJson),
    };
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortFromCaller);
  }
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
      const applyMetadataAcrossCaches = (
        nextUri: string,
        nextPreview: BlueprintMetadataPreview | null,
      ) => {
        queryClient.setQueryData<OwnedBlueprint[]>(cacheKey, (current) => {
          if (!current) {
            return current;
          }

          return current.map((bp) =>
            bp.id === blueprintId
              ? applyBlueprintMetadataPreview(bp, nextUri, nextPreview)
              : bp,
          );
        });

        queryClient.setQueriesData<EnvioBlueprint[]>(
          { queryKey: ['envio', 'blueprints'] },
          (current) => {
            if (!current) {
              return current;
            }

            return current.map((bp) =>
              bp.blueprintId === blueprintId
                ? {
                    ...bp,
                    metadataUri: nextUri,
                    metadataHash: nextPreview?.metadataHash ?? bp.metadataHash,
                  }
                : bp,
            );
          },
        );

        queryClient.setQueriesData<EnvioBlueprintWithMetadata[]>(
          { queryKey: ['envio', 'blueprintsWithMetadata'] },
          (current) => {
            if (!current) {
              return current;
            }

            return current.map((bp) =>
              bp.blueprintId === blueprintId
                ? {
                    ...bp,
                    metadataUri: nextUri,
                    metadataHash: nextPreview?.metadataHash ?? bp.metadataHash,
                    name: nextPreview?.name ?? bp.name,
                    description: nextPreview?.description ?? bp.description,
                    author: nextPreview?.author ?? bp.author,
                    imageUrl: nextPreview?.logo ?? bp.imageUrl,
                    website: nextPreview?.website ?? bp.website,
                    codeUrl: nextPreview?.codeRepository ?? bp.codeUrl,
                  }
                : bp,
            );
          },
        );
      };

      applyMetadataAcrossCaches(normalizedUri, preview);

      if (!preview) {
        try {
          const fetchedPreview =
            await fetchBlueprintMetadataPreview(normalizedUri);
          applyMetadataAcrossCaches(normalizedUri, fetchedPreview);
        } catch (error) {
          console.warn(
            'Failed to fetch metadata preview after blueprint update',
            {
              operation: 'postSubmitPreviewFetch',
              blueprintId: blueprintId.toString(),
              metadataUri: normalizedUri,
              error,
            },
          );
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: cacheKey }),
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
                bp.metadataUri?.trim() === normalizedUri &&
                bp.metadataHash === (preview?.metadataHash ?? bp.metadataHash),
            ) ?? false
          );
        },
        {
          maxTotalTime: BLUEPRINT_SYNC_POLL_MAX_TOTAL_TIME_MS,
          maxDelay: BLUEPRINT_SYNC_POLL_MAX_DELAY_MS,
        },
      );

      if (!synced) {
        await queryClient.invalidateQueries({
          queryKey: cacheKey,
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
            <Text variant="body1" fw="semibold">
              {info.getValue()}
            </Text>
            <Text variant="body3" className="text-muted-foreground">
              ID: {info.row.original.id.toString()}
            </Text>
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
        cell: (info) => <Text variant="body2">{info.getValue()}</Text>,
      }),
      columnHelper.accessor('serviceCount', {
        header: 'Services',
        cell: (info) => (
          <Text variant="body2">
            {info.getValue() ?? EMPTY_VALUE_PLACEHOLDER}
          </Text>
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created',
        cell: (info) => (
          <Text variant="body2">
            {new Date(Number(info.getValue()) * 1000).toLocaleDateString()}
          </Text>
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
      <div className="space-y-6">
        <div>
          <Text variant="h4" fw="bold">
            My Blueprints
          </Text>
          <Text variant="body2" className="text-muted-foreground">
            Update metadata, transfer ownership, or deactivate blueprints owned
            by the connected wallet.
          </Text>
        </div>
        <RequireWallet
          eyebrow="Manage blueprints"
          title="Connect a publisher wallet"
          description="A wallet connection is required to load owned blueprints and prepare owner-only updates."
          checks={['Owned blueprints', 'Metadata updates', 'Ownership actions']}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Text variant="h4" fw="bold">
            My Blueprints
          </Text>
          <Text variant="body2" className="text-muted-foreground">
            View and manage blueprints you have created.
          </Text>
        </div>
      </div>

      {/* Blueprints Table */}
      <Card variant={CARD_SURFACE} className="p-6">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : error ? (
          <ErrorMessage>{error.message}</ErrorMessage>
        ) : blueprints && blueprints.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b border-border">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="text-left py-3 px-4 text-muted-foreground font-medium"
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
                      className="border-b border-border hover:bg-muted/60"
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
                <Text variant="body2" className="text-muted-foreground">
                  Page {table.getState().pagination.pageIndex + 1} of{' '}
                  {table.getPageCount()}
                </Text>
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
          <EmptyState
            icon={<EditLine className="h-10 w-10" />}
            title="No Blueprints Yet"
            description="Create your first blueprint to start offering services on Tangle Network."
          />
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
  const previewRequestAbortRef = useRef<AbortController | null>(null);

  const { updateBlueprint, status, error, reset } = useUpdateBlueprintTx();
  const isSubmitting = status === 'pending';

  const trimmedUri = metadataUri.trim();
  const uriError = getMetadataUriValidationError(trimmedUri);
  const hasValidUri =
    trimmedUri.length > 0 && getMetadataUriValidationError(trimmedUri) === null;
  const isUnchanged = trimmedUri === (blueprint.metadataUri ?? '').trim();

  const cancelInFlightPreviewRequest = useCallback(() => {
    previewRequestAbortRef.current?.abort();
    previewRequestAbortRef.current = null;
  }, []);

  useEffect(() => {
    if (!isOpen) {
      cancelInFlightPreviewRequest();
      return;
    }

    setMetadataUri(blueprint.metadataUri ?? '');
    setPreviewError(null);
    setPreviewData(null);
    setIsLoadingPreview(false);
    reset();
    return () => {
      cancelInFlightPreviewRequest();
    };
  }, [blueprint.metadataUri, isOpen, reset, cancelInFlightPreviewRequest]);

  const handleLoadPreview = async () => {
    const trimmedMetadataUri = metadataUri.trim();

    if (getMetadataUriValidationError(trimmedMetadataUri)) {
      return;
    }

    cancelInFlightPreviewRequest();
    const previewAbortController = new AbortController();
    previewRequestAbortRef.current = previewAbortController;

    setPreviewError(null);
    setIsLoadingPreview(true);

    try {
      const metadata = await fetchBlueprintMetadataPreview(
        trimmedMetadataUri,
        previewAbortController.signal,
      );
      if (previewRequestAbortRef.current !== previewAbortController) {
        return;
      }
      setPreviewData(metadata);
    } catch (error) {
      if (previewAbortController.signal.aborted) {
        return;
      }
      setPreviewData(null);
      setPreviewError('Unable to fetch metadata preview from this URI');
      console.warn('Failed to load blueprint metadata preview', {
        operation: 'loadMetadataPreview',
        blueprintId: blueprint.id.toString(),
        metadataUri: trimmedMetadataUri,
        error,
      });
    } finally {
      if (previewRequestAbortRef.current === previewAbortController) {
        previewRequestAbortRef.current = null;
        setIsLoadingPreview(false);
      }
    }
  };

  const handleSubmit = async () => {
    const trimmedMetadataUri = metadataUri.trim();

    if (getMetadataUriValidationError(trimmedMetadataUri)) {
      return;
    }

    const metadataHash = previewData?.metadataHash;
    if (!metadataHash) {
      setPreviewError(
        'Load a valid metadata payload before publishing the onchain hash pin.',
      );
      return;
    }

    const hash = await updateBlueprint(
      blueprint.id,
      trimmedMetadataUri,
      metadataHash,
    );

    if (hash) {
      onClose();
      await onSuccess(trimmedMetadataUri, previewData);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <ModalContent>
        <ModalHeader>Update Blueprint Metadata</ModalHeader>
        <ModalBody>
          <Text variant="body1" className="mb-4">
            Update metadata URI for <strong>{blueprint.name}</strong>.
          </Text>

          <div>
            <Text variant="body2" className="mb-2">
              Metadata URI
            </Text>
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
            <Text variant="body3" className="text-muted-foreground mt-1">
              {requiresIpfsForBlueprintMetadata()
                ? 'Production hosted blueprints must keep metadata on ipfs:// content-addressed URIs.'
                : 'Local development can still preview metadata from https:// endpoints.'}
            </Text>
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
            <div className="mt-4 rounded border border-border p-4 space-y-2">
              <Text variant="body2" fw="semibold">
                Metadata Preview
              </Text>

              {previewData.logo && (
                <img
                  src={previewData.logo}
                  alt={previewData.name ?? 'Blueprint logo'}
                  className="h-14 w-14 rounded object-cover"
                />
              )}

              <Text variant="body3">
                <strong>Name:</strong>{' '}
                {previewData.name ?? EMPTY_VALUE_PLACEHOLDER}
              </Text>
              <Text variant="body3">
                <strong>Description:</strong>{' '}
                {previewData.description ?? EMPTY_VALUE_PLACEHOLDER}
              </Text>
              <Text variant="body3">
                <strong>Author:</strong>{' '}
                {previewData.author ?? EMPTY_VALUE_PLACEHOLDER}
              </Text>

              <Text variant="body3">
                <strong>Website:</strong>{' '}
                {previewData.website ? (
                  <a
                    href={previewData.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline break-all"
                  >
                    {previewData.website}
                  </a>
                ) : (
                  EMPTY_VALUE_PLACEHOLDER
                )}
              </Text>

              <Text variant="body3">
                <strong>Repository:</strong>{' '}
                {previewData.codeRepository ? (
                  <a
                    href={previewData.codeRepository}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline break-all"
                  >
                    {previewData.codeRepository}
                  </a>
                ) : (
                  EMPTY_VALUE_PLACEHOLDER
                )}
              </Text>

              <Text variant="body3">
                <strong>Docs:</strong>{' '}
                {previewData.docs ? (
                  <a
                    href={previewData.docs}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline break-all"
                  >
                    {previewData.docs}
                  </a>
                ) : (
                  EMPTY_VALUE_PLACEHOLDER
                )}
              </Text>
            </div>
          )}

          {!previewData && blueprint.metadata && (
            <div className="mt-4 rounded border border-border p-4 space-y-2">
              <Text variant="body2" fw="semibold">
                Current Metadata
              </Text>
              <Text variant="body3">
                <strong>Name:</strong>{' '}
                {blueprint.metadata.name ?? EMPTY_VALUE_PLACEHOLDER}
              </Text>
              <Text variant="body3">
                <strong>Description:</strong>{' '}
                {blueprint.metadata.description ?? EMPTY_VALUE_PLACEHOLDER}
              </Text>
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
    <Modal open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <ModalContent>
        <ModalHeader>Deactivate Blueprint</ModalHeader>
        <ModalBody>
          <Text variant="body1">
            Are you sure you want to deactivate{' '}
            <strong>{blueprint.name}</strong>?
          </Text>
          <Text variant="body2" className="text-muted-foreground mt-2">
            This will prevent new operators from registering and new services
            from being created. Existing services will continue to operate.
          </Text>
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
    <Modal open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <ModalContent>
        <ModalHeader>Transfer Blueprint</ModalHeader>
        <ModalBody>
          <Text variant="body1" className="mb-4">
            Transfer ownership of <strong>{blueprint.name}</strong> to another
            address.
          </Text>

          <div>
            <Text variant="body2" className="mb-2">
              New Owner Address
            </Text>
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

          <Text variant="body3" className="text-muted-foreground mt-4">
            Warning: This action cannot be undone. You will lose ownership of
            this blueprint.
          </Text>
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
