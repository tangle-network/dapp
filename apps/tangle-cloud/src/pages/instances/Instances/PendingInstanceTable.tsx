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
  Typography,
} from '@tangle-network/ui-components';
import { TableStatusProps } from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import { TangleCloudTable } from '../../../components/tangleCloudTable/TangleCloudTable';
import { EInstanceStatus, InstanceMonitoringItem } from './type';
import { ChevronRight } from '@tangle-network/icons';

const columnHelper = createColumnHelper<InstanceMonitoringItem>();

const instanceMonitoringData: InstanceMonitoringItem[] = [
  {
    id: "1",
    blueprintId: "blueprint-001",
    blueprint: {
      id: "blueprint-001",
      name: "Blueprint A",
      uptime: 99.5,
      pricing: 0.05,
      pricingUnit: "USD/hour",
      instanceCount: 10,
      tvlInUsd: 5,
      author: "Author A",
      registrationParams: [],
      imgUrl: "https://example.com/image1.png",
      category: "Category A",
      description: "Description A",
      restakersCount: 100,
      operatorsCount: 5,
      tvl: "50000",
    },
    instance: {
      id: "instance-001",
      instanceId: "i-00annd2f38e3hk32",
      earned: 1500,
      earnedInUsd: 1500,
      uptime: 98.5,
      lastActive: "2025-02-27T14:30:00Z",
      imgUrl: "https://example.com/image1.png",
      status: EInstanceStatus.RUNNING,
    },
  },
  {
    id: "2",
    blueprintId: "blueprint-002",
    blueprint: {
      id: "blueprint-002",
      name: "Blueprint B",
      uptime: 99.0,
      pricing: 0.03,
      pricingUnit: "USD/hour",
      instanceCount: 8,
      tvlInUsd: 3,
      author: "Author B", 
      registrationParams: [],
      imgUrl: "https://example.com/image2.png",
      category: "Category B",
      description: "Description B",
      restakersCount: 150,
      operatorsCount: 3,
      tvl: "30000",
    },
    instance: {
      id: "instance-002",
      instanceId: "i-00annd2f38e3hk32",
      earned: 1000,
      earnedInUsd: 1000,
      uptime: 97.5,
      lastActive: "2025-02-27T14:30:00Z",
      imgUrl: "https://example.com/image2.png",
      status: EInstanceStatus.RUNNING,
    },
  },
];


export const PendingInstanceTable: FC = () => {
  const [instances, setInstances] =
    useState<InstanceMonitoringItem[]>(instanceMonitoringData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const loadingTableProps: Partial<TableStatusProps> = {};
  const emptyTableProps: Partial<TableStatusProps> = {};

  const isEmpty = instances.length === 0;

  /**
   * `h-12` is followed the `lg` size of `Avatar` component
   * to make the table cells have the same height
   */
  const commonCellClassName = 'h-12 flex items-center';
  const columns = useMemo(
    () => [
      columnHelper.accessor('instance', {
        header: () => 'Blueprint > Instance',
        cell: (props) => {
          return (
            <div className="flex items-center gap-2">
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
            </div>
          );
        },
      }),
      columnHelper.accessor('instance.id', {
        header: () => '',
        cell: (props) => {
          return (
            <div className={commonCellClassName}>
              <Button
                variant="link"
                size="sm"
                className="w-full uppercase"
                as="a"
                href={`/instances/${props.row.original.instance.id}`}
              >
                View
              </Button>
            </div>
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
      title={pluralize('Running Instance', !isEmpty)}
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

PendingInstanceTable.displayName = 'PendingInstanceTable';
