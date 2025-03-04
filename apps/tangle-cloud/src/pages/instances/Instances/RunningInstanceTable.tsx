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
  CircularProgress,
  EMPTY_VALUE_PLACEHOLDER,
  EnergyChipColors,
  EnergyChipStack,
  getRoundedAmountString,
  NO_METRICS_PLACEHOLDER,
  Typography,
} from '@tangle-network/ui-components';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import { TangleCloudTable } from '../../../components/tangleCloudTable/TangleCloudTable';
import { InstancesTabProps } from './type';
import { format } from 'date-fns';
import { ChevronRight } from '@tangle-network/icons';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import { Link } from 'react-router';
import { PagePath } from '../../../types';
import { MonitoringBlueprint } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';

const columnHelper =
  createColumnHelper<MonitoringBlueprint['services'][number]>();

const MOCK_CURRENT_BLOCK = 5000;

export const RunningInstanceTable: FC<InstancesTabProps> = ({
  data,
  isLoading,
  error,
}) => {
  const isEmpty = data.length === 0;

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: () => 'Blueprint > Instance',
        enableSorting: false,
        cell: (props) => {
          return (
            <TableCellWrapper className=''>
              <div className="flex items-center gap-2 w-full">
                {props.row.original.imgUrl ? (
                  <Avatar
                    size="lg"
                    className="min-w-12"
                    src={props.row.original.imgUrl}
                    alt={props.row.original.id.toString()}
                    sourceVariant="uri"
                  />
                ) : (
                  <Avatar
                    size="lg"
                    className="min-w-12"
                    value={props.row.original.instanceId?.substring(0, 2)}
                    theme="substrate"
                  />
                )}
                <div className='w-4/12'>
                  <Typography
                    variant="body1"
                    fw="bold"
                    className="!text-blue-50 text-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    {props.row.original.blueprintData?.metadata?.author || ''}
                  </Typography>
                  <Typography
                    variant="body2"
                    fw="normal"
                    className="!text-mono-100 text-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    {props.row.original.blueprintData?.metadata?.name || ''}
                  </Typography>
                </div>
                <div>
                  <ChevronRight className="w-6 h-6" />
                </div>
                <div className='w-4/12'>
                  <Typography
                    variant="body1"
                    fw="bold"
                    className="!text-blue-50 text-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    {props.row.original.id || ''}
                  </Typography>
                  <Typography
                    variant="body2"
                    fw="normal"
                    className="!text-mono-100 text-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    {props.row.original.instanceId || ''}
                  </Typography>
                </div>
              </div>
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('ttl', {
        header: () => 'Time Remaining',
        cell: (props) => {
          let createdAtBlock = 0,
            totalTtl = 0,
            timeRemaining = 0,
            progress = 0,
            tooltip = NO_METRICS_PLACEHOLDER;
          if (props.row.original.createdAtBlock && props.row.original.ttl) {
            createdAtBlock = props.row.original.createdAtBlock;
            totalTtl = createdAtBlock + props.row.original.ttl;
            timeRemaining = totalTtl - MOCK_CURRENT_BLOCK;
            const isCompleted = timeRemaining < 0;
            progress = isCompleted ? 1 : timeRemaining / totalTtl;
            tooltip = isCompleted
              ? 'Completed'
              : `${timeRemaining} blocks remaining`;
          }

          return (
            <TableCellWrapper>
              <CircularProgress
                progress={progress}
                size="md"
                tooltip={tooltip}
              />
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('earned', {
        header: () => 'Earned',
        cell: (props) => {
          return (
            <TableCellWrapper>
              {props.row.original.earned
                ? `$${getRoundedAmountString(props.row.original.earned)}`
                : EMPTY_VALUE_PLACEHOLDER}
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('uptime', {
        header: () => 'Uptime',
        cell: (props) => {
          const DEFAULT_STACK = 10;
          const DEFAULT_PERCENTAGE = 100;
          const numberOfActiveChips = !props.row.original.uptime
            ? 0
            : Math.round(
                (props.row.original.uptime * DEFAULT_STACK) /
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
                label={`${props.row.original.uptime || EMPTY_VALUE_PLACEHOLDER}%`}
              />
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('lastActive', {
        header: () => 'Last Active',
        cell: (props) => {
          return (
            <TableCellWrapper>
              <Typography variant="body1" fw="normal">
                {props.row.original.lastActive
                  ? format(props.row.original.lastActive, 'yy/MM/dd HH:mm')
                  : EMPTY_VALUE_PLACEHOLDER}
              </Typography>
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('id', {
        header: () => '',
        cell: (props) => {
          return (
            <TableCellWrapper removeRightBorder>
              <Link
                to={PagePath.BLUEPRINTS_DETAILS.replace(
                  ':id',
                  props.row.original.blueprint.toString(),
                )}
                target="_blank"
                rel="noopener noreferrer"
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
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id.toString(),
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  return (
    <TangleCloudTable<MonitoringBlueprint['services'][number]>
      title={pluralize('Running Instance', !isEmpty)}
      data={data}
      error={error}
      isLoading={isLoading}
      loadingTableProps={{}}
      emptyTableProps={{}}
      tableProps={table}
      tableConfig={{
        tableClassName: 'min-w-[1000px]',
      }}
    />
  );
};

RunningInstanceTable.displayName = 'RunningInstanceTable';
