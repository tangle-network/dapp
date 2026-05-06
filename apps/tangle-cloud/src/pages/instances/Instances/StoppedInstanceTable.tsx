import { useMemo, type FC } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Avatar, Button, Text } from '../../../components/sandbox/SandboxUi';
import { TangleCloudTable } from '../../../components/tangleCloudTable/TangleCloudTable';
import { ChevronRight } from '@tangle-network/icons';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import { PagePath } from '../../../types';
import { Link } from 'react-router';
import useEvmOperatorInfo from '../../../hooks/useEvmOperatorInfo';
import {
  useServicesByOperator,
  useBlueprintMap,
  type Service,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';

// Service with blueprint metadata
interface ServiceWithBlueprint extends Service {
  blueprintData?: Blueprint;
}

const EMPTY_VALUE_PLACEHOLDER = '-';

const columnHelper = createColumnHelper<ServiceWithBlueprint>();
const pluralize = (word: string, plural: boolean) =>
  plural ? `${word}s` : word;

export const StoppedInstanceTable: FC = () => {
  const { isOperator, operatorAddress } = useEvmOperatorInfo();

  // Fetch terminated services where user is an operator
  const {
    data: stoppedServices,
    isLoading,
    error,
  } = useServicesByOperator(
    isOperator ? (operatorAddress ?? undefined) : undefined,
    { status: 'TERMINATED' },
  );

  // Fetch blueprint metadata
  const { blueprints: blueprintMap } = useBlueprintMap();

  // Combine services with blueprint data
  const stoppedInstances = useMemo<ServiceWithBlueprint[]>(() => {
    if (!stoppedServices) return [];

    return stoppedServices.map((service) => ({
      ...service,
      blueprintData: blueprintMap?.get(service.blueprintId.toString()),
    }));
  }, [stoppedServices, blueprintMap]);

  const isEmpty = stoppedInstances.length === 0;

  const columns = useMemo(
    () => [
      columnHelper.accessor('serviceId', {
        header: () => 'Blueprint > Instance',
        enableSorting: false,
        cell: (props) => {
          const service = props.row.original;
          return (
            <TableCellWrapper className="p-0 min-h-fit">
              <div className="flex items-center gap-2 w-full">
                {service.blueprintData?.imgUrl ? (
                  <Avatar
                    size="lg"
                    className="min-w-12"
                    src={service.blueprintData.imgUrl}
                    alt={service.serviceId.toString()}
                    sourceVariant="uri"
                  />
                ) : (
                  <Avatar
                    size="lg"
                    className="min-w-12"
                    sourceVariant="address"
                    value={service.owner}
                    theme="ethereum"
                  />
                )}
                <div className="w-4/12">
                  <Text
                    variant="body1"
                    fw="bold"
                    className="text-primary text-ellipsis whitespace-nowrap overflow-hidden"
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
                  <ChevronRight className="w-6 h-6" />
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
          return (
            <TableCellWrapper removeRightBorder className="p-0 min-h-fit">
              <Link
                to={PagePath.BLUEPRINTS_DETAILS.replace(
                  ':id',
                  props.row.original.blueprintId.toString(),
                )}
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                <Button variant="utility" className="uppercase body4">
                  View
                </Button>
              </Link>
            </TableCellWrapper>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: stoppedInstances,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => `StoppedInstance-${row.blueprintId}-${row.serviceId}`,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  return (
    <TangleCloudTable<ServiceWithBlueprint>
      title={pluralize('Stopped Instance', !isEmpty)}
      data={stoppedInstances}
      error={error}
      isLoading={isLoading}
      tableProps={table}
      tableConfig={{
        tableClassName: 'min-w-[1000px]',
      }}
    />
  );
};

StoppedInstanceTable.displayName = 'StoppedInstanceTable';
