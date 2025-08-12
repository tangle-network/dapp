import { type Row, type RowData, flexRender } from '@tanstack/react-table';
import { ArrowDropDownFill, ArrowDropUpFill } from '@tangle-network/icons';
import { Fragment, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';

import { Pagination } from '../Pagination';
import { TDataMemo as TData } from './TData';
import { THeaderMemo as THeader } from './THeader';
import { TableProps, TableVariant } from './types';

const getVariantContainerClass = (variant: TableVariant): string => {
  switch (variant) {
    case TableVariant.DEFAULT:
      return 'overflow-hidden border rounded-lg bg-mono-0 dark:bg-mono-180 border-mono-40 dark:border-mono-160';
    case TableVariant.EMBEDDED_IN_MODAL:
      return 'overflow-hidden border rounded-lg bg-mono-0 dark:bg-mono-170 border-mono-40 dark:border-mono-160';
    case TableVariant.GLASS_INNER:
      return 'rounded-2xl overflow-hidden bg-mono-0 dark:bg-mono-180 px-3';
    case TableVariant.GLASS_OUTER:
      return 'px-4 rounded-2xl overflow-hidden border border-mono-0 dark:border-mono-160 bg-[linear-gradient(180deg,rgba(255,255,255,0.20)0%,rgba(255,255,255,0.00)100%)] dark:bg-[linear-gradient(180deg,rgba(43,47,64,0.20)0%,rgba(43,47,64,0.00)100%)]';
  }
};

const getVariantThClass = (variant: TableVariant): string => {
  switch (variant) {
    case TableVariant.GLASS_INNER:
      return 'py-3 font-normal bg-transparent dark:bg-transparent border-b text-mono-120 dark:text-mono-100 border-mono-60 dark:border-mono-160';
    case TableVariant.GLASS_OUTER:
      return 'py-0 bg-transparent dark:bg-transparent font-normal text-mono-120 dark:text-mono-100 border-b-0';
    case TableVariant.EMBEDDED_IN_MODAL:
      return 'z-10 py-3 sticky top-0 dark:bg-mono-170';
    case TableVariant.DEFAULT:
      return 'py-2 first:pl-6 last:pr-6';
  }
};

const getVariantTdClass = (variant: TableVariant): string => {
  switch (variant) {
    case TableVariant.GLASS_INNER:
      return 'bg-inherit dark:bg-inherit border-t-0';
    case TableVariant.GLASS_OUTER:
      return 'border-0 px-0 py-0 first:rounded-l-xl last:rounded-r-xl overflow-hidden bg-inherit dark:bg-inherit';
    case TableVariant.EMBEDDED_IN_MODAL:
      return 'py-2 dark:bg-mono-170';
    case TableVariant.DEFAULT:
      return '';
  }
};

const getVariantTrClass = (variant: TableVariant): string => {
  switch (variant) {
    case TableVariant.GLASS_OUTER:
      return 'border-b border-mono-40 dark:border-mono-160 cursor-pointer bg-mono-0 dark:bg-mono-180';
    case TableVariant.GLASS_INNER:
    case TableVariant.DEFAULT:
    case TableVariant.EMBEDDED_IN_MODAL:
      return '';
  }
};

const getVariantTableClass = (variant: TableVariant): string => {
  switch (variant) {
    case TableVariant.GLASS_OUTER:
      return 'border-separate border-spacing-y-2 py-3';
    case TableVariant.GLASS_INNER:
    case TableVariant.DEFAULT:
    case TableVariant.EMBEDDED_IN_MODAL:
      return '';
  }
};

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
  className,
  variant = TableVariant.DEFAULT,
  paginationLabelOverride,
  expandedRowClassName,
  ...props
}: TableProps<T, HTMLDivElement>) => {
  const getRowClickHandler = useCallback(
    (row: Row<T>) => {
      if (typeof onRowClick !== 'function') {
        return;
      }

      return (eve: React.MouseEvent<HTMLTableRowElement>) => {
        eve.preventDefault();
        onRowClick(row, table);
      };
    },
    [onRowClick, table],
  );

  return (
    <div
      className={twMerge(getVariantContainerClass(variant), className)}
      {...props}
      ref={ref}
    >
      <div className={twMerge('w-full overflow-x-auto', tableWrapperClassName)}>
        <table
          className={twMerge(
            'w-full border-collapse table-auto',
            getVariantTableClass(variant),
            tableClassName,
          )}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <THeader
                    className={twMerge(getVariantThClass(variant), thClassName)}
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
                      <div className="text-inherit dark:text-inherit flex items-center justify-start cursor-pointer">
                        {flexRender(header.column.columnDef.header, {
                          ...header.getContext(),
                        })}

                        {{
                          asc: (
                            <ArrowDropDownFill
                              size="lg"
                              className="fill-current dark:fill-current"
                            />
                          ),
                          desc: (
                            <ArrowDropUpFill
                              size="lg"
                              className="fill-current dark:fill-current"
                            />
                          ),
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
              <Fragment key={row.id}>
                <tr
                  data-expanded={row.getIsExpanded() ? 'true' : 'false'}
                  className={twMerge(
                    'group/tr peer',
                    getVariantTrClass(variant),
                    getExpandedRowContent &&
                      row.getIsExpanded() &&
                      'border-b-0',
                    trClassName,
                  )}
                  onClick={getRowClickHandler(row)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TData
                      isDisabledHoverStyle={isDisabledRowHoverStyle}
                      className={twMerge(
                        getVariantTdClass(variant),
                        tdClassName,
                      )}
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
                  <tr
                    className={twMerge(
                      getVariantTrClass(variant),
                      expandedRowClassName,
                    )}
                  >
                    <td colSpan={row.getVisibleCells().length}>
                      {getExpandedRowContent(row)}
                    </td>
                  </tr>
                )}
              </Fragment>
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
          totalItems={Math.max(table.getRowCount(), totalRecords)}
          page={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          canPreviousPage={table.getCanPreviousPage()}
          previousPage={table.previousPage}
          canNextPage={table.getCanNextPage()}
          nextPage={table.nextPage}
          setPageIndex={table.setPageIndex}
          title={title}
          className={paginationClassName}
          labelOverride={paginationLabelOverride}
        />
      )}
    </div>
  );
};
