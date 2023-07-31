import { FC } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  Table as RTTable,
} from '@tanstack/react-table';
import { Table, fuzzyFilter, ChainChip } from '@webb-tools/webb-ui-components';

import { PoolTransactionType, PoolTransactionsTableProps } from './types';
import {
  ActivityCell,
  DestinationCell,
  HeaderCell,
  NumberCell,
  TimeCell,
} from '../table';

const columnHelper = createColumnHelper<PoolTransactionType>();

const columns: ColumnDef<PoolTransactionType, any>[] = [
  columnHelper.accessor('activity', {
    header: () => <HeaderCell title="Pool Type" className="justify-start" />,
    cell: (row) => (
      <ActivityCell
        txHash={row.row.original.txHash}
        activity={row.row.original.activity}
      />
    ),
  }),
  columnHelper.accessor('tokenAmount', {
    header: () => <HeaderCell title="Token Amount" className="justify-start" />,
    cell: (row) => (
      <NumberCell
        value={row.row.original.tokenAmount}
        suffix={row.row.original.tokenSymbol}
        className="text-left"
        isProtected={row.row.original.activity === 'transfer'}
      />
    ),
  }),
  columnHelper.accessor('source', {
    header: () => <HeaderCell title="Source" className="justify-start" />,
    cell: (row) => (
      <ChainChip
        chainName={row.row.original.source}
        chainType={row.row.original.sourceChainType}
      />
    ),
  }),
  columnHelper.accessor('destination', {
    header: () => <HeaderCell title="Destination" className="justify-start" />,
    cell: (row) => <DestinationCell />,
  }),
  columnHelper.accessor('time', {
    header: () => <HeaderCell title="Time" className="justify-end" />,
    cell: (row) => (
      <TimeCell time={row.row.original.time} className="text-right" />
    ),
  }),
];

const PoolTransactionsTable: FC<PoolTransactionsTableProps> = ({
  data,
  pageSize,
}) => {
  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageSize,
      },
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-lg border border-mono-40 dark:border-mono-160">
      <Table
        tableClassName="block overflow-x-auto max-w-[-moz-fit-content] max-w-fit max-w-fit md:table md:max-w-none"
        thClassName="border-t-0 bg-mono-0"
        paginationClassName="bg-mono-0 dark:bg-mono-180 pl-6"
        tableProps={table as RTTable<unknown>}
        isPaginated
        totalRecords={data.length}
      />
    </div>
  );
};

export default PoolTransactionsTable;
