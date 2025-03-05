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
  getRoundedAmountString,
  isEvmAddress,
  shortenString,
  toSubstrateAddress,
  Typography,
} from '@tangle-network/ui-components';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import { TangleCloudTable } from '../../../components/tangleCloudTable/TangleCloudTable';
import { ChevronRight } from '@tangle-network/icons';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import { Link } from 'react-router';
import { MonitoringBlueprint } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';
import { InstancesTabProps } from './type';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';

const columnHelper =
  createColumnHelper<MonitoringBlueprint['services'][number]>();

export const PendingInstanceTable: FC<InstancesTabProps> = ({
  data,
  isLoading,
  error,
}) => {
  const network = useNetworkStore((store) => store.network);

  const isEmpty = data.length === 0;

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: () => 'Blueprint > Instance',
        enableSorting: false,
        cell: (props) => {
          return (
            <TableCellWrapper>
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
      columnHelper.accessor('blueprintData.pricing', {
        header: () => 'Pricing',
        cell: (props) => {
          return (
            <TableCellWrapper>
              {props.row.original.blueprintData?.pricing
                ? `$${getRoundedAmountString(props.row.original.blueprintData.pricing)}`
                : EMPTY_VALUE_PLACEHOLDER}
              &nbsp;/&nbsp;
              {props.row.original.blueprintData?.pricingUnit
                ? props.row.original.blueprintData.pricingUnit
                : EMPTY_VALUE_PLACEHOLDER}
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('ownerAccount', {
        header: () => 'Deployer',
        cell: (props) => {
          return (
            <TableCellWrapper>
              {!props.row.original.ownerAccount ? (
                EMPTY_VALUE_PLACEHOLDER
              ) : (
                <Link
                  to={
                    network.createExplorerAccountUrl(
                      isEvmAddress(props.row.original.ownerAccount)
                        ? props.row.original.ownerAccount
                        : toSubstrateAddress(props.row.original.ownerAccount),
                    ) ?? '#'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="link" className="uppercase body4">
                    {shortenString(props.row.original.ownerAccount)}
                  </Button>
                </Link>
              )}
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('id', {
        header: () => '',
        cell: () => {
          return (
            <TableCellWrapper removeRightBorder className="max-w-24">
              <div className="flex gap-2">
                <Button variant="utility" className="uppercase body4">
                  Approve
                </Button>
                <Button variant="utility" className="uppercase body4">
                  Reject
                </Button>
              </div>
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
      tableProps={table}
      tableConfig={{
        tableClassName: 'min-w-[1000px]',
      }}
    />
  );
};

PendingInstanceTable.displayName = 'PendingInstanceTable';
