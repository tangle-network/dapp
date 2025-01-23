'use client';

import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Avatar,
  Button,
  shortenString,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import { TableVariant } from '@webb-tools/webb-ui-components/components/Table/types';
import { EMPTY_VALUE_PLACEHOLDER } from '@webb-tools/webb-ui-components/constants';
import formatPercentage from '@webb-tools/webb-ui-components/utils/formatPercentage';
import pluralize from '@webb-tools/webb-ui-components/utils/pluralize';
import { FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import TableCellWrapper from '../../../components/tables/TableCellWrapper';
import TableStatus from '../../../components/tables/TableStatus';
import { sortByAddressOrIdentity } from '../../../components/tables/utils';
import { RestakeOperator } from '../../../types';
import getTVLToDisplay from '../../../utils/getTVLToDisplay';
import type { ComponentProps, PropsWithChildren } from 'react';
import type { TableStatusProps } from '../../../components/tables/TableStatus';
import VaultsDropdown from './VaultsDropdown';

const COLUMN_HELPER = createColumnHelper<RestakeOperator>();

const STATIC_COLUMNS: ColumnDef<RestakeOperator, any>[] = [
  COLUMN_HELPER.accessor('address', {
    header: () => 'Identity',
    sortingFn: sortByAddressOrIdentity<RestakeOperator>(),
    cell: (props) => {
      const { address, identityName: identity } = props.row.original;

      return (
        <TableCellWrapper className="pl-3">
          <div className="flex items-center flex-1 gap-2 pr-3">
            <Avatar
              sourceVariant="address"
              value={address}
              theme="substrate"
              size="lg"
            />

            <div>
              <Typography variant="h5" fw="bold">
                {identity === address ? shortenString(address) : identity}
              </Typography>

              <Typography
                variant="body2"
                className="text-mono-100 dark:text-mono-120"
              >
                {shortenString(address)}
              </Typography>
            </div>
          </div>
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.accessor('restakersCount', {
    header: () => 'Restakers',
    cell: (props) => (
      <TableCellWrapper>
        <Typography
          variant="body1"
          fw="bold"
          className="text-mono-200 dark:text-mono-0"
        >
          {props.getValue()}
        </Typography>
      </TableCellWrapper>
    ),
  }),
  COLUMN_HELPER.accessor('concentrationPercentage', {
    header: () => 'Concentration',
    cell: (props) => {
      const value = props.getValue();

      return (
        <TableCellWrapper>
          <Typography
            variant="body1"
            fw="bold"
            className="text-mono-200 dark:text-mono-0"
          >
            {typeof value !== 'number'
              ? EMPTY_VALUE_PLACEHOLDER
              : formatPercentage(value)}
          </Typography>
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.accessor('tvlInUsd', {
    header: () => 'TVL',
    cell: (props) => (
      <TableCellWrapper>
        <Typography
          variant="body1"
          className="text-mono-120 dark:text-mono-100"
        >
          {getTVLToDisplay(props.getValue())}
        </Typography>
      </TableCellWrapper>
    ),
  }),
  COLUMN_HELPER.accessor('vaultTokens', {
    header: () => 'Vaults',
    cell: (props) => {
      const tokensList = props.getValue();

      return (
        <TableCellWrapper removeRightBorder>
          {tokensList.length > 0 ? (
            <VaultsDropdown vaultTokens={tokensList} />
          ) : (
            <Typography variant="body1">No vaults</Typography>
          )}
        </TableCellWrapper>
      );
    },
    enableSorting: false,
  }),
];

type Props = {
  isLoading?: boolean;
  data?: RestakeOperator[];
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  loadingTableProps?: Partial<TableStatusProps>;
  emptyTableProps?: Partial<TableStatusProps>;
  tableProps?: Partial<ComponentProps<typeof Table>>;
  ViewOperatorAction?: React.FC<PropsWithChildren<{ address: string }>>;
  RestakeOperatorAction?: React.FC<PropsWithChildren<{ address: string }>>;
};

const OperatorsTable: FC<Props> = ({
  data = [],
  isLoading,
  loadingTableProps,
  emptyTableProps,
  tableProps,
  globalFilter,
  onGlobalFilterChange,
  ViewOperatorAction,
  RestakeOperatorAction,
}) => {
  const columns = useMemo(
    () =>
      STATIC_COLUMNS.concat([
        COLUMN_HELPER.display({
          id: 'actions',
          header: () => null,
          cell: (props) => (
            <TableCellWrapper removeRightBorder>
              <div className="flex items-center justify-end flex-1 gap-2">
                {ViewOperatorAction ? (
                  <ViewOperatorAction address={props.row.original.address}>
                    <Button variant="utility" className="uppercase body4">
                      View
                    </Button>
                  </ViewOperatorAction>
                ) : (
                  <Button variant="utility" className="uppercase body4">
                    View
                  </Button>
                )}

                {RestakeOperatorAction ? (
                  <RestakeOperatorAction address={props.row.original.address}>
                    <Button variant="utility" className="uppercase body4">
                      Restake
                    </Button>
                  </RestakeOperatorAction>
                ) : (
                  <Button variant="utility" className="uppercase body4">
                    Restake
                  </Button>
                )}
              </div>
            </TableCellWrapper>
          ),
          enableSorting: false,
        }) satisfies ColumnDef<RestakeOperator>,
      ]),
    [ViewOperatorAction, RestakeOperatorAction],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      sorting: [
        {
          id: 'restakersCount' satisfies keyof RestakeOperator,
          desc: true,
        },
      ],
    },
    state: {
      globalFilter,
    },
    onGlobalFilterChange,
    getRowId: (row) => row.address,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
    enableGlobalFilter: true,
  });

  if (isLoading) {
    return (
      <TableStatus
        title="Loading Operators"
        description="Please wait while we load the operators."
        icon="🔄"
        {...loadingTableProps}
        className={loadingTableProps?.className}
      />
    );
  } else if (data.length === 0) {
    return (
      <TableStatus
        title="No Operators Found"
        description="It looks like there are no operators running at the moment."
        icon="⚙️"
        {...emptyTableProps}
        className={emptyTableProps?.className}
      />
    );
  }

  return (
    <Table
      title={pluralize('operator', data.length !== 1)}
      variant={TableVariant.GLASS_OUTER}
      isPaginated
      {...tableProps}
      tableProps={table}
      className={tableProps?.className}
      tableClassName={tableProps?.tableClassName}
      thClassName={tableProps?.thClassName}
      tbodyClassName={tableProps?.tbodyClassName}
      trClassName={twMerge(
        'group cursor-pointer overflow-hidden',
        tableProps?.trClassName,
      )}
      tdClassName={tableProps?.tdClassName}
      paginationClassName={tableProps?.paginationClassName}
    />
  );
};

export default OperatorsTable;
