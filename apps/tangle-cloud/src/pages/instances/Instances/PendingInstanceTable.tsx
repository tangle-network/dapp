import {
  useMemo,
  useState,
  useCallback,
  type FC,
  Dispatch,
  SetStateAction,
} from 'react';
import {
  AccessorKeyColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Avatar,
  Button,
  Modal,
  Typography,
  shortenString,
} from '@tangle-network/ui-components';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import { TangleCloudTable } from '../../../components/tangleCloudTable/TangleCloudTable';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import { useChainId } from 'wagmi';
import { chainsConfig } from '@tangle-network/dapp-config/chains';
import {
  usePendingServiceRequests,
  useBlueprintMap,
  type ServiceRequest,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import useEvmOperatorInfo from '../../../hooks/useEvmOperatorInfo';
import ServiceRequestDetailModal from './UpdateBlueprintModel/ServiceRequestDetailModal';
import { ApprovalConfirmationFormFields } from '../../../types';
import useServiceApproveTx from '../../../data/services/useServiceApproveTx';
import useServiceRejectTx from '../../../data/services/useServiceRejectTx';

// Service request with blueprint metadata
interface ServiceRequestWithBlueprint extends ServiceRequest {
  blueprintData?: Blueprint;
}

const columnHelper = createColumnHelper<ServiceRequestWithBlueprint>();

interface PendingInstanceTableProps {
  refreshTrigger: number;
  setRefreshTrigger: Dispatch<SetStateAction<number>>;
}

export const PendingInstanceTable: FC<PendingInstanceTableProps> = ({
  setRefreshTrigger,
}) => {
  const chainId = useChainId();
  const { isOperator, operatorAddress } = useEvmOperatorInfo();

  // Get chain config for explorer URLs
  const activeChain = useMemo(() => {
    return Object.values(chainsConfig).find((c) => c.id === chainId);
  }, [chainId]);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [selectedRequest, setSelectedRequest] =
    useState<ServiceRequestWithBlueprint | null>(null);

  // Fetch pending service requests for the operator
  const {
    data: pendingRequests,
    isLoading,
    error,
    refetch,
  } = usePendingServiceRequests(
    isOperator ? (operatorAddress ?? undefined) : undefined,
  );

  // Fetch blueprint metadata
  const { blueprints: blueprintMap } = useBlueprintMap();

  // Combine requests with blueprint data and filter out requests where operator has already acted
  const requestsWithBlueprints = useMemo<ServiceRequestWithBlueprint[]>(() => {
    if (!pendingRequests) return [];

    const normalizedOperator = operatorAddress?.toLowerCase();

    return pendingRequests
      .filter((request) => {
        if (!normalizedOperator) return true;
        // Filter out requests where operator has already approved or rejected
        const hasApproved = request.approvedOperators?.some(
          (addr) => addr.toLowerCase() === normalizedOperator,
        );
        const hasRejected = request.rejectedOperators?.some(
          (addr) => addr.toLowerCase() === normalizedOperator,
        );
        return !hasApproved && !hasRejected;
      })
      .map((request) => ({
        ...request,
        blueprintData: blueprintMap?.get(request.blueprintId.toString()),
      }));
  }, [pendingRequests, blueprintMap, operatorAddress]);

  // Helper to check if current operator has approved a request
  const hasOperatorApproved = useCallback(
    (request: ServiceRequestWithBlueprint) => {
      if (!operatorAddress) return false;
      const normalizedOperator = operatorAddress.toLowerCase();
      return request.approvedOperators?.some(
        (addr) => addr.toLowerCase() === normalizedOperator,
      );
    },
    [operatorAddress],
  );

  // Helper to check if current operator has rejected a request
  const hasOperatorRejected = useCallback(
    (request: ServiceRequestWithBlueprint) => {
      if (!operatorAddress) return false;
      const normalizedOperator = operatorAddress.toLowerCase();
      return request.rejectedOperators?.some(
        (addr) => addr.toLowerCase() === normalizedOperator,
      );
    },
    [operatorAddress],
  );

  // Helper to get pending approval count
  const getPendingApprovalCount = useCallback(
    (request: ServiceRequestWithBlueprint) => {
      const totalOperators = request.operatorCandidates?.length ?? 0;
      const approvedCount = request.approvedOperators?.length ?? 0;
      return totalOperators - approvedCount;
    },
    [],
  );

  const isEmpty = requestsWithBlueprints.length === 0;

  // Callback to handle successful transactions - refetch after delay to allow indexer to process
  const handleTxSuccess = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
    // Delay refetch to allow indexer to process the transaction
    setTimeout(() => {
      refetch();
    }, 2000);
  }, [setRefreshTrigger, refetch]);

  const { execute: rejectServiceRequest, status: rejectStatus } =
    useServiceRejectTx({ onSuccess: handleTxSuccess });

  const { execute: approveServiceRequest, status: approveStatus } =
    useServiceApproveTx({ onSuccess: handleTxSuccess });

  const columns = useMemo(() => {
    const baseColumns: AccessorKeyColumnDef<
      ServiceRequestWithBlueprint,
      any
    >[] = [
      columnHelper.accessor('blueprintId', {
        header: () => 'Blueprint',
        enableSorting: false,
        cell: (props) => {
          const request = props.row.original;
          return (
            <TableCellWrapper className="p-0 min-h-fit">
              <div className="flex items-center gap-2 overflow-hidden">
                {request.blueprintData?.imgUrl ? (
                  <Avatar
                    size="lg"
                    className="min-w-12"
                    src={request.blueprintData.imgUrl}
                    alt={request.blueprintData?.name ?? 'Blueprint'}
                    sourceVariant="uri"
                  />
                ) : (
                  <Avatar
                    size="lg"
                    className="min-w-12"
                    sourceVariant="address"
                    value={request.requester}
                    theme="ethereum"
                  />
                )}
                <Typography
                  variant="body1"
                  fw="bold"
                  className="!text-blue-50 text-ellipsis whitespace-nowrap overflow-hidden"
                >
                  {request.blueprintData?.name ||
                    `Blueprint ${request.blueprintId}`}
                </Typography>
              </div>
            </TableCellWrapper>
          );
        },
      }),
    ];

    if (isOperator) {
      baseColumns.push(
        columnHelper.accessor('requester', {
          header: () => 'Deployer',
          cell: (props) => {
            const requester = props.row.original.requester;
            const explorerUrl = activeChain?.blockExplorers?.default?.url
              ? `${activeChain.blockExplorers.default.url}/address/${requester}`
              : undefined;

            return (
              <TableCellWrapper className="p-0 min-h-fit">
                <div className="flex items-center gap-2">
                  <Avatar size="md" value={requester} theme="ethereum" />
                  <div>
                    <Typography variant="body1" fw="bold">
                      {shortenString(requester, 8)}
                    </Typography>
                    {explorerUrl && (
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-50 hover:underline"
                      >
                        View on Explorer
                      </a>
                    )}
                  </div>
                </div>
              </TableCellWrapper>
            );
          },
        }),
        columnHelper.accessor('requestId', {
          id: 'actions',
          header: () => '',
          cell: (props) => {
            const request = props.row.original;
            const approved = hasOperatorApproved(request);
            const rejected = hasOperatorRejected(request);
            const pendingCount = getPendingApprovalCount(request);

            // Operator has already approved
            if (approved) {
              return (
                <TableCellWrapper removeRightBorder className="p-0 min-h-fit">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5 text-green-500">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm font-medium">You approved</span>
                    </div>
                    {pendingCount > 0 && (
                      <span className="text-xs text-mono-100 dark:text-mono-80">
                        Waiting for {pendingCount} more{' '}
                        {pendingCount === 1 ? 'operator' : 'operators'}
                      </span>
                    )}
                  </div>
                </TableCellWrapper>
              );
            }

            // Operator has already rejected
            if (rejected) {
              return (
                <TableCellWrapper removeRightBorder className="p-0 min-h-fit">
                  <div className="flex items-center gap-1.5 text-red-500">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span className="text-sm font-medium">You rejected</span>
                  </div>
                </TableCellWrapper>
              );
            }

            // Operator hasn't acted yet - show review button
            return (
              <TableCellWrapper removeRightBorder className="p-0 min-h-fit">
                <Button
                  variant="utility"
                  size="sm"
                  onClick={() => {
                    setSelectedRequest(props.row.original);
                    setIsDetailModalOpen(true);
                  }}
                >
                  Review
                </Button>
              </TableCellWrapper>
            );
          },
        }),
      );
    } else {
      baseColumns.push(
        columnHelper.accessor('operatorCandidates', {
          header: 'Operators',
          cell: (props) => {
            const operators = props.row.original.operatorCandidates;
            return (
              <TableCellWrapper className="p-0 min-h-fit">
                <div className="flex -space-x-2">
                  {operators.slice(0, 3).map((op) => (
                    <Avatar
                      key={op}
                      size="sm"
                      value={op}
                      theme="ethereum"
                      className="border-2 border-mono-0 dark:border-mono-200"
                    />
                  ))}
                  {operators.length > 3 && (
                    <div className="flex items-center justify-center w-6 h-6 text-xs bg-mono-80 rounded-full border-2 border-mono-0 dark:border-mono-200">
                      +{operators.length - 3}
                    </div>
                  )}
                </div>
              </TableCellWrapper>
            );
          },
        }),
        columnHelper.accessor('createdAt', {
          header: 'Created At',
          cell: (props) => {
            const timestamp = props.row.original.createdAt;
            const date = new Date(Number(timestamp) * 1000);
            return (
              <TableCellWrapper removeRightBorder className="p-0 min-h-fit">
                {date.toLocaleDateString()}
              </TableCellWrapper>
            );
          },
        }),
      );
    }

    return baseColumns;
  }, [
    isOperator,
    activeChain,
    hasOperatorApproved,
    hasOperatorRejected,
    getPendingApprovalCount,
  ]);

  const table = useReactTable({
    data: requestsWithBlueprints,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => `PendingServiceRequest-${row.requestId}`,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  const onCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedRequest(null);
  }, []);

  const onConfirmReject = useCallback(async () => {
    if (!selectedRequest || !rejectServiceRequest) return;

    await rejectServiceRequest({
      requestId: selectedRequest.requestId,
    });
  }, [selectedRequest, rejectServiceRequest]);

  const onConfirmApprove = useCallback(
    async (data: ApprovalConfirmationFormFields) => {
      if (!selectedRequest || !approveServiceRequest) return;

      if (data.securityCommitments && data.securityCommitments.length > 0) {
        await approveServiceRequest({
          requestId: selectedRequest.requestId,
          securityCommitments: data.securityCommitments,
        });
      } else {
        await approveServiceRequest({
          requestId: selectedRequest.requestId,
          stakingPercent: data.stakingPercent ?? 0,
          tntExposureBps: data.tntExposureBps,
        });
      }
    },
    [selectedRequest, approveServiceRequest],
  );

  return (
    <>
      <TangleCloudTable<ServiceRequestWithBlueprint>
        title={pluralize('Pending Request', !isEmpty)}
        data={requestsWithBlueprints}
        error={error}
        isLoading={isLoading}
        tableProps={table}
        tableConfig={{
          tableClassName: 'min-w-[1000px]',
        }}
      />
      <Modal open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <ServiceRequestDetailModal
          onClose={onCloseDetailModal}
          onApprove={onConfirmApprove}
          onReject={onConfirmReject}
          selectedRequest={selectedRequest}
          approveStatus={approveStatus}
          rejectStatus={rejectStatus}
        />
      </Modal>
    </>
  );
};

PendingInstanceTable.displayName = 'PendingInstanceTable';
