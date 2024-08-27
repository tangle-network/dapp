'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { Table } from '../Table';
import { Pagination } from '../Pagination';
import { twMerge } from 'tailwind-merge';
import { AssetsTableProps } from './types';

function AssetsTable<T>({ data, columns, isShown }: AssetsTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  return (
    <div className="flex flex-col">
      <Table
        tableProps={table}
        title="Assets"
        className={twMerge(
          'rounded-2xl overflow-hidden bg-mono-20 dark:bg-mono-200 px-3',
          isShown ? 'animate-slide-down' : 'animate-slide-up',
        )}
        thClassName="py-3 !font-normal !bg-transparent border-t-0 border-b text-mono-120 dark:text-mono-100 border-mono-60 dark:border-mono-160"
        tbodyClassName="!bg-transparent"
        tdClassName="!bg-inherit border-t-0"
      />

      <Pagination
        itemsPerPage={pageSize}
        totalItems={data.length}
        page={pageIndex + 1}
        totalPages={table.getPageCount()}
        canPreviousPage={table.getCanPreviousPage()}
        previousPage={table.previousPage}
        canNextPage={table.getCanNextPage()}
        nextPage={table.nextPage}
        setPageIndex={table.setPageIndex}
        title="Assets"
        className="border-t-0 py-5"
      />
    </div>
  );
}

export default AssetsTable;
