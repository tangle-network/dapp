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
import { MonitoringBlueprint } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';
import { PagePath } from '../../../types';
import { Link } from 'react-router';
import useOperatorInfo from '@tangle-network/tangle-shared-ui/hooks/useOperatorInfo';
import useStoppedInstances from '@tangle-network/tangle-shared-ui/data/blueprints/useStoppedInstances';

const columnHelper =
  createColumnHelper<MonitoringBlueprint['services'][number]>();

export const StoppedInstanceTable: FC = () => {
  const { operatorAddress } = useOperatorInfo();
  const {
    result: stoppedInstances,
    isEmpty,
    isLoading,
    error,
  } = useStoppedInstances(operatorAddress);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: () => 'Blueprint > Instance',
        enableSorting: false,
        cell: (props) => {
          return (
            <TableCellWrapper className="p-0 min-h-fit">
              <div className="flex items-center gap-2 w-full">
                {props.row.original.blueprintData?.metadata?.logo ? (
                  <Avatar
                    size="lg"
                    className="min-w-12"
                    src={props.row.original.blueprintData.metadata?.logo}
                    alt={props.row.original.id.toString()}
                    sourceVariant="uri"
                  />
                ) : (
                  <Avatar
                    size="lg"
                    className="min-w-12"
                    value={props.row.original.id.toString()}
                    theme="substrate"
                  />
                )}
                <div className="w-4/12">
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
                <div className="w-4/12">
                  <Typography
                    variant="body1"
                    fw="bold"
                    className="!text-blue-50 text-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    {props.row.original.id
                      ? `Instance-${props.row.original.id}`
                      : EMPTY_VALUE_PLACEHOLDER}
                  </Typography>
                  <Typography
                    variant="body2"
                    fw="normal"
                    className="!text-mono-100 text-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    {props.row.original.externalInstanceId ||
                      EMPTY_VALUE_PLACEHOLDER}
                  </Typography>
                </div>
              </div>
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('id', {
        header: () => '',
        cell: (props) => {
          return (
            <TableCellWrapper removeRightBorder className="p-0 min-h-fit">
              <Link
                to={PagePath.BLUEPRINTS_DETAILS.replace(
                  ':id',
                  props.row.original.blueprint.toString(),
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
    getRowId: (row) =>
      `StoppedInstance-${row.blueprint.toString()}-${row.id.toString()}`,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  return (
    <TangleCloudTable<MonitoringBlueprint['services'][number]>
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
