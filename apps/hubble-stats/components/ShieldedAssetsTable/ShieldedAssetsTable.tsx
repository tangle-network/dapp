'use client';

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
import {
  Typography,
  Table,
  fuzzyFilter,
  IconsGroup,
} from '@webb-tools/webb-ui-components';

import { ShieldedAssetType, ShieldedAssetsTableProps } from './types';
import { HeaderCell, NumberCell, ShieldedCell } from '../table';
import { PoolTypeChip } from '..';
import { getChainNamesByTypedId } from '../../utils';

const columnHelper = createColumnHelper<ShieldedAssetType>();

const columns: ColumnDef<ShieldedAssetType, any>[] = [
  columnHelper.accessor('address', {
    header: () => (
      <HeaderCell title="Shielded Assets" className="justify-start" />
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
  columnHelper.accessor('composition', {
    header: () => <HeaderCell title="Composition" />,
    cell: (props) =>
      props.getValue().length > 0 ? (
        <IconsGroup
          icons={props.getValue()}
          type="token"
          className="justify-center"
        />
      ) : (
        <Typography
          variant="body1"
          ta="center"
          className="text-mono-140 dark:text-mono-40"
        >
          No composition
        </Typography>
      ),
  }),
  columnHelper.accessor('deposits24h', {
    header: () => <HeaderCell title="24H Deposits" />,
    cell: (props) => <NumberCell suffix=" tTNT" value={props.getValue()} />,
  }),
  columnHelper.accessor('tvl', {
    header: () => <HeaderCell title="TVL" tooltip="TVL" />,
    cell: (props) => <NumberCell value={props.getValue()} suffix=" tTNT" />,
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

const ShieldedAssetsTable: FC<ShieldedAssetsTableProps> = ({
  data = [],
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
    <div className="overflow-hidden rounded-lg bg-mono-0 dark:bg-mono-180 border border-mono-40 dark:border-mono-160">
      <Table
        tableClassName="block overflow-x-auto max-w-[-moz-fit-content] max-w-fit md:table md:max-w-none"
        thClassName="border-t-0 bg-mono-0"
        paginationClassName="bg-mono-0 dark:bg-mono-180 pl-6"
        tableProps={table as RTTable<unknown>}
        isPaginated
        totalRecords={data.length}
      />
    </div>
  );
};

export default ShieldedAssetsTable;
