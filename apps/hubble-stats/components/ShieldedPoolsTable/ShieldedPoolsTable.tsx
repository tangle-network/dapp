'use client';

import {
  Row,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { IconsGroup, Table, fuzzyFilter } from '@webb-tools/webb-ui-components';
import { useRouter } from 'next/navigation';
import { FC, useCallback } from 'react';

import { PoolTypeChip } from '..';
import { getChainNamesByTypedId } from '../../utils';
import { HeaderCell, NumberCell, ShieldedCell } from '../tableCells';
import { ShieldedPoolType, ShieldedPoolsTableProps } from './types';

const columnHelper = createColumnHelper<ShieldedPoolType>();

const columns = [
  columnHelper.accessor('address', {
    header: () => (
      <HeaderCell title="Shielded Pools" className="justify-start" />
    ),
    cell: (props) => (
      <ShieldedCell
        title={props.row.original.symbol}
        address={props.row.original.address}
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
    header: () => <HeaderCell title="Token #" />,
    cell: (props) => <NumberCell value={props.getValue()} />,
  }),
  columnHelper.accessor('deposits24h', {
    header: () => <HeaderCell title="24H Deposits" />,
    cell: (props) => (
      <NumberCell
        suffix={` ${props.row.original.currency}`}
        value={props.getValue()}
      />
    ),
  }),
  columnHelper.accessor('tvl', {
    header: () => <HeaderCell title="TVL" tooltip="TVL" />,
    cell: (props) => (
      <NumberCell
        suffix={` ${props.row.original.currency}`}
        value={props.getValue()}
      />
    ),
  }),
  columnHelper.accessor('typedChainIds', {
    header: () => <HeaderCell title="Chains" className="justify-end" />,
    cell: (props) => (
      <IconsGroup
        icons={getChainNamesByTypedId(props.getValue())}
        type="chain"
        className="justify-end"
      />
    ),
  }),
];

const ShieldedPoolsTable: FC<ShieldedPoolsTableProps> = ({
  data = [],
  pageSize,
}) => {
  const router = useRouter();

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

  const onRowClick = useCallback(
    (row: Row<ShieldedPoolType>) => {
      router.push(`/pool/${row.original.address}`);
    },
    [router]
  );

  return (
    <div className="overflow-hidden border rounded-lg bg-mono-0 dark:bg-mono-180 border-mono-40 dark:border-mono-160">
      <Table
        thClassName="border-t-0 bg-mono-0"
        trClassName="cursor-pointer"
        paginationClassName="bg-mono-0 dark:bg-mono-180 pl-6"
        tableProps={table}
        isPaginated
        totalRecords={data.length}
        onRowClick={onRowClick}
      />
    </div>
  );
};

export default ShieldedPoolsTable;
