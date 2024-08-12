'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
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
import { FC, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import LSTTokenIcon from '../../../components/LSTTokenIcon';
import { Vault } from '../../../types/blueprint';
import TableCellWrapper from './TableCellWrapper';
import useVaults from './useVaults';
import VaultAssetsTable from './VaultAssetsTable';

const columnHelper = createColumnHelper<Vault>();

const columns = [
  columnHelper.accessor('name', {
    header: () => 'Vault',
    cell: (props) => (
      <TableCellWrapper>
        <div className="flex items-center gap-2">
          <LSTTokenIcon name={props.row.original.LSTTokenIcon} size="lg" />
          <Typography variant="h5">{props.getValue()}</Typography>
        </div>
      </TableCellWrapper>
    ),
    sortingFn: (rowA, rowB) => {
      // NOTE: the sorting is reversed by default
      return rowB.original.name.localeCompare(rowA.original.name);
    },
    sortDescFirst: true,
  }),
  columnHelper.accessor('apy', {
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
  columnHelper.accessor('liquidity', {
    header: () => 'Liquidity',
    cell: (props) => (
      <TableCellWrapper isLast>
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
  }),
  columnHelper.accessor('LSTTokenIcon', {
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
];

const TvlTable: FC = () => {
  const vaults = useVaults();

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'apy', desc: true },
  ]);

  const getExpandedRowContent = (row: Row<Vault>) => {
    return (
      <div className="bg-mono-0 dark:bg-mono-190 -mt-7 pt-4 pb-3 rounded-b-xl -mx-px px-3">
        <VaultAssetsTable
          LSTTokenIcon={row.original.LSTTokenIcon}
          isShown={row.getIsExpanded()}
        />
      </div>
    );
  };

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
