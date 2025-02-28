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
  loadingTableProps,
  emptyTableProps,
  tableConfig,
  tableProps,
}: TangleCloudTableProps<T>) => {
  const isEmpty = data.length === 0;

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
  } else if (isEmpty) {
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
      trClassName={twMerge(
        'group overflow-hidden',
        '[&>td:not(:last-child)>*]:border-r [&>td:not(:last-child)>*]:border-mono-140',
        tableConfig?.trClassName,
      )}
      tdClassName={twMerge('!p-3 max-w-xs', tableConfig?.tdClassName)}
      paginationClassName={tableConfig?.paginationClassName}
    />
  );
};

TangleCloudTable.displayName = 'TangleCloudTable';
