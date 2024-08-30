'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronUp } from '@webb-tools/icons/ChevronUp';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { Table } from '@webb-tools/webb-ui-components/components/Table';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { getRoundedAmountString } from '@webb-tools/webb-ui-components/utils/getRoundedAmountString';
import Link from 'next/link';
import { FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import LsTokenIcon from '../../LsTokenIcon';
import { TableStatus } from '../../TableStatus';
import { sharedTableStatusClxs } from '../shared';
import TableCellWrapper from '../TableCellWrapper';
import type { Props, VaultData } from './types';

const columnHelper = createColumnHelper<VaultData>();

const columns = [
  columnHelper.accessor('name', {
    header: () => 'Vault',
    cell: (props) => (
      <TableCellWrapper className="pl-3">
        <div className="flex items-center gap-2">
          <LsTokenIcon name={props.row.original.representToken} size="lg" />
          <Typography variant="h5" className="whitespace-nowrap">
            {props.getValue()}
          </Typography>
        </div>
      </TableCellWrapper>
    ),
    sortingFn: (rowA, rowB) => {
      // NOTE: the sorting is reversed by default
      return rowB.original.name.localeCompare(rowA.original.name);
    },
    sortDescFirst: true,
  }),
  columnHelper.accessor('apyPercentage', {
    header: () => 'APY',
    cell: (props) => (
      <TableCellWrapper>
        <Typography
          variant="body1"
          fw="bold"
          className="text-mono-200 dark:text-mono-0"
        >
          {props.getValue().toFixed(2)}%
        </Typography>
      </TableCellWrapper>
    ),
  }),
  columnHelper.accessor('tokensCount', {
    header: () => 'Tokens',
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
  columnHelper.accessor('tvlInUsd', {
    header: () => 'TVL',
    cell: (props) => (
      <TableCellWrapper removeBorder>
        <Typography
          variant="body1"
          className="text-mono-120 dark:text-mono-100"
        >
          ${getRoundedAmountString(props.getValue())}
        </Typography>
      </TableCellWrapper>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    header: () => null,
    cell: ({ row }) => (
      <TableCellWrapper removeBorder>
        <div className="flex items-center justify-end flex-1 gap-2">
          <Button
            as={Link}
            // TODO: add proper href
            href="#"
            variant="utility"
            className="uppercase body4"
          >
            Restake
          </Button>

          <Button variant="utility" isJustIcon isDisabled={!row.getCanExpand()}>
            <div
              className={twMerge(
                '!text-current transition-transform duration-300 ease-in-out',
                row.getIsExpanded() && 'rotate-180',
              )}
            >
              <ChevronUp className="!fill-current" />
            </div>
          </Button>
        </div>
      </TableCellWrapper>
    ),
    enableSorting: false,
  }),
];

const VaultsTable: FC<Props> = ({
  data = [],
  isLoading,
  emptyTableProps,
  loadingTableProps,
  tableProps,
}) => {
  const table = useReactTable(
    useMemo(
      () =>
        ({
          data,
          columns,
          initialState: {
            sorting: [
              {
                id: 'apyPercentage',
                desc: true,
              },
            ],
          },
          getCoreRowModel: getCoreRowModel(),
          getExpandedRowModel: getExpandedRowModel(),
          getSortedRowModel: getSortedRowModel(),
          getPaginationRowModel: getPaginationRowModel(),
          getRowCanExpand: (row) => row.original.tokensCount > 0,
          autoResetPageIndex: false,
          enableSortingRemoval: false,
        }) satisfies TableOptions<VaultData>,
      [data],
    ),
  );

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
        title="No vaults found"
        description="It looks like there is no vaults at the moment."
        icon="🔍"
        {...emptyTableProps}
        className={twMerge(sharedTableStatusClxs, emptyTableProps?.className)}
      />
    );
  }

  return (
    <Table
      title="Vaults"
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

export default VaultsTable;
