import { Table } from '@tangle-network/ui-components';
import TableStatus from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import { TableVariant } from '@tangle-network/ui-components/components/Table/types';
import { twMerge } from 'tailwind-merge';
import { TangleCloudTableProps } from './type';
import { RowData } from '@tanstack/react-table';

export const TangleCloudTable = <T extends RowData>({
  title,
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

  if (isLoading) {
    return (
      <TableStatus
        {...loadingTableProps}
        title={loadingTableProps?.title ?? 'Loading data ...'}
        description={
          loadingTableProps?.description ??
          'Please wait while we load the data.'
        }
        icon={loadingTableProps?.icon ?? '🔄'}
        className={twMerge('w-full', loadingTableProps?.className)}
      />
    );
  }

  if (error) {
    return (
      <TableStatus
        {...errorTableProps}
        title={errorTableProps?.title ?? 'Unable to Load Data'}
        description={
          errorTableProps?.description ??
          `We could not load the latest data. ${diagnostics}`
        }
        icon={errorTableProps?.icon ?? '⚠️'}
        buttonText={
          errorTableProps?.buttonText ?? (hasRetry ? 'Retry' : undefined)
        }
        buttonProps={
          errorTableProps?.buttonProps ??
          (hasRetry ? { onClick: () => void onRetry() } : undefined)
        }
        className={twMerge('w-full', errorTableProps?.className)}
      />
    );
  }

  if (isEmpty) {
    return (
      <TableStatus
        {...emptyTableProps}
        title={emptyTableProps?.title ?? 'Empty Table'}
        description={emptyTableProps?.description ?? 'No data found'}
        icon={emptyTableProps?.icon ?? '🔍'}
        className={twMerge('w-full', emptyTableProps?.className)}
      />
    );
  }

  return (
    <Table
      title={title}
      variant={TableVariant.GLASS_OUTER}
      isPaginated
      {...tableConfig}
      tableProps={tableProps as any}
      className={twMerge('w-full px-6', tableConfig?.className)}
      tableClassName={tableConfig?.tableClassName}
      thClassName={tableConfig?.thClassName}
      tbodyClassName={tableConfig?.tbodyClassName}
      trClassName={twMerge('group overflow-hidden', tableConfig?.trClassName)}
      tdClassName={twMerge('!p-3 max-w-xs', tableConfig?.tdClassName)}
      paginationClassName={tableConfig?.paginationClassName}
    />
  );
};

TangleCloudTable.displayName = 'TangleCloudTable';
