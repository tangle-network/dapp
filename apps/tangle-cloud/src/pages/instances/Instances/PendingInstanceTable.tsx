import { useMemo, type FC } from 'react';
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
  getRoundedAmountString,
  isEvmAddress,
  shortenString,
  toSubstrateAddress,
  Typography,
} from '@tangle-network/ui-components';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import { TangleCloudTable } from '../../../components/tangleCloudTable/TangleCloudTable';
import { ChevronDown, ChevronRight } from '@tangle-network/icons';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import { Link } from 'react-router';
import { MonitoringBlueprint } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';
import { InstancesTabProps } from './type';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { NestedOperatorCell } from '../../../components/NestedOperatorCell';
import addCommasToNumber from '@tangle-network/ui-components/utils/addCommasToNumber';

type MonitoringBlueprintServiceItem = MonitoringBlueprint['services'][number];

const columnHelper =
  createColumnHelper<MonitoringBlueprintServiceItem>();

export const PendingInstanceTable: FC<InstancesTabProps> = ({
  data,
  isLoading,
  error,
  isOperator,
}) => {
  const network = useNetworkStore((store) => store.network);

  const isEmpty = data.length === 0;

  const columns = useMemo(() => {
    const baseColumns: AccessorKeyColumnDef<
      MonitoringBlueprintServiceItem,
      any
    >[] = [
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
    ];

    if (isOperator) {
      baseColumns.push(
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
                      ) ?? ''
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
          cell: (props) => {
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
      );
    } else {
      baseColumns.push(
        columnHelper.accessor('operators', {
          header: 'Approved Operators',
          cell: (props) => {
            return (
              <TableCellWrapper>
                <NestedOperatorCell
                  operators={props.row.original.operators}
                  operatorIdentityMap={
                    props.row.original.operatorIdentityMap || new Map([])
                  }
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
                  operatorIdentityMap={props.row.original.operatorIdentityMap}
                />
              </TableCellWrapper>
            );
          },
        }),
        columnHelper.accessor('createdAtBlock', {
          header: 'Created At',
          cell: (props) => {
            return (
              <TableCellWrapper>
                {props.row.original.createdAtBlock ? (
                  <>
                    Block {addCommasToNumber(props.row.original.createdAtBlock)}
                  </>
                ) : (
                  EMPTY_VALUE_PLACEHOLDER
                )}
              </TableCellWrapper>
            );
          },
        }),
        columnHelper.accessor('id', {
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
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id.toString(),
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  return (
    <TangleCloudTable<MonitoringBlueprintServiceItem>
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
