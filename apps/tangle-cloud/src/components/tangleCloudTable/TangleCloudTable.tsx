import {
  Table,
  TableVariant,
} from '@tangle-network/ui-components/components/Table';
import type { RowData } from '@tanstack/react-table';
import type React from 'react';
import { twMerge } from 'tailwind-merge';
import { Card, CardVariant } from '@tangle-network/ui-components';
import { type TableStatusProps, type TangleCloudTableProps } from './type';

/**
 * Cloud table wrapper using the SAME shared Table component the staking dapp
 * uses (TableVariant.GLASS_OUTER). Handles loading/error/empty states that
 * the shared Table doesn't provide, then delegates rendering to it.
 */
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

  if (isLoading && data.length === 0) {
    return (
      <TableShell className={tableConfig?.className}>
        <div className="space-y-3">
          <div className="h-10 animate-pulse rounded-lg bg-mono-40 dark:bg-mono-170" />
          <div className="h-14 animate-pulse rounded-lg bg-mono-40 dark:bg-mono-170" />
          <div className="h-14 animate-pulse rounded-lg bg-mono-40 dark:bg-mono-170" />
        </div>
      </TableShell>
    );
  }

  if (error && data.length === 0) {
    return (
      <TableShell className={tableConfig?.className}>
        <TableStatus
          title={errorTableProps?.title ?? 'Unable to load data'}
          description={
            errorTableProps?.description ??
            `We could not load the latest data. ${diagnostics}`
          }
          buttonText={
            errorTableProps?.buttonText ?? (hasRetry ? 'Retry' : undefined)
          }
          buttonProps={hasRetry ? { onClick: () => void onRetry() } : undefined}
        />
      </TableShell>
    );
  }

  if (isEmpty) {
    return (
      <TableShell className={tableConfig?.className}>
        <TableStatus
          title={
            emptyTableProps?.title ?? `No ${title?.toLowerCase() ?? 'data'} yet`
          }
          description={
            emptyTableProps?.description ?? 'There is no indexed data yet.'
          }
        />
      </TableShell>
    );
  }

  return (
    <Table
      tableProps={tableProps}
      variant={TableVariant.GLASS_OUTER}
      isPaginated
      title={hideTitle ? undefined : title}
      tableClassName={tableConfig?.tableClassName}
      thClassName={tableConfig?.thClassName}
      tbodyClassName={tableConfig?.tbodyClassName}
      trClassName={tableConfig?.trClassName}
      tdClassName={tableConfig?.tdClassName}
      paginationClassName={tableConfig?.paginationClassName}
    />
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
    variant={CardVariant.GLASS}
    withShadow
    className={twMerge('w-full', className)}
  >
    {children}
  </Card>
);

const TableStatus = ({
  title,
  description,
  buttonText,
  buttonProps,
}: Pick<
  TableStatusProps,
  'title' | 'description' | 'buttonText' | 'buttonProps'
>) => (
  <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-8 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mono-20 dark:bg-mono-190">
      <span className="text-xl opacity-50">∅</span>
    </div>
    <h3 className="font-display text-lg font-bold text-mono-200 dark:text-mono-0">
      {title}
    </h3>
    <p className="max-w-md text-sm leading-relaxed text-mono-120 dark:text-mono-100">
      {description}
    </p>
    {buttonText ? (
      <button
        className="mt-2 rounded-lg border border-mono-60 dark:border-mono-170 px-4 py-1.5 text-xs font-bold text-mono-200 dark:text-mono-0 transition-colors hover:border-purple-40/40"
        {...buttonProps}
      >
        {buttonText}
      </button>
    ) : null}
  </div>
);
