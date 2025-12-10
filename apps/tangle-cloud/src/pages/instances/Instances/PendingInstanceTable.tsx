import {
  useMemo,
  useState,
  useCallback,
  useEffect,
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
  EMPTY_VALUE_PLACEHOLDER,
  Modal,
  Typography,
  shortenString,
} from '@tangle-network/ui-components';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import { TangleCloudTable } from '../../../components/tangleCloudTable/TangleCloudTable';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import { Address } from 'viem';
import { useAccount, useChainId } from 'wagmi';
import { chainsConfig } from '@tangle-network/dapp-config/chains';
import {
  usePendingServiceRequests,
  useBlueprintMap,
  type ServiceRequest,
  type BlueprintWithMetadata,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import useEvmOperatorInfo from '../../../hooks/useEvmOperatorInfo';
import RejectConfirmationModel from './UpdateBlueprintModel/RejectConfirmationModal';
import ApproveConfirmationModel from './UpdateBlueprintModel/ApproveConfirmationModal';
import { ApprovalConfirmationFormFields } from '../../../types';
import useServiceApproveTx from '../../../data/services/useServiceApproveTx';
import useServiceRejectTx from '../../../data/services/useServiceRejectTx';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';

// Service request with blueprint metadata
interface ServiceRequestWithBlueprint extends ServiceRequest {
  blueprintData?: BlueprintWithMetadata;
}

const columnHelper = createColumnHelper<ServiceRequestWithBlueprint>();

interface PendingInstanceTableProps {
  refreshTrigger: number;
  setRefreshTrigger: Dispatch<SetStateAction<number>>;
}

export const PendingInstanceTable: FC<PendingInstanceTableProps> = ({
  refreshTrigger,
  setRefreshTrigger,
}) => {
  const { address: currentUserAddress } = useAccount();
  const chainId = useChainId();
  const { isOperator, operatorAddress } = useEvmOperatorInfo();

  // Get chain config for explorer URLs
  const activeChain = useMemo(() => {
    return Object.values(chainsConfig).find((c) => c.id === chainId);
  }, [chainId]);

  const [isRejectConfirmationModalOpen, setIsRejectConfirmationModalOpen] =
    useState(false);

  const [isApproveConfirmationModalOpen, setIsApproveConfirmationModalOpen] =
    useState(false);

  const [selectedRequest, setSelectedRequest] =
    useState<ServiceRequestWithBlueprint | null>(null);

  // Fetch pending service requests for the operator
  const {
    data: pendingRequests,
    isLoading,
    error,
    refetch,
  } = usePendingServiceRequests(isOperator ? operatorAddress ?? undefined : undefined);

  // Fetch blueprint metadata
  const { data: blueprintMap } = useBlueprintMap();

  // Combine requests with blueprint data
  const requestsWithBlueprints = useMemo<ServiceRequestWithBlueprint[]>(() => {
    if (!pendingRequests) return [];

    return pendingRequests.map((request) => ({
      ...request,
      blueprintData: blueprintMap?.get(request.blueprintId.toString()),
    }));
  }, [pendingRequests, blueprintMap]);

  const isEmpty = requestsWithBlueprints.length === 0;

  const { execute: rejectServiceRequest, status: rejectStatus } =
    useServiceRejectTx();

  const { execute: approveServiceRequest, status: approveStatus } =
    useServiceApproveTx();

  useEffect(() => {
    if (approveStatus === TxStatus.COMPLETE) {
      setRefreshTrigger((prev) => prev + 1);
      refetch();
    }
  }, [approveStatus, setRefreshTrigger, refetch]);

  useEffect(() => {
    if (rejectStatus === TxStatus.COMPLETE) {
      setRefreshTrigger((prev) => prev + 1);
      refetch();
    }
  }, [rejectStatus, setRefreshTrigger, refetch]);

  const columns = useMemo(() => {
    const baseColumns: AccessorKeyColumnDef<ServiceRequestWithBlueprint, any>[] = [
      columnHelper.accessor('blueprintId', {
        header: () => 'Blueprint',
        enableSorting: false,
        cell: (props) => {
          const request = props.row.original;
          return (
            <TableCellWrapper className="p-0 min-h-fit">
              <div className="flex items-center gap-2 overflow-hidden">
                {request.blueprintData?.logo ? (
                  <Avatar
                    size="lg"
                    className="min-w-12"
                    src={request.blueprintData.logo}
                    alt={request.blueprintData.name}
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
                  {request.blueprintData?.name || `Blueprint ${request.blueprintId}`}
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
                  <Avatar
                    size="md"
                    value={requester}
                    theme="ethereum"
                  />
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
            return (
              <TableCellWrapper removeRightBorder className="p-0 min-h-fit">
                <div className="flex gap-2">
                  <Button
                    variant="utility"
                    size="sm"
                    onClick={() => {
                      setIsApproveConfirmationModalOpen(true);
                      setSelectedRequest(props.row.original);
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="utility"
                    size="sm"
                    onClick={() => {
                      setIsRejectConfirmationModalOpen(true);
                      setSelectedRequest(props.row.original);
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </TableCellWrapper>
            );
          },
        }),
      );
    } else {
      baseColumns.push(
        columnHelper.accessor('operators', {
          header: 'Operators',
          cell: (props) => {
            const operators = props.row.original.operators;
            return (
              <TableCellWrapper className="p-0 min-h-fit">
                <div className="flex -space-x-2">
                  {operators.slice(0, 3).map((op, i) => (
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
  }, [isOperator, activeChain]);

  const table = useReactTable({
    data: requestsWithBlueprints,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => `PendingServiceRequest-${row.requestId}`,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  const onCloseBlueprintRejectModal = useCallback(() => {
    setIsRejectConfirmationModalOpen(false);
    setSelectedRequest(null);
  }, []);

  const onConfirmReject = useCallback(async () => {
    if (!selectedRequest || !rejectServiceRequest) return;

    await rejectServiceRequest({
      requestId: selectedRequest.requestId,
    });
  }, [selectedRequest, rejectServiceRequest]);

  const onCloseBlueprintApproveModal = useCallback(() => {
    setIsApproveConfirmationModalOpen(false);
    setSelectedRequest(null);
  }, []);

  const onConfirmApprove = useCallback(
    async (data: ApprovalConfirmationFormFields) => {
      if (!selectedRequest || !approveServiceRequest) return;

      await approveServiceRequest({
        requestId: selectedRequest.requestId,
        restakingPercent: data.restakingPercent ?? 0,
      });
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
      <Modal
        open={isRejectConfirmationModalOpen}
        onOpenChange={setIsRejectConfirmationModalOpen}
      >
        <RejectConfirmationModel
          onClose={onCloseBlueprintRejectModal}
          onConfirm={onConfirmReject}
          selectedRequest={selectedRequest}
          status={rejectStatus}
        />
      </Modal>
      <Modal
        open={isApproveConfirmationModalOpen}
        onOpenChange={setIsApproveConfirmationModalOpen}
      >
        <ApproveConfirmationModel
          onClose={onCloseBlueprintApproveModal}
          onConfirm={onConfirmApprove}
          selectedRequest={selectedRequest}
          assetsMetadata={null}
          status={approveStatus}
        />
      </Modal>
    </>
  );
};

PendingInstanceTable.displayName = 'PendingInstanceTable';
