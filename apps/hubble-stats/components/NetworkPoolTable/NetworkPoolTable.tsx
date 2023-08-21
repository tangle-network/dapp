'use client';

import {
  ColumnDef,
  Table as RTTable,
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { chainsConfig } from '@webb-tools/dapp-config/chains';
import { ShieldKeyholeLineIcon } from '@webb-tools/icons';
import {
  ChainChip,
  Table,
  Typography,
  fuzzyFilter,
} from '@webb-tools/webb-ui-components';
import { FC, useMemo } from 'react';

import { getSortedTypedChainIds } from '../../utils';
import { HeaderCell, NumberCell } from '../table';
import { NetworkPoolTableProps, NetworkPoolType } from './types';

const columnHelper = createColumnHelper<NetworkPoolType>();

const staticColumns: ColumnDef<NetworkPoolType, any>[] = [
  columnHelper.accessor('symbol', {
    header: () => null,
    cell: (props) => (
      <div className="flex items-center gap-1">
        <ShieldKeyholeLineIcon />
        <Typography
          variant="body1"
          fw="bold"
          className="text-mono-200 dark:text-mono-0"
        >
          {props.row.original.symbol}
        </Typography>
      </div>
    ),
  }),
  columnHelper.accessor('aggregate', {
    header: () => (
      <HeaderCell
        title="Aggregate"
        className="text-mono-200 dark:text-mono-0"
      />
    ),
    cell: (props) => <NumberCell value={props.getValue()} prefix="$" />,
  }),
];

const NetworkPoolTable: FC<NetworkPoolTableProps> = ({
  typedChainIds = [],
  data = [],
  prefixUnit = '$',
}) => {
  const sortedTypedChainIds = useMemo(
    () => getSortedTypedChainIds(typedChainIds),
    [typedChainIds]
  );

  const columns = useMemo<ColumnDef<NetworkPoolType, any>[]>(
    () => [
      ...staticColumns,
      ...sortedTypedChainIds.map((typedChainId) =>
        columnHelper.accessor('chainsData', {
          id: typedChainId.toString(),
          header: () => (
            <div className="w-full text-center">
              <ChainChip
                chainName={chainsConfig[typedChainId].name}
                chainType={chainsConfig[typedChainId].group}
                // shorten the title to last word of the chain name
                title={chainsConfig[typedChainId].name.split(' ').pop()}
              />
            </div>
          ),
          cell: (props) =>
            typeof props.row.original.chainsData[typedChainId] === 'number' ? (
              <NumberCell
                value={props.row.original.chainsData[typedChainId]}
                prefix={prefixUnit}
              />
            ) : (
              <Typography variant="body1" ta="center">
                *
              </Typography>
            ),
        })
      ),
    ],
    [sortedTypedChainIds, prefixUnit]
  );

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
  });

  if (typedChainIds.length === 0) {
    return (
      <Typography variant="body1">No network pool data available</Typography>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-lg border-mono-40 dark:border-mono-160">
      <Table
        tableClassName="block overflow-x-auto max-w-[-moz-fit-content] md:table md:max-w-none"
        thClassName="border-t-0 bg-mono-0 border-r first:px-3 last:border-r-0 last:pr-2"
        tdClassName="border-r last:border-r-0 first:px-3 last:pr-2"
        tableProps={table as RTTable<unknown>}
        totalRecords={data.length}
      />
    </div>
  );
};

export default NetworkPoolTable;
