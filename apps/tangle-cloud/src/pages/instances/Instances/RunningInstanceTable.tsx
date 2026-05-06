import { useMemo, useState, useCallback, type FC } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Avatar,
  Button,
  Modal,
  Text,
} from '../../../components/sandbox/SandboxUi';
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

const EMPTY_VALUE_PLACEHOLDER = '-';

const columnHelper = createColumnHelper<ServiceWithBlueprint>();
const pluralize = (word: string, plural: boolean) =>
  plural ? `${word}s` : word;

export const RunningInstanceTable: FC = () => {
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
                  <Text
                    variant="body1"
                    fw="bold"
                    className="text-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    {service.blueprintData?.author || ''}
                  </Text>
                  <Text
                    variant="body2"
                    className="text-muted-foreground text-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    {service.blueprintData?.name || ''}
                  </Text>
                </div>
                <div>
                  <ChevronRight className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="w-4/12">
                  <Text
                    variant="body1"
                    fw="bold"
                    className="text-primary text-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    {service.serviceId
                      ? `Instance-${service.serviceId}`
                      : EMPTY_VALUE_PLACEHOLDER}
                  </Text>
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
                  <Button variant="utility" className="uppercase body4">
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
                  <Button variant="utility" className="uppercase body4">
                    Blueprint
                  </Button>
                </Link>

                {isOwner && (
                  <Button
                    variant="utility"
                    className="uppercase body4 text-destructive"
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
        emptyTableProps={{
          icon: 'Instances',
          title: 'No running instances',
          description: currentUserAddress
            ? 'Deploy a blueprint to create a service instance, then monitor operator approvals, jobs, and lifecycle events here.'
            : 'Connect a wallet to load your service instances, then deploy a blueprint when you are ready.',
          buttonText: currentUserAddress
            ? 'Browse Blueprints'
            : 'Connect Wallet',
          buttonProps: {
            onClick: () => {
              if (currentUserAddress) {
                window.location.assign('/blueprints');
                return;
              }

              const connectButton = document.querySelector<HTMLButtonElement>(
                '[data-testid="evm-connect-trigger"]',
              );
              connectButton?.click();
            },
          },
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
