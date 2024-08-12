'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingFn,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronUp } from '@webb-tools/icons';
import {
  Button,
  getRoundedAmountString,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import LSTToken from '../../../components/LSTToken';
import { Vault } from '../../../types/blueprint';
import TableCellWrapper from './TableCellWrapper';
import useVaults from './useVaults';
import VaultAssetsTable from './VaultAssetsTable';

const columnHelper = createColumnHelper<Vault>();

const TvlTable: FC = () => {
  const vaults = useVaults();

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'apy', desc: true },
  ]);

  const isDesc = useMemo(() => sorting[0].desc, [sorting]);

  const getExpandedRowContent = (row: Row<Vault>) => {
    return (
      <div className="bg-mono-0 dark:bg-mono-190 -mt-7 pt-4 pb-3 rounded-b-xl -mx-px px-3">
        <VaultAssetsTable
          lstToken={row.original.lstToken}
          isShown={row.getIsExpanded()}
        />
      </div>
    );
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: () => 'Vault',
        cell: (props) => (
          <TableCellWrapper isActive={props.row.original.isActive}>
            <div className="flex items-center gap-2">
              <LSTToken name={props.row.original.lstToken} size="lg" />
              <Typography variant="h5">{props.getValue()}</Typography>
            </div>
          </TableCellWrapper>
        ),
        sortingFn: (rowA, rowB, columnId) =>
          sortVaultBasedOnSortingFn(
            rowA,
            rowB,
            columnId,
            isDesc,
            (rowA, rowB) => {
              return rowB.original.name.localeCompare(rowA.original.name);
            },
          ),
      }),
      columnHelper.accessor('apy', {
        header: () => 'APY',
        cell: (props) => (
          <TableCellWrapper isActive={props.row.original.isActive}>
            <Typography
              variant="body1"
              fw="bold"
              className="text-mono-200 dark:text-mono-0"
            >
              {props.getValue().toFixed(2)}%
            </Typography>
          </TableCellWrapper>
        ),
        sortingFn: (rowA, rowB, columnId) =>
          sortVaultBasedOnSortingFn(
            rowA,
            rowB,
            columnId,
            isDesc,
            (rowA, rowB) => rowA.original.apy - rowB.original.apy,
          ),
      }),
      columnHelper.accessor('tokensCount', {
        header: () => 'Tokens',
        cell: (props) => (
          <TableCellWrapper isActive={props.row.original.isActive}>
            <Typography
              variant="body1"
              fw="bold"
              className="text-mono-200 dark:text-mono-0"
            >
              {props.getValue()}
            </Typography>
          </TableCellWrapper>
        ),
        sortingFn: (rowA, rowB, columnId) =>
          sortVaultBasedOnSortingFn(
            rowA,
            rowB,
            columnId,
            isDesc,
            (rowA, rowB) =>
              rowA.original.tokensCount - rowB.original.tokensCount,
          ),
      }),
      columnHelper.accessor('liquidity', {
        header: () => 'Liquidity',
        cell: (props) => (
          <TableCellWrapper isLast isActive={props.row.original.isActive}>
            <div>
              <Typography
                variant="body1"
                fw="bold"
                className="text-mono-200 dark:text-mono-0"
              >
                {getRoundedAmountString(props.getValue().amount)}
              </Typography>
              <Typography
                variant="body1"
                className="text-mono-120 dark:text-mono-100"
              >
                ${getRoundedAmountString(props.getValue().usdValue)}
              </Typography>
            </div>
          </TableCellWrapper>
        ),
        sortingFn: (rowA, rowB, columnId) =>
          sortVaultBasedOnSortingFn(
            rowA,
            rowB,
            columnId,
            isDesc,
            (rowA, rowB) =>
              rowA.original.liquidity.amount - rowB.original.liquidity.amount,
          ),
      }),
      columnHelper.accessor('lstToken', {
        header: () => null,
        cell: ({ row, table }) => (
          <div className="flex items-center gap-2 justify-end">
            {row.original.tokensCount > 0 && (
              // TODO: add onClick
              <Button variant="utility" className="body4">
                Restake
              </Button>
            )}
            <Button
              variant="utility"
              isJustIcon
              onClick={() => {
                table.setExpanded({ [row.id]: !row.getIsExpanded() });
              }}
              isDisabled={!(row.original.tokensCount > 0)}
            >
              <div
                className={twMerge(
                  '!text-current transition-transform duration-300 ease-in-out',
                  row.getIsExpanded() ? 'rotate-180' : '',
                )}
              >
                <ChevronUp className={twMerge('!fill-current')} />
              </div>
            </Button>
          </div>
        ),
        enableSorting: false,
      }),
    ],
    [isDesc],
  );

  const table = useReactTable({
    data: vaults,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  return (
    <div className="space-y-5">
      <Typography variant="h4" fw="bold">
        Total Value Locked
      </Typography>

      <Table
        tableProps={table}
        title="Operators"
        getExpandedRowContent={getExpandedRowContent}
        isPaginated
        className={twMerge(
          'px-6 rounded-2xl overflow-hidden border border-mono-0 dark:border-mono-160',
          'bg-[linear-gradient(180deg,rgba(255,255,255,0.20)0%,rgba(255,255,255,0.00)100%)]',
          'dark:bg-[linear-gradient(180deg,rgba(43,47,64,0.20)0%,rgba(43,47,64,0.00)100%)]',
        )}
        tableClassName="border-separate border-spacing-y-3 pt-3"
        thClassName="py-0 border-t-0 !bg-transparent font-normal text-mono-120 dark:text-mono-100 border-b-0"
        tbodyClassName="!bg-transparent"
        trClassName="bg-mono-0 dark:bg-mono-190 overflow-hidden rounded-xl"
        tdClassName="border-0 !bg-inherit first:pl-3 first:rounded-l-xl last:rounded-r-xl pl-3 pr-0 last:pr-3"
        paginationClassName="!bg-transparent dark:!bg-transparent pl-6 border-t-0 -mt-2"
      />
    </div>
  );
};

export default TvlTable;

function sortVaultBasedOnSortingFn(
  rowA: Row<Vault>,
  rowB: Row<Vault>,
  columnId: string,
  isDesc: boolean,
  sortFn: SortingFn<Vault>,
) {
  const isRowAActive = rowA.original.isActive;
  const isRowBActive = rowB.original.isActive;

  if (isRowAActive && !isRowBActive) return isDesc ? 1 : -1;
  if (!isRowAActive && isRowBActive) return isDesc ? -1 : 1;

  return sortFn(rowA, rowB, columnId);
}
