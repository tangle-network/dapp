'use client';

import {
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
import Link from 'next/link';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { EMPTY_VALUE_PLACEHOLDER } from '../../../constants';
import { PagePath, QueryParamKey } from '../../../types';
import formatFractional from '../../../utils/formatFractional';
import getTVLToDisplay from '../../../utils/getTVLToDisplay';
import { getSortAddressOrIdentityFnc } from '../../../utils/table';
import { TableStatus } from '../../TableStatus';
import { sharedTableStatusClxs } from '../shared';
import TableCellWrapper from '../TableCellWrapper';
import type { OperatorData, Props } from './types';
import VaultsDropdown from './VaultsDropdown';

const columnHelper = createColumnHelper<OperatorData>();

const columns = [
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
  columnHelper.display({
    id: 'actions',
    header: () => null,
    cell: (props) => (
      <TableCellWrapper removeRightBorder>
        <div className="flex items-center justify-end flex-1 gap-2">
          <Button
            as={Link}
            href={`${PagePath.RESTAKE_OPERATOR}/${props.row.original.address}`}
            variant="utility"
            className="uppercase body4"
          >
            View
          </Button>

          <Button
            as={Link}
            href={`${PagePath.RESTAKE_STAKE}?${QueryParamKey.RESTAKE_OPERATOR}=${props.row.original.address}`}
            variant="utility"
            className="uppercase body4"
          >
            Restake
          </Button>
        </div>
      </TableCellWrapper>
    ),
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
}) => {
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
        title="Loading operators..."
        description="Please wait while we load the operators."
        icon="🔄"
        {...loadingTableProps}
        className={twMerge(sharedTableStatusClxs, loadingTableProps?.className)}
      />
    );
  }

  if (data.length === 0) {
    return (
      <TableStatus
        title="No operators found"
        description="It looks like there are no operators running at the moment."
        icon="⚙️"
        {...emptyTableProps}
        className={twMerge(sharedTableStatusClxs, emptyTableProps?.className)}
      />
    );
  }

  return (
    <Table
      title="Operators"
      isPaginated
      {...tableProps}
      tableProps={table}
      className={twMerge(
        'px-6 rounded-2xl overflow-hidden border border-mono-0 dark:border-mono-160',
        'bg-[linear-gradient(180deg,rgba(255,255,255,0.20)0%,rgba(255,255,255,0.00)100%)]',
        'dark:bg-[linear-gradient(180deg,rgba(43,47,64,0.20)0%,rgba(43,47,64,0.00)100%)]',
        tableProps?.className,
      )}
      tableClassName={twMerge(
        'border-separate border-spacing-y-3 pt-3',
        tableProps?.tableClassName,
      )}
      thClassName={twMerge(
        'py-0 border-t-0 !bg-transparent font-normal text-mono-120 dark:text-mono-100 border-b-0',
        tableProps?.thClassName,
      )}
      tbodyClassName={twMerge('!bg-transparent', tableProps?.tbodyClassName)}
      trClassName={twMerge(
        'group cursor-pointer overflow-hidden rounded-xl',
        tableProps?.trClassName,
      )}
      tdClassName={twMerge(
        'border-0 !p-0 first:rounded-l-xl last:rounded-r-xl overflow-hidden',
        tableProps?.tdClassName,
      )}
      paginationClassName={twMerge(
        '!bg-transparent dark:!bg-transparent pl-6 border-t-0 -mt-2',
        tableProps?.paginationClassName,
      )}
    />
  );
};

export default OperatorsTable;
