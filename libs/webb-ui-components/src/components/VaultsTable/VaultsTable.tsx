'use client';

import { useState, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  Row,
} from '@tanstack/react-table';
import { Table } from '../Table';
import { Typography } from '../../typography';
import { twMerge } from 'tailwind-merge';
import AssetsTable from './AssetsTable';
import { VaultsTableProps } from './types';

function VaultsTable<TVault extends { assets: TAsset[] }, TAsset>({
  vaultsData,
  vaultsColumns,
  assetsColumns,
  title,
  initialSorting = [],
  isPaginated = true,
}: VaultsTableProps<TVault, TAsset>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);

  const getExpandedRowContent = useCallback(
    (row: Row<TVault>) => (
      <div className="bg-mono-0 dark:bg-mono-190 -mt-7 pt-3 rounded-b-xl -mx-px px-3">
        <AssetsTable
          data={row.original.assets}
          columns={assetsColumns}
          isShown={row.getIsExpanded()}
        />
      </div>
    ),
    [assetsColumns],
  );

  const table = useReactTable({
    data: vaultsData,
    columns: vaultsColumns,
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

  const onRowClick = useCallback(
    (row: Row<TVault>) => {
      table.setExpanded({ [row.id]: !row.getIsExpanded() });
    },
    [table],
  );

  return (
    <div className="space-y-5">
      <Typography variant="h4" fw="bold">
        {title}
      </Typography>

      <Table
        tableProps={table}
        title={title}
        getExpandedRowContent={getExpandedRowContent}
        onRowClick={onRowClick}
        isPaginated={isPaginated}
        className={twMerge(
          'px-6 rounded-2xl overflow-hidden border border-mono-0 dark:border-mono-160',
          'bg-[linear-gradient(180deg,rgba(255,255,255,0.20)0%,rgba(255,255,255,0.00)100%)]',
          'dark:bg-[linear-gradient(180deg,rgba(43,47,64,0.20)0%,rgba(43,47,64,0.00)100%)]',
        )}
        tableClassName="border-separate border-spacing-y-3 pt-3"
        thClassName="py-0 border-t-0 !bg-transparent font-normal text-mono-120 dark:text-mono-100 border-b-0"
        tbodyClassName="!bg-transparent"
        trClassName="group cursor-pointer overflow-hidden rounded-xl"
        tdClassName="border-0 !p-0 first:rounded-l-xl last:rounded-r-xl overflow-hidden"
        paginationClassName="!bg-transparent dark:!bg-transparent pl-6 border-t-0 -mt-2"
      />
    </div>
  );
}

export default VaultsTable;
