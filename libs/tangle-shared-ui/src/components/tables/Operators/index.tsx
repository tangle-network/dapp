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
import formatFractional from '@webb-tools/webb-ui-components/utils/formatFractional';
import pluralize from '@webb-tools/webb-ui-components/utils/pluralize';
import Link from 'next/link';
import { FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import TableCellWrapper from '../../../components/tables/TableCellWrapper';
import TableStatus from '../../../components/tables/TableStatus';
import { getSortAddressOrIdentityFnc } from '../../../components/tables/utils';
import { OperatorData } from '../../../types';
import getTVLToDisplay from '../../../utils/getTVLToDisplay';

import type { Props } from './types';
import VaultsDropdown from './VaultsDropdown';

const columnHelper = createColumnHelper<OperatorData>();

const staticColumns: ColumnDef<OperatorData, any>[] = [
  columnHelper.accessor('address', {
    header: () => 'Identity',
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
    sortingFn: getSortAddressOrIdentityFnc<OperatorData>(),
  }),
  columnHelper.accessor('restakersCount', {
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
  columnHelper.accessor('concentrationPercentage', {
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
              : formatFractional(value)}
          </Typography>
        </TableCellWrapper>
      );
    },
  }),
  columnHelper.accessor('tvlInUsd', {
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
  columnHelper.accessor('vaultTokens', {
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

const OperatorsTable: FC<Props> = ({
  data = [],
  isLoading,
  loadingTableProps,
  emptyTableProps,
  tableProps,
  globalFilter,
  onGlobalFilterChange,
  getViewOperatorLink,
  getRestakeOperatorLink,
}) => {
  const columns = useMemo(
    () =>
      staticColumns.concat([
        columnHelper.display({
          id: 'actions',
          header: () => null,
          cell: (props) => (
            <TableCellWrapper removeRightBorder>
              <div className="flex items-center justify-end flex-1 gap-2">
                {getViewOperatorLink && (
                  <Button
                    as={Link}
                    href={getViewOperatorLink(props.row.original.address)}
                    variant="utility"
                    className="uppercase body4"
                  >
                    View
                  </Button>
                )}

                {getRestakeOperatorLink && (
                  <Button
                    as={Link}
                    href={getRestakeOperatorLink(props.row.original.address)}
                    variant="utility"
                    className="uppercase body4"
                  >
                    Restake
                  </Button>
                )}
              </div>
            </TableCellWrapper>
          ),
          enableSorting: false,
        }) satisfies ColumnDef<OperatorData>,
      ]),
    [getViewOperatorLink, getRestakeOperatorLink],
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
          id: 'restakersCount',
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
  }

  if (data.length === 0) {
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
