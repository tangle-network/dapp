import { useMemo, type FC } from 'react';
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
} from '@tangle-network/ui-components';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import { TangleCloudTable } from '../../../components/tangleCloudTable/TangleCloudTable';
import { ChevronRight } from '@tangle-network/icons';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import { Link } from 'react-router';
import { PagePath } from '../../../types';
import {
  useAllServices,
  useBlueprintMap,
  useOperatorRegistrations,
  type Service,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';

interface ServiceWithBlueprint extends Service {
  blueprintData?: Blueprint;
}

const columnHelper = createColumnHelper<ServiceWithBlueprint>();

export const AllServicesTable: FC = () => {
  const {
    data: allServices,
    isLoading: isLoadingServices,
    error,
  } = useAllServices({ status: 'ACTIVE' });

  const { blueprints: blueprintMap, isLoading: isLoadingBlueprints } =
    useBlueprintMap();

  const { data: operatorRegistrations, isLoading: isLoadingRegistrations } =
    useOperatorRegistrations();

  const isLoading =
    isLoadingServices || isLoadingBlueprints || isLoadingRegistrations;

  const registeredBlueprintIds = useMemo(() => {
    if (!operatorRegistrations) return new Set<string>();

    return new Set(
      operatorRegistrations
        .filter((reg) => reg.active)
        .map((reg) => reg.blueprintId.toString()),
    );
  }, [operatorRegistrations]);

  const servicesWithBlueprints = useMemo<ServiceWithBlueprint[]>(() => {
    if (!allServices) return [];

    return allServices
      .filter((service) =>
        registeredBlueprintIds.has(service.blueprintId.toString()),
      )
      .map((service) => ({
        ...service,
        blueprintData: blueprintMap?.get(service.blueprintId.toString()),
      }));
  }, [allServices, blueprintMap, registeredBlueprintIds]);

  const isEmpty = servicesWithBlueprints.length === 0;

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
                    {service.serviceId !== undefined
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
                    View
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
              </div>
            </TableCellWrapper>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: servicesWithBlueprints,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => `AllService-${row.blueprintId}-${row.serviceId}`,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  return (
    <TangleCloudTable<ServiceWithBlueprint>
      title={pluralize('Service', !isEmpty)}
      data={servicesWithBlueprints}
      error={error}
      isLoading={isLoading}
      tableProps={table}
      tableConfig={{
        tableClassName: 'min-w-[1000px]',
      }}
    />
  );
};

AllServicesTable.displayName = 'AllServicesTable';
