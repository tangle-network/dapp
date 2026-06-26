import { flexRender, type RowData } from '@tanstack/react-table';
import type React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tangle-network/sandbox-ui/primitives';
import { twMerge } from 'tailwind-merge';
import TangleCloudCard from '../TangleCloudCard';
import { type TableStatusProps, type TangleCloudTableProps } from './type';

export const TangleCloudTable = <T extends RowData>({
  title,
  hideTitle = false,
  data,
  isLoading,
  error,
  loadingTableProps: _loadingTableProps,
  errorTableProps,
  emptyTableProps,
  onRetry,
  tableConfig,
  tableProps,
}: TangleCloudTableProps<T>) => {
  const isEmpty = data.length === 0;
  const hasRetry = typeof onRetry === 'function';
  const errorMessage = error?.message?.trim();
  const diagnostics = errorMessage
    ? errorMessage.length > 140
      ? `${errorMessage.slice(0, 137)}...`
      : errorMessage
    : 'Indexer or network request failed.';
  const hasTitle = !hideTitle;

  if (isLoading) {
    return (
      <TableShell className={tableConfig?.className}>
        {hasTitle ? <TableTitle>{title}</TableTitle> : null}
        <div className={twMerge('space-y-3', hasTitle ? 'mt-4' : null)}>
          <div className="h-10 animate-pulse rounded-lg bg-mono-40 dark:bg-mono-170" />
          <div className="h-14 animate-pulse rounded-lg bg-mono-40 dark:bg-mono-170" />
          <div className="h-14 animate-pulse rounded-lg bg-mono-40 dark:bg-mono-170" />
        </div>
      </TableShell>
    );
  }

  if (error) {
    return (
      <TableShell className={tableConfig?.className}>
        {hasTitle ? <TableTitle>{title}</TableTitle> : null}
        <TableStatus
          {...errorTableProps}
          title={errorTableProps?.title ?? 'Unable to load data'}
          description={
            errorTableProps?.description ??
            `We could not load the latest data. ${diagnostics}`
          }
          icon={errorTableProps?.icon ?? 'Error'}
          buttonText={
            errorTableProps?.buttonText ?? (hasRetry ? 'Retry' : undefined)
          }
          buttonProps={
            errorTableProps?.buttonProps ??
            (hasRetry ? { onClick: () => void onRetry() } : undefined)
          }
          className={twMerge(
            hasTitle ? 'mt-4' : null,
            errorTableProps?.className,
          )}
        />
      </TableShell>
    );
  }

  if (isEmpty) {
    return (
      <TableShell className={tableConfig?.className}>
        {hasTitle ? <TableTitle>{title}</TableTitle> : null}
        <TableStatus
          {...emptyTableProps}
          title={emptyTableProps?.title ?? `No ${title.toLowerCase()} yet`}
          description={
            emptyTableProps?.description ?? 'There is no indexed data yet.'
          }
          icon={emptyTableProps?.icon ?? 'Empty'}
          className={twMerge(
            hasTitle ? 'mt-4' : null,
            emptyTableProps?.className,
          )}
        />
      </TableShell>
    );
  }

  const pageCount = tableProps.getPageCount();
  const pageIndex = tableProps.getState().pagination?.pageIndex ?? 0;
  const rowCount = tableProps.getRowCount();

  return (
    <TableShell className={tableConfig?.className}>
      {hasTitle ? <TableTitle>{title}</TableTitle> : null}

      <div
        className={twMerge(
          hasTitle ? 'mt-4' : null,
          'overflow-x-auto rounded-xl border border-mono-60 dark:border-mono-170 [scrollbar-gutter:stable]',
          tableConfig?.viewportClassName,
        )}
      >
        <Table className={twMerge('min-w-full', tableConfig?.tableClassName)}>
          <TableHeader>
            {tableProps.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-mono-60 dark:border-mono-170 bg-mono-20 dark:bg-mono-190"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={twMerge(
                      'h-11 whitespace-nowrap px-4 font-bold text-xs uppercase tracking-wider text-mono-120 dark:text-mono-100',
                      tableConfig?.thClassName,
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className={tableConfig?.tbodyClassName}>
            {tableProps.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-expanded={row.getIsExpanded()}
                className={twMerge(
                  'border-mono-60/50 dark:border-mono-170/50 transition-colors hover:bg-mono-20/60 dark:hover:bg-mono-190/60',
                  tableConfig?.trClassName,
                  row.getIsExpanded() && tableConfig?.expandedRowClassName,
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={twMerge(
                      'px-4 py-3 align-middle text-sm text-mono-200 dark:text-mono-0',
                      tableConfig?.tdClassName,
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div
        className={twMerge(
          'mt-4 flex flex-col gap-3 border-t border-mono-60 dark:border-mono-170 pt-4 text-sm text-mono-120 dark:text-mono-100 sm:flex-row sm:items-center sm:justify-between',
          tableConfig?.paginationClassName,
        )}
      >
        <span>
          Showing {rowCount} {rowCount === 1 ? 'row' : 'rows'}
        </span>

        {pageCount > 1 ? (
          <div className="flex items-center gap-2">
            <button
              disabled={!tableProps.getCanPreviousPage()}
              onClick={() => tableProps.previousPage()}
              className="rounded-lg border border-mono-60 dark:border-mono-170 px-3 py-1.5 text-xs font-bold text-mono-200 dark:text-mono-0 transition-colors hover:border-purple-40/40 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 font-mono text-xs text-mono-120 dark:text-mono-100">
              {pageIndex + 1}/{pageCount}
            </span>
            <button
              disabled={!tableProps.getCanNextPage()}
              onClick={() => tableProps.nextPage()}
              className="rounded-lg border border-mono-60 dark:border-mono-170 px-3 py-1.5 text-xs font-bold text-mono-200 dark:text-mono-0 transition-colors hover:border-purple-40/40 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </TableShell>
  );
};

TangleCloudTable.displayName = 'TangleCloudTable';

const TableShell = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <TangleCloudCard className={twMerge('w-full overflow-hidden', className)}>
    {children}
  </TangleCloudCard>
);

const TableTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="font-display text-lg font-bold text-mono-200 dark:text-mono-0">
    {children}
  </div>
);

const TableStatus = ({
  title,
  description,
  icon = 'Empty',
  buttonText,
  buttonProps,
  className,
}: TableStatusProps) => (
  <div
    className={twMerge(
      'flex min-h-48 flex-col items-center justify-center rounded-xl border border-mono-60 dark:border-mono-170 bg-mono-20/50 dark:bg-mono-190/50 p-8 text-center',
      className,
    )}
  >
    <div className="rounded-full border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-mono-120 dark:text-mono-100">
      {icon}
    </div>
    <h3 className="mt-4 font-display text-lg font-bold text-mono-200 dark:text-mono-0">
      {title}
    </h3>
    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mono-120 dark:text-mono-100">
      {description}
    </p>
    {buttonText ? (
      <button
        className="mt-5 rounded-lg border border-mono-60 dark:border-mono-170 px-4 py-1.5 text-xs font-bold text-mono-200 dark:text-mono-0 transition-colors hover:border-purple-40/40"
        {...buttonProps}
      >
        {buttonText}
      </button>
    ) : null}
  </div>
);
