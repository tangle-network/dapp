import {
  useMemo,
  useState,
  useCallback,
  type FC,
  Dispatch,
  SetStateAction,
} from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Avatar,
  Button,
  EMPTY_VALUE_PLACEHOLDER,
  Typography,
  Modal,
} from '@tangle-network/ui-components';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import { TangleCloudTable } from '../../../components/tangleCloudTable/TangleCloudTable';
import { ChevronRight } from '@tangle-network/icons';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import { Link } from 'react-router';
import { PagePath } from '../../../types';
import { useAccount } from 'wagmi';
import {
  useServicesByOwner,
  useServicesByOperator,
  useBlueprintMap,
  type Service,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import useEvmOperatorInfo from '../../../hooks/useEvmOperatorInfo';
import TerminateConfirmationModal from './UpdateBlueprintModel/TerminateConfirmationModal';
import { useServiceTerminateTx } from '../../../data/services/useServiceTerminateTx';

// Combined service with blueprint metadata
interface ServiceWithBlueprint extends Service {
  blueprintData?: Blueprint;
}

const columnHelper = createColumnHelper<ServiceWithBlueprint>();

interface RunningInstanceTableProps {
  refreshTrigger: number;
  setRefreshTrigger: Dispatch<SetStateAction<number>>;
}

export const RunningInstanceTable: FC<RunningInstanceTableProps> = () => {
  const { address: currentUserAddress } = useAccount();
  const { isOperator, operatorAddress } = useEvmOperatorInfo();

  // Fetch services owned by user
  const {
    data: ownedServices,
    isLoading: isLoadingOwned,
    error: ownedError,
  } = useServicesByOwner(currentUserAddress, { status: 'ACTIVE' });

  // Fetch services where user is an operator
  const {
    data: operatorServices,
    isLoading: isLoadingOperator,
    error: operatorError,
  } = useServicesByOperator(
    isOperator ? (operatorAddress ?? undefined) : undefined,
    { status: 'ACTIVE' },
  );

  // Fetch blueprint metadata
  const { blueprints: blueprintMap, isLoading: isLoadingBlueprints } =
    useBlueprintMap();

  const isLoading = isLoadingOwned || isLoadingOperator || isLoadingBlueprints;
  const error = ownedError || operatorError;

  // Combine and deduplicate services
  const servicesWithBlueprints = useMemo<ServiceWithBlueprint[]>(() => {
    const serviceMap = new Map<string, ServiceWithBlueprint>();

    // Add owned services
    ownedServices?.forEach((service) => {
      const blueprintData = blueprintMap?.get(service.blueprintId.toString());
      serviceMap.set(service.id, {
        ...service,
        blueprintData,
      });
    });

    // Add operator services (dedupe by ID)
    operatorServices?.forEach((service) => {
      if (!serviceMap.has(service.id)) {
        const blueprintData = blueprintMap?.get(service.blueprintId.toString());
        serviceMap.set(service.id, {
          ...service,
          blueprintData,
        });
      }
    });

    return Array.from(serviceMap.values());
  }, [ownedServices, operatorServices, blueprintMap]);

  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] =
    useState<ServiceWithBlueprint | null>(null);

  const { execute: terminateServiceInstance, status: terminateStatus } =
    useServiceTerminateTx();

  const isEmpty = servicesWithBlueprints.length === 0;

  const handleTerminateClick = useCallback((instance: ServiceWithBlueprint) => {
    setSelectedInstance(instance);
    setIsTerminateModalOpen(true);
  }, []);

  const handleCloseTerminateModal = useCallback(() => {
    setIsTerminateModalOpen(false);
    setSelectedInstance(null);
  }, []);

  const handleConfirmTerminate = useCallback(async () => {
    if (!selectedInstance || !terminateServiceInstance) return;

    await terminateServiceInstance({
      serviceId: selectedInstance.serviceId,
    });
  }, [selectedInstance, terminateServiceInstance]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('serviceId', {
        header: () => 'Blueprint > Instance',
        enableSorting: false,
        cell: (props) => {
          const service = props.row.original;
          return (
            <TableCellWrapper className="p-3 min-h-fit">
              <div className="flex items-center gap-3 w-11/12">
                {service.blueprintData?.imgUrl ? (
                  <Avatar
                    size="lg"
                    className="min-w-12 shadow-sm"
                    src={service.blueprintData.imgUrl}
                    alt={service.serviceId.toString()}
                    sourceVariant="uri"
                  />
                ) : (
                  <Avatar
                    size="lg"
                    className="min-w-12 shadow-sm"
                    sourceVariant="address"
                    value={service.owner}
                    theme="ethereum"
                  />
                )}
                <div className="w-4/12">
                  <Typography
                    variant="body1"
                    fw="bold"
                    className="text-mono-200 dark:text-mono-0 text-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    {service.blueprintData?.author || ''}
                  </Typography>
                  <Typography
                    variant="body2"
                    fw="normal"
                    className="text-mono-140 dark:text-mono-80 text-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    {service.blueprintData?.name || ''}
                  </Typography>
                </div>
                <div>
                  <ChevronRight className="w-6 h-6 text-mono-120 dark:text-mono-100" />
                </div>
                <div className="w-4/12">
                  <Typography
                    variant="body1"
                    fw="bold"
                    className="text-blue-70 dark:text-blue-40 text-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    {service.serviceId
                      ? `Instance-${service.serviceId}`
                      : EMPTY_VALUE_PLACEHOLDER}
                  </Typography>
                </div>
              </div>
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('serviceId', {
        id: 'actions',
        header: () => '',
        cell: (props) => {
          const service = props.row.original;
          const isOwner =
            currentUserAddress?.toLowerCase() === service.owner.toLowerCase();

          return (
            <TableCellWrapper removeRightBorder className="p-3 min-h-fit">
              <div className="flex gap-3">
                <Link
                  to={PagePath.SERVICE_DETAILS.replace(
                    ':id',
                    service.serviceId.toString(),
                  )}
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <Button
                    variant="utility"
                    className="uppercase body4 bg-purple-10 dark:bg-purple-120 text-purple-70 dark:text-purple-40 hover:bg-purple-20 dark:hover:bg-purple-110 border border-purple-30 dark:border-purple-100 transition-all duration-200"
                  >
                    Manage
                  </Button>
                </Link>

                <Link
                  to={PagePath.BLUEPRINTS_DETAILS.replace(
                    ':id',
                    service.blueprintId.toString(),
                  )}
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <Button
                    variant="utility"
                    className="uppercase body4 bg-blue-10 dark:bg-blue-120 text-blue-70 dark:text-blue-40 hover:bg-blue-20 dark:hover:bg-blue-110 border border-blue-30 dark:border-blue-100 transition-all duration-200"
                  >
                    Blueprint
                  </Button>
                </Link>

                {isOwner && (
                  <Button
                    variant="utility"
                    className="uppercase body4 bg-red-10 dark:bg-red-120 text-red-70 dark:text-red-40 hover:bg-red-20 dark:hover:bg-red-110 border border-red-30 dark:border-red-100 transition-all duration-200"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleTerminateClick(service);
                    }}
                  >
                    Terminate
                  </Button>
                )}
              </div>
            </TableCellWrapper>
          );
        },
      }),
    ],
    [handleTerminateClick, currentUserAddress],
  );

  const table = useReactTable({
    data: servicesWithBlueprints,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => `RunningInstance-${row.blueprintId}-${row.serviceId}`,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  return (
    <>
      <TangleCloudTable<ServiceWithBlueprint>
        title={pluralize('Running Instance', !isEmpty)}
        data={servicesWithBlueprints}
        error={error}
        isLoading={isLoading}
        tableProps={table}
        tableConfig={{
          tableClassName: 'min-w-[1000px]',
        }}
      />

      <Modal open={isTerminateModalOpen} onOpenChange={setIsTerminateModalOpen}>
        <TerminateConfirmationModal
          onClose={handleCloseTerminateModal}
          onConfirm={handleConfirmTerminate}
          selectedInstance={selectedInstance}
          status={terminateStatus}
        />
      </Modal>
    </>
  );
};

RunningInstanceTable.displayName = 'RunningInstanceTable';
