import { Table, Typography } from '@tangle-network/ui-components';
import TableStatus from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import { TableVariant } from '@tangle-network/ui-components/components/Table/types';
import { twMerge } from 'tailwind-merge';
import { TangleCloudTableProps } from './type';
import { RowData } from '@tanstack/react-table';

const GLASS_CONTAINER_CLASS =
  'w-full px-4 py-4 rounded-2xl overflow-hidden border border-mono-0 dark:border-mono-160 bg-[linear-gradient(180deg,rgba(255,255,255,0.20)0%,rgba(255,255,255,0.00)100%)] dark:bg-[linear-gradient(180deg,rgba(43,47,64,0.20)0%,rgba(43,47,64,0.00)100%)]';

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

  const titleElement = (
    <Typography variant="h5" fw="bold">
      {title}
    </Typography>
  );

  if (isLoading) {
    return (
      <div className={GLASS_CONTAINER_CLASS}>
        {titleElement}

        <TableStatus
          {...loadingTableProps}
          title={loadingTableProps?.title ?? 'Loading data ...'}
          description={
            loadingTableProps?.description ??
            'Please wait while we load the data.'
          }
          icon={loadingTableProps?.icon ?? '🔄'}
          className={twMerge(
            'w-full !border-0 !rounded-none !p-0 mt-3',
            loadingTableProps?.className,
          )}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={GLASS_CONTAINER_CLASS}>
        {titleElement}

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
          className={twMerge(
            'w-full !border-0 !rounded-none !p-0 mt-3',
            errorTableProps?.className,
          )}
        />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={GLASS_CONTAINER_CLASS}>
        {titleElement}

        <TableStatus
          {...emptyTableProps}
          title={emptyTableProps?.title ?? 'Empty Table'}
          description={emptyTableProps?.description ?? 'No data found'}
          icon={emptyTableProps?.icon ?? '🔍'}
          className={twMerge(
            'w-full !border-0 !rounded-none !p-0 mt-3',
            emptyTableProps?.className,
          )}
        />
      </div>
    );
  }

  return (
    <Table
      title={title}
      variant={TableVariant.GLASS_OUTER}
      isPaginated
      {...tableConfig}
      tableProps={tableProps as any}
      className={twMerge('w-full px-6 pt-4', tableConfig?.className)}
      tableClassName={tableConfig?.tableClassName}
      thClassName={tableConfig?.thClassName}
      tbodyClassName={tableConfig?.tbodyClassName}
      trClassName={twMerge('group overflow-hidden', tableConfig?.trClassName)}
      tdClassName={twMerge('!p-3 max-w-xs', tableConfig?.tdClassName)}
      paginationClassName={tableConfig?.paginationClassName}
      titleElement={titleElement}
    />
  );
};

TangleCloudTable.displayName = 'TangleCloudTable';
