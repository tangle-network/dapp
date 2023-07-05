import { FC } from 'react';
import cx from 'classnames';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { Pagination } from '@webb-tools/webb-ui-components';

interface TableTemplateProps<T> {
  pageSize: number;
  data: T[];
  columns: ColumnDef<T, any>[];
  hasPagination?: boolean;
  hasColumnBorder?: boolean;
}

export const TableTemplate: FC<TableTemplateProps<any>> = <T,>({
  pageSize,
  data,
  columns,
  hasPagination,
  hasColumnBorder,
}: TableTemplateProps<T>) => {
  const {
    getHeaderGroups,
    getRowModel,
    getPageCount,
    getState,
    setPageIndex,
    previousPage,
    nextPage,
    getCanPreviousPage,
    getCanNextPage,
  } = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageSize,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: {
      fuzzy: () => {
        return true;
      },
    },
  });

  const pageIndex = getState().pagination.pageIndex;

  return (
    <div className="bg-mono-0 dark:bg-mono-180 rounded-lg border border-mono-40 dark:border-mono-160">
      <table className="w-full">
        <thead className="border-b border-mono-40 dark:border-mono-160">
          {getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, idx) => (
                <th
                  key={idx}
                  className={cx('px-6 py-4', { 'border-r': hasColumnBorder })}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell, idx) => (
                <td
                  key={idx}
                  className={cx(
                    'px-6 py-4 border-b border-mono-40 dark:border-mono-160',
                    { 'border-r': hasColumnBorder }
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {hasPagination && (
        <Pagination
          canNextPage={getCanNextPage()}
          canPreviousPage={getCanPreviousPage()}
          itemsPerPage={pageSize}
          totalItems={data.length}
          totalPages={getPageCount()}
          previousPage={previousPage}
          nextPage={nextPage}
          page={pageIndex + 1}
          setPageIndex={setPageIndex}
          iconSize="md"
          className="pl-6 py-4 border-t-0"
        />
      )}
    </div>
  );
};
