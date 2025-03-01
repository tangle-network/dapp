import { useMemo, useState, type FC } from 'react';
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
  EnergyChipColors,
  EnergyChipStack,
  getRoundedAmountString,
  Typography,
} from '@tangle-network/ui-components';
import { TableStatusProps } from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import { TangleCloudTable } from '../../../components/tangleCloudTable/TangleCloudTable';
import { InstanceStatus, InstanceMonitoringItem } from './type';
import { format } from 'date-fns';
import { ChevronRight } from '@tangle-network/icons';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';

const columnHelper = createColumnHelper<InstanceMonitoringItem>();

const instanceMonitoringData: InstanceMonitoringItem[] = [
  {
    id: '1',
    blueprintId: 'blueprint-001',
    blueprint: {
      id: 'blueprint-001',
      name: 'Blueprint A',
      uptime: 99.5,
      pricing: 0.05,
      pricingUnit: 'USD/hour',
      instanceCount: 10,
      tvlInUsd: 5,
      author: 'Author A',
      registrationParams: [],
      imgUrl: 'https://example.com/image1.png',
      category: 'Category A',
      description: 'Description A',
      restakersCount: 100,
      operatorsCount: 5,
      tvl: '50000',
    },
    instance: {
      id: 'instance-001',
      instanceId: 'i-00annd2f38e3hk32',
      earned: 1500,
      earnedInUsd: 1500,
      uptime: 98.5,
      lastActive: '2025-02-27T14:30:00Z',
      imgUrl: 'https://example.com/image1.png',
      status: InstanceStatus.RUNNING,
    },
  },
  {
    id: '2',
    blueprintId: 'blueprint-002',
    blueprint: {
      id: 'blueprint-002',
      name: 'Blueprint B',
      uptime: 99.0,
      pricing: 0.03,
      pricingUnit: 'USD/hour',
      instanceCount: 8,
      tvlInUsd: 3,
      author: 'Author B',
      registrationParams: [],
      imgUrl: 'https://example.com/image2.png',
      category: 'Category B',
      description: 'Description B',
      restakersCount: 150,
      operatorsCount: 3,
      tvl: '30000',
    },
    instance: {
      id: 'instance-002',
      instanceId: 'i-00annd2f38e3hk32',
      earned: 1000,
      earnedInUsd: 1000,
      uptime: 97.5,
      lastActive: '2025-02-27T14:30:00Z',
      imgUrl: 'https://example.com/image2.png',
      status: InstanceStatus.RUNNING,
    },
  },
];

export const StoppedInstanceTable: FC = () => {
  // TODO: Remove mock data
  const [instances] = useState<InstanceMonitoringItem[]>(
    instanceMonitoringData,
  );
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);
  const loadingTableProps: Partial<TableStatusProps> = {};
  const emptyTableProps: Partial<TableStatusProps> = {};

  const isEmpty = instances.length === 0;

  const columns = useMemo(
    () => [
      columnHelper.accessor('instance', {
        header: () => 'Blueprint > Instance',
        cell: (props) => {
          return (
            <TableCellWrapper>
              {props.row.original.blueprint.imgUrl ? (
                <Avatar
                  size="lg"
                  className="min-w-12"
                  src={props.row.original.blueprint.imgUrl}
                  alt={props.row.original.blueprint.name}
                  sourceVariant="uri"
                />
              ) : (
                <Avatar
                  size="lg"
                  className="min-w-12"
                  fallback={props.row.original.blueprint.name.substring(0, 2)}
                  theme="substrate"
                />
              )}
              <div>
                <Typography
                  variant="body1"
                  fw="bold"
                  className="!text-blue-50 text-ellipsis whitespace-nowrap overflow-hidden"
                >
                  {props.row.original.blueprint.author}
                </Typography>
                <Typography
                  variant="body2"
                  fw="normal"
                  className="!text-mono-100 text-ellipsis whitespace-nowrap overflow-hidden"
                >
                  {props.row.original.blueprint.id}
                </Typography>
              </div>
              <div>
                <ChevronRight className="w-6 h-6" />
              </div>
              <div>
                <Typography
                  variant="body1"
                  fw="bold"
                  className="!text-blue-50 text-ellipsis whitespace-nowrap overflow-hidden"
                >
                  {props.row.original.instance.id}
                </Typography>
                <Typography
                  variant="body2"
                  fw="normal"
                  className="!text-mono-100 text-ellipsis whitespace-nowrap overflow-hidden"
                >
                  {props.row.original.instance.instanceId}
                </Typography>
              </div>
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('instance.earnedInUsd', {
        header: () => 'Earned',
        cell: (props) => {
          return (
            <TableCellWrapper>
              {props.row.original.instance.earnedInUsd
                ? `$${getRoundedAmountString(props.row.original.instance.earnedInUsd)}`
                : EMPTY_VALUE_PLACEHOLDER}
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('instance.uptime', {
        header: () => 'Uptime',
        cell: (props) => {
          const DEFAULT_STACK = 10;
          const DEFAULT_PERCENTAGE = 100;
          const numberOfActiveChips = !props.row.original.instance.uptime
            ? 0
            : Math.round(
                (props.row.original.instance.uptime * DEFAULT_STACK) /
                  DEFAULT_PERCENTAGE,
              );

          const activeColors = Array.from({ length: numberOfActiveChips }).fill(
            EnergyChipColors.GREEN,
          );
          const inactiveColors = Array.from({
            length: DEFAULT_STACK - numberOfActiveChips,
          }).fill(EnergyChipColors.GREY);
          const colors = [...activeColors, ...inactiveColors];

          return (
            <TableCellWrapper>
              <EnergyChipStack
                colors={colors as EnergyChipColors[]}
                label={`${props.row.original.instance.uptime || EMPTY_VALUE_PLACEHOLDER}%`}
              />
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('instance.lastActive', {
        header: () => 'Last Active',
        cell: (props) => {
          return (
            <TableCellWrapper>
              <Typography variant="body1" fw="normal">
                {props.row.original.instance.lastActive
                  ? format(
                      props.row.original.instance.lastActive,
                      'yy/MM/dd HH:mm',
                    )
                  : EMPTY_VALUE_PLACEHOLDER}
              </Typography>
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('instance.id', {
        header: () => '',
        cell: (props) => {
          return (
            <TableCellWrapper removeRightBorder>
              <Button
                variant="link"
                size="sm"
                className="w-full uppercase"
                as="a"
                href={`/instances/${props.row.original.instance.id}`}
              >
                View
              </Button>
            </TableCellWrapper>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: instances,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  return (
    <TangleCloudTable<InstanceMonitoringItem>
      title={pluralize('Stopped Instance', !isEmpty)}
      data={instances}
      error={error}
      isLoading={isLoading}
      loadingTableProps={loadingTableProps}
      emptyTableProps={emptyTableProps}
      tableProps={table}
      tableConfig={{
        tableClassName: 'min-w-[1000px]',
      }}
    />
  );
};

StoppedInstanceTable.displayName = 'StoppedInstanceTable';
