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
import { Table, IconsGroup, fuzzyFilter } from '@webb-tools/webb-ui-components';

import { ShieldedPoolType, ShieldedPoolsTableProps } from './types';
import { HeaderCell, NumberCell, ShieldedCell } from '../table';
import { PoolTypeChip } from '..';

const columnHelper = createColumnHelper<ShieldedPoolType>();

const columns: ColumnDef<ShieldedPoolType, any>[] = [
  columnHelper.accessor('poolAddress', {
    header: () => (
      <HeaderCell title="Shielded Pools" className="justify-start" />
    ),
    cell: (props) => (
      <ShieldedCell
        title={props.row.original.poolSymbol}
        address={props.row.original.poolAddress}
      />
    ),
  }),
  columnHelper.accessor('poolType', {
    header: () => <HeaderCell title="Pool Type" />,
    cell: (props) => (
      <div className="text-center">
        <PoolTypeChip type={props.getValue()} />
      </div>
    ),
  }),
  columnHelper.accessor('token', {
    header: () => <HeaderCell title="Token #" className="justify-end" />,
    cell: (props) => (
      <NumberCell value={props.getValue()} className="text-right" />
    ),
  }),
  columnHelper.accessor('deposits24h', {
    header: () => <HeaderCell title="24H Deposits" />,
    cell: (props) => <NumberCell value={props.getValue()} />,
  }),
  columnHelper.accessor('tvl', {
    header: () => <HeaderCell title="TVL" tooltip="TVL" />,
    cell: (props) => <NumberCell value={props.getValue()} prefix="$" />,
  }),
  columnHelper.accessor('chains', {
    header: () => <HeaderCell title="Chains" className="justify-end" />,
    cell: (props) => (
      <IconsGroup
        icons={props.getValue()}
        type="chain"
        className="justify-end"
      />
    ),
  }),
];

const ShieldedPoolsTable: FC<ShieldedPoolsTableProps> = ({
  data,
  globalSearchText,
  pageSize,
}) => {
  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter: globalSearchText,
    },
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
    <div className="overflow-hidden rounded-lg bg-mono-0 dark:bg-mono-180 border border-mono-40 dark:border-mono-160">
      <Table
        thClassName="border-t-0 bg-mono-0"
        paginationClassName="bg-mono-0 dark:bg-mono-180 pl-6"
        tableProps={table as RTTable<unknown>}
        isPaginated
        totalRecords={data.length}
      />
    </div>
  );
};

export default ShieldedPoolsTable;
