import { Children, useMemo, type FC, useState } from 'react';
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
  IconWithTooltip,
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
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { NestedOperatorCell } from '../../../components/NestedOperatorCell';
import addCommasToNumber from '@tangle-network/ui-components/utils/addCommasToNumber';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import useAssetsMetadata from '@tangle-network/tangle-shared-ui/hooks/useAssetsMetadata';
import RejectConfirmationModel from './UpdateBlueprintModel/RejectConfirmationModal';
import ApproveConfirmationModel from './UpdateBlueprintModel/ApproveConfirmationModal';
import useServiceApi from '../../../data/blueprints/useServiceApi';
import { ApprovalConfirmationFormFields } from '../../../types/approvalConfirmationForm';
import usePendingServiceRequest from '@tangle-network/tangle-shared-ui/data/blueprints/usePendingServiceRequest';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
import useIdentities from '@tangle-network/tangle-shared-ui/hooks/useIdentities';
import useRoleStore from '../../../stores/roleStore';
const columnHelper = createColumnHelper<MonitoringServiceRequest>();

export const PendingInstanceTable: FC = () => {
  const isOperator = useRoleStore.getState().isOperator();
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

  const serviceApi = useServiceApi();

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
            <TableCellWrapper>
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
        columnHelper.accessor('securityRequirements', {
          header: () => 'Pricing',
          cell: (props) => {
            return (
              <TableCellWrapper>
                <IconWithTooltip
                  overrideTooltipTriggerProps={{
                    className: 'flex flex-col gap-2',
                  }}
                  overrideTooltipBodyProps={{
                    className: 'max-w-fit',
                  }}
                  icon={Children.toArray(
                    props.row.original.securityRequirements.map(
                      (requirement) => {
                        return (
                          <div className="flex items-center gap-2">
                            <LsTokenIcon
                              name={
                                assetsMetadata
                                  ?.get(requirement.asset)
                                  ?.symbol?.toString() ?? ''
                              }
                              size="lg"
                            />
                            <Typography
                              variant="para1"
                              className="whitespace-nowrap"
                            >
                              {requirement.minExposurePercent}% -{' '}
                              {requirement.maxExposurePercent}%
                            </Typography>
                          </div>
                        );
                      },
                    ),
                  )}
                  content={Children.toArray(
                    props.row.original.securityRequirements.map(
                      (requirement) => {
                        const assetMetadata = assetsMetadata?.get(requirement.asset);
                        return (
                          <div className="flex items-center gap-2">
                            <LsTokenIcon
                              name={assetMetadata?.symbol?.toString() ?? ''}
                              size="lg"
                            />
                            <Typography
                              variant="para1"
                              className="whitespace-nowrap"
                            >
                              {assetMetadata?.name} is required to spend
                            </Typography>
                            <Typography
                              variant="para1"
                              className="whitespace-nowrap"
                            >
                              {requirement.minExposurePercent}% -{' '}
                              {requirement.maxExposurePercent}%
                            </Typography>
                          </div>
                        );
                      },
                    ),
                  )}
                />
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
              <TableCellWrapper>
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
              <TableCellWrapper>
                {addCommasToNumber(props.row.original.ttl)} blocks
              </TableCellWrapper>
            );
          },
        }),
        columnHelper.accessor('requestId', {
          header: () => '',
          cell: (props) => {
            return (
              <TableCellWrapper removeRightBorder>
                <div className="flex gap-2">
                  <Button
                    variant="utility"
                    className="uppercase body4"
                    onClick={() => {
                      setIsApproveConfirmationModalOpen(true);
                      setSelectedRequest(props.row.original);
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="utility"
                    className="uppercase body4"
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
              <TableCellWrapper>
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
              <TableCellWrapper>
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
              <TableCellWrapper>
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
              <TableCellWrapper removeRightBorder>
                <Dropdown>
                  <DropdownButton
                    isFullWidth
                    size="md"
                    label={
                      <Button
                        variant="utility"
                        className="uppercase body4"
                        rightIcon={<ChevronDown className="!fill-blue-50" />}
                      >
                        Update
                      </Button>
                    }
                    isHideArrowIcon
                    className="min-w-[auto] border-none !bg-transparent"
                  />
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
  }, [isOperator]);

  const table = useReactTable({
    data: pendingBlueprints,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => `PendingServiceRequest-${row.blueprint.toString()}`,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  const onCloseBlueprintRejectModal = () => {
    setIsRejectConfirmationModalOpen(false);
    setSelectedRequest(null);
  };

  const onConfirmReject = async (): Promise<boolean> => {
    if (!selectedRequest || !serviceApi) return false;

    return serviceApi.rejectServiceRequest(selectedRequest.requestId);
  };

  const onCloseBlueprintApproveModal = () => {
    setIsApproveConfirmationModalOpen(false);
    setSelectedRequest(null);
  };

  const onConfirmApprove = async (
    data: ApprovalConfirmationFormFields,
  ): Promise<boolean> => {
    if (!selectedRequest || !serviceApi) return false;

    return serviceApi.approveServiceRequest(
      data.requestId,
      data.securityCommitment,
    );
  };

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
        />
      </Modal>
    </>
  );
};

PendingInstanceTable.displayName = 'PendingInstanceTable';
