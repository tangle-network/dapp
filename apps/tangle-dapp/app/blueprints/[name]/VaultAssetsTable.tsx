'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { getRoundedAmountString, Table } from '@webb-tools/webb-ui-components';
import { FC, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { VaultAsset } from '../../../types/blueprint';
import { LiquidStakingToken } from '../../../types/liquidStaking';
import useVaultAssets from './useVaultAssets';

interface VaultAssetsTableProps {
  lstToken: LiquidStakingToken;
  isShown: boolean;
}

const columnHelper = createColumnHelper<VaultAsset>();

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
    cell: (props) => getRoundedAmountString(props.getValue()),
  }),
  columnHelper.accessor('myStake', {
    header: () => 'My Stake',
    cell: (props) => getRoundedAmountString(props.getValue()),
  }),
];

const VaultAssetsTable: FC<VaultAssetsTableProps> = ({ lstToken, isShown }) => {
  const data = useVaultAssets(lstToken);

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'tvl', desc: true },
  ]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    getRowId: (row) => row.id,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

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
