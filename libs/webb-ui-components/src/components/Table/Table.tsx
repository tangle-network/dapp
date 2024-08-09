import { type Row, type RowData, flexRender } from '@tanstack/react-table';
import React, { useCallback } from 'react';
import { ArrowDropDownFill, ArrowDropUpFill } from '@webb-tools/icons';
import { twMerge } from 'tailwind-merge';

import { Pagination } from '../Pagination';
import { TDataMemo as TData } from './TData';
import { THeaderMemo as THeader } from './THeader';
import { TableProps } from './types';

export const Table = <T extends RowData>({
  isDisabledRowHoverStyle,
  isDisplayFooter,
  isPaginated,
  onRowClick,
  paginationClassName,
  tableClassName,
  tableProps: table,
  tableWrapperClassName,
  tbodyClassName,
  tdClassName,
  thClassName,
  title,
  totalRecords = 0,
  trClassName,
  ref,
  getExpandedRowContent,
  ...props
}: TableProps<T, HTMLDivElement>) => {
  const getRowClickHandler = useCallback(
    (row: Row<T>) => {
      if (typeof onRowClick !== 'function') {
        return;
      }

      return (eve: React.MouseEvent<HTMLTableRowElement>) => {
        eve.preventDefault();
        onRowClick(row);
      };
    },
    [onRowClick],
  );

  return (
    <div {...props} ref={ref}>
      <div className={twMerge('w-full overflow-x-auto', tableWrapperClassName)}>
        <table
          className={twMerge(
            'w-full border-collapse table-auto',
            tableClassName,
          )}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <THeader
                    className={thClassName}
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    title={
                      header.column.getCanSort()
                        ? header.column.getNextSortingOrder() === 'asc'
                          ? 'Sort ascending'
                          : header.column.getNextSortingOrder() === 'desc'
                            ? 'Sort descending'
                            : 'Clear sort'
                        : undefined
                    }
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div className="!text-inherit flex items-center justify-start cursor-pointer">
                        {flexRender(header.column.columnDef.header, {
                          ...header.getContext(),
                        })}

                        {{
                          asc: <ArrowDropUpFill className="!fill-current" />,
                          desc: <ArrowDropDownFill className="!fill-current" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    ) : (
                      flexRender(header.column.columnDef.header, {
                        ...header.getContext(),
                      })
                    )}
                  </THeader>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className={tbodyClassName}>
            {table.getRowModel().rows.map((row) => (
              <>
                <tr
                  key={row.id}
                  className={twMerge('group/tr', trClassName)}
                  onClick={getRowClickHandler(row)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TData
                      isDisabledHoverStyle={isDisabledRowHoverStyle}
                      className={tdClassName}
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TData>
                  ))}
                </tr>

                {getExpandedRowContent && row.getIsExpanded() && (
                  <tr>
                    <td colSpan={row.getVisibleCells().length}>
                      {getExpandedRowContent(row)}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
          {isDisplayFooter && (
            <tfoot>
              {table.getFooterGroups().map((footerGroup) => (
                <tr key={footerGroup.id}>
                  {footerGroup.headers.map((header) => (
                    <THeader key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.footer,
                            header.getContext(),
                          )}
                    </THeader>
                  ))}
                </tr>
              ))}
            </tfoot>
          )}
        </table>
      </div>

      {/** Pagination */}
      {isPaginated && (
        <Pagination
          itemsPerPage={table.getState().pagination.pageSize}
          totalItems={Math.max(
            table.getPrePaginationRowModel().rows.length,
            totalRecords,
          )}
          page={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          canPreviousPage={table.getCanPreviousPage()}
          previousPage={table.previousPage}
          canNextPage={table.getCanNextPage()}
          nextPage={table.nextPage}
          setPageIndex={table.setPageIndex}
          title={title}
          className={paginationClassName}
        />
      )}
    </div>
  );
};
