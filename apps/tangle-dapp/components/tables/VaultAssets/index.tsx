import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  type TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import { Table } from '@webb-tools/webb-ui-components/components/Table';
import { FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import formatTangleBalance from '../../../utils/formatTangleBalance';
import getTVLToDisplay from '../../../utils/getTVLToDisplay';
import type { Props, VaultAssetData } from './types';

const columnHelper = createColumnHelper<VaultAssetData>();

const columns = [
  columnHelper.accessor('id', {
    header: () => 'Asset ID',
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor('symbol', {
    header: () => 'Asset Symbol',
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor('tvl', {
    header: () => 'TVL',
    cell: (props) => getTVLToDisplay(props.getValue()),
  }),
  columnHelper.accessor('selfStake', {
    header: () => 'My Stake',
    cell: (props) =>
      formatTangleBalance(props.getValue(), undefined, {
        decimals: props.row.original.decimals,
      }),
  }),
];

const VaultAssetsTable: FC<Props> = ({ data = [], isShown }) => {
  const table = useReactTable(
    useMemo(
      () =>
        ({
          data,
          columns,
          getCoreRowModel: getCoreRowModel(),
          getSortedRowModel: getSortedRowModel(),
          initialState: {
            sorting: [{ id: 'tvl', desc: true }],
          },
          autoResetPageIndex: false,
          enableSortingRemoval: false,
        }) satisfies TableOptions<VaultAssetData>,
      [data],
    ),
  );

  return (
    <Table
      tableProps={table}
      title="Assets"
      className={twMerge(
        'rounded-2xl overflow-hidden bg-mono-20 dark:bg-mono-200',
        isShown ? 'animate-slide-down' : 'animate-slide-up',
      )}
      thClassName="font-normal !bg-transparent border-t-0 border-b text-mono-120 dark:text-mono-100"
      tbodyClassName="!bg-transparent"
      tdClassName="!bg-inherit border-t-0"
    />
  );
};

export default VaultAssetsTable;
