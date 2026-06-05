import { flexRender, type RowData } from '@tanstack/react-table';
import type React from 'react';
import {
  Button,
  Card,
  CardContent,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tangle-network/sandbox-ui/primitives';
import { twMerge } from 'tailwind-merge';
import { type TableStatusProps, type TangleCloudTableProps } from './type';

export const TangleCloudTable = <T extends RowData>({
  title,
  hideTitle = false,
  data,
  isLoading,
  error,
  loadingTableProps,
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
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-14 rounded-md" />
          <Skeleton className="h-14 rounded-md" />
          <TableStatus
            {...loadingTableProps}
            title={loadingTableProps?.title ?? 'Loading data'}
            description={
              loadingTableProps?.description ??
              'Please wait while we load the latest indexed data.'
            }
            icon={loadingTableProps?.icon ?? 'Loading'}
            className={loadingTableProps?.className}
          />
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
          'overflow-x-auto [scrollbar-gutter:stable]',
          tableConfig?.viewportClassName,
        )}
      >
        <Table className={twMerge('min-w-full', tableConfig?.tableClassName)}>
          <TableHeader>
            {tableProps.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={twMerge(
                      'h-11 whitespace-nowrap px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider',
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
                  'border-border transition-colors hover:bg-muted/35',
                  tableConfig?.trClassName,
                  row.getIsExpanded() && tableConfig?.expandedRowClassName,
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={twMerge(
                      'px-4 py-3 align-middle text-foreground text-sm',
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
          'mt-4 flex flex-col gap-3 border-border border-t pt-4 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between',
          tableConfig?.paginationClassName,
        )}
      >
        <span>
          Showing {rowCount} {rowCount === 1 ? 'row' : 'rows'}
        </span>

        {pageCount > 1 ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!tableProps.getCanPreviousPage()}
              onClick={() => tableProps.previousPage()}
            >
              Previous
            </Button>
            <span className="px-2 font-mono text-xs">
              {pageIndex + 1}/{pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!tableProps.getCanNextPage()}
              onClick={() => tableProps.nextPage()}
            >
              Next
            </Button>
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
  <Card
    variant="sandbox"
    className={twMerge('w-full overflow-hidden border-border', className)}
  >
    <CardContent className="p-4 md:p-5">{children}</CardContent>
  </Card>
);

const TableTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="font-display font-bold text-foreground text-lg">
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
      'flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center',
      className,
    )}
  >
    <div className="rounded-full border border-border bg-card px-3 py-1 font-mono text-muted-foreground text-[10px] uppercase tracking-wider">
      {icon}
    </div>
    <h3 className="mt-4 font-display font-bold text-foreground text-lg">
      {title}
    </h3>
    <p className="mt-2 max-w-2xl text-muted-foreground text-sm leading-relaxed">
      {description}
    </p>
    {buttonText ? (
      <Button variant="outline" size="sm" className="mt-5" {...buttonProps}>
        {buttonText}
      </Button>
    ) : null}
  </div>
);
