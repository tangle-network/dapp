import { useMemo, type FC, useState, useCallback } from 'react';
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
  Dropdown,
  DropdownBody,
  DropdownButton,
  EMPTY_VALUE_PLACEHOLDER,
  getRoundedAmountString,
  Modal,
  shortenString,
  Typography,
} from '@tangle-network/ui-components';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import { TangleCloudTable } from '../../../components/tangleCloudTable/TangleCloudTable';
import { ChevronDown } from '@tangle-network/icons';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import { MonitoringServiceRequest } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import {
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { NestedOperatorCell } from '../../../components/NestedOperatorCell';
import addCommasToNumber from '@tangle-network/ui-components/utils/addCommasToNumber';
import useAssetsMetadata from '@tangle-network/tangle-shared-ui/hooks/useAssetsMetadata';
import RejectConfirmationModel from './UpdateBlueprintModel/RejectConfirmationModal';
import ApproveConfirmationModel from './UpdateBlueprintModel/ApproveConfirmationModal';
import { ApprovalConfirmationFormFields } from '../../../types';
import usePendingServiceRequest from '@tangle-network/tangle-shared-ui/data/blueprints/usePendingServiceRequest';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
import useIdentities from '@tangle-network/tangle-shared-ui/hooks/useIdentities';
import useRoleStore, { Role } from '../../../stores/roleStore';
import useServicesRejectTx from '../../../data/services/useServicesRejectTx';
import useServicesApproveTx from '../../../data/services/useServicesApproveTx';

const columnHelper = createColumnHelper<MonitoringServiceRequest>();

export const PendingInstanceTable: FC = () => {
  const isOperator = useRoleStore().role === Role.OPERATOR;
  const operatorAccountAddress = useSubstrateAddress();
  const [isRejectConfirmationModalOpen, setIsRejectConfirmationModalOpen] =
    useState(false);
  const [isApproveConfirmationModalOpen, setIsApproveConfirmationModalOpen] =
    useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<MonitoringServiceRequest | null>(null);

  const {
    blueprints: pendingBlueprints,
    error,
    isLoading,
  } = usePendingServiceRequest(operatorAccountAddress);

  const { result: operatorIdentityMap } = useIdentities(
    useMemo(() => {
      const operatorMap = pendingBlueprints.flatMap((blueprint) => {
        const approvedOperators = blueprint.approvedOperators ?? [];
        const pendingOperators = blueprint.pendingOperators ?? [];
        return [...approvedOperators, ...pendingOperators];
      });
      const operatorSet = new Set(operatorMap);
      return Array.from(operatorSet);
    }, [pendingBlueprints]),
  );

  const { execute: rejectServiceRequest, status: rejectStatus } =
    useServicesRejectTx();
  const { execute: approveServiceRequest, status: approveStatus } =
    useServicesApproveTx();

  const network = useNetworkStore((store) => store.network);

  const isEmpty = pendingBlueprints.length === 0;

  const assetIds = useMemo(() => {
    return pendingBlueprints.flatMap((instance) =>
      instance.securityRequirements.map((requirement) => requirement.asset),
    );
  }, [pendingBlueprints]);

  const { result: assetsMetadata } = useAssetsMetadata(assetIds);

  const columns = useMemo(() => {
    const baseColumns: AccessorKeyColumnDef<MonitoringServiceRequest, any>[] = [
      columnHelper.accessor('blueprint', {
        header: () => 'Blueprint',
        enableSorting: false,
        cell: (props) => {
          return (
            <TableCellWrapper className="p-0 min-h-fit">
              <div className="flex items-center gap-2 overflow-hidden">
                {props.row.original.blueprintData?.metadata?.logo ? (
                  <Avatar
                    size="lg"
                    className="min-w-12"
                    src={props.row.original.blueprintData?.metadata.logo}
                    alt={props.row.original.blueprintData?.metadata?.name}
                    sourceVariant="uri"
                  />
                ) : (
                  <Avatar
                    size="lg"
                    className="min-w-12"
                    value={props.row.original.blueprintData?.metadata?.name}
                    theme="substrate"
                  />
                )}
                <Typography
                  variant="body1"
                  fw="bold"
                  className="!text-blue-50 text-ellipsis whitespace-nowrap overflow-hidden"
                >
                  {props.row.original.blueprintData?.metadata?.name}
                </Typography>
              </div>
            </TableCellWrapper>
          );
        },
      }),
    ];

    if (isOperator) {
      baseColumns.push(
        columnHelper.accessor('pricing', {
          header: () => 'Pricing',
          cell: (props) => {
            return (
              <TableCellWrapper className="p-0 min-h-fit">
                {props.row.original.pricing
                  ? `$${getRoundedAmountString(props.row.original.pricing)}`
                  : EMPTY_VALUE_PLACEHOLDER}
              </TableCellWrapper>
            );
          },
        }),
        columnHelper.accessor('owner', {
          header: () => 'Deployer',
          cell: (props) => {
            const owner = props.row.original.owner;
            const ownerUrl = network.createExplorerAccountUrl(owner);

            return (
              <TableCellWrapper className="p-0 min-h-fit">
                {!ownerUrl ? (
                  EMPTY_VALUE_PLACEHOLDER
                ) : (
                  <>
                    <Avatar
                      sourceVariant="address"
                      value={owner.toString()}
                      theme="substrate"
                      size="md"
                    />
                    <Button
                      variant="link"
                      className="uppercase body4"
                      href={ownerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {operatorIdentityMap?.get(owner)?.name ??
                        shortenString(owner)}
                    </Button>
                  </>
                )}
              </TableCellWrapper>
            );
          },
        }),
        columnHelper.accessor('ttl', {
          header: () => 'Duration',
          cell: (props) => {
            return (
              <TableCellWrapper className="p-0 min-h-fit">
                {addCommasToNumber(props.row.original.ttl)} blocks
              </TableCellWrapper>
            );
          },
        }),
        columnHelper.accessor('requestId', {
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
        columnHelper.accessor('approvedOperators', {
          header: 'Approved Operators',
          cell: (props) => {
            return (
              <TableCellWrapper className="p-0 min-h-fit">
                <NestedOperatorCell
                  operators={props.row.original.approvedOperators}
                  operatorIdentityMap={operatorIdentityMap}
                />
              </TableCellWrapper>
            );
          },
        }),
        columnHelper.accessor('pendingOperators', {
          header: 'Pending Operators',
          cell: (props) => {
            return (
              <TableCellWrapper className="p-0 min-h-fit">
                <NestedOperatorCell
                  operators={props.row.original.pendingOperators}
                  operatorIdentityMap={operatorIdentityMap}
                />
              </TableCellWrapper>
            );
          },
        }),
        columnHelper.accessor('requestCreatedAtBlock', {
          header: 'Created At',
          cell: (props) => {
            return (
              <TableCellWrapper className="p-0 min-h-fit">
                {props.row.original.requestCreatedAtBlock ? (
                  <>
                    Block{' '}
                    {addCommasToNumber(
                      props.row.original.requestCreatedAtBlock,
                    )}
                  </>
                ) : (
                  EMPTY_VALUE_PLACEHOLDER
                )}
              </TableCellWrapper>
            );
          },
        }),
        columnHelper.accessor('requestId', {
          header: '',
          cell: (props) => {
            return (
              <TableCellWrapper removeRightBorder className="p-0 min-h-fit">
                <Dropdown>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="utility"
                      className="uppercase body4 w-full"
                      rightIcon={<ChevronDown className="!fill-blue-50" />}
                    >
                      Update
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownBody className="mt-2" side="bottom" align="center">
                    <DropdownMenuItem className="px-4 py-2 hover:bg-mono-170">
                      Instance Duration
                    </DropdownMenuItem>
                    <DropdownMenuItem className="px-4 py-2 hover:bg-mono-170">
                      Operators
                    </DropdownMenuItem>
                  </DropdownBody>
                </Dropdown>
              </TableCellWrapper>
            );
          },
        }),
      );
    }

    return baseColumns;
  }, [isOperator, assetsMetadata, operatorIdentityMap]);

  const table = useReactTable({
    data: pendingBlueprints,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => `PendingServiceRequest-${row.blueprint.toString()}`,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  const onCloseBlueprintRejectModal = useCallback(() => {
    setIsRejectConfirmationModalOpen(false);
    setSelectedRequest(null);
  }, [setIsRejectConfirmationModalOpen, setSelectedRequest]);

  const onConfirmReject = useCallback(async () => {
    if (!selectedRequest || !rejectServiceRequest) return;

    await rejectServiceRequest({
      requestId: selectedRequest.requestId,
    });
  }, [selectedRequest, rejectServiceRequest]);

  const onCloseBlueprintApproveModal = useCallback(() => {
    setIsApproveConfirmationModalOpen(false);
    setSelectedRequest(null);
  }, [setIsApproveConfirmationModalOpen, setSelectedRequest]);

  const onConfirmApprove = useCallback(
    async (data: ApprovalConfirmationFormFields) => {
      if (!selectedRequest || !approveServiceRequest) return;

      await approveServiceRequest(data);
    },
    [selectedRequest, approveServiceRequest],
  );

  return (
    <>
      <TangleCloudTable<MonitoringServiceRequest>
        title={pluralize('Running Instance', !isEmpty)}
        data={pendingBlueprints}
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
          assetsMetadata={assetsMetadata}
          status={approveStatus}
        />
      </Modal>
    </>
  );
};

PendingInstanceTable.displayName = 'PendingInstanceTable';
