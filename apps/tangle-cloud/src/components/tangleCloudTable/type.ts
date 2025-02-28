import { type Table } from '@tangle-network/ui-components';
import { TableStatusProps } from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import { ComponentProps } from 'react';
import { RowData, type useReactTable } from '@tanstack/react-table';

export interface TangleCloudTableProps<T extends RowData> {
  title: string;
  data: T[];
  isLoading: boolean;
  error: Error | null;
  loadingTableProps?: Partial<TableStatusProps>;
  emptyTableProps?: Partial<TableStatusProps>;
  tableConfig?: Partial<ComponentProps<typeof Table<T>>>;
  tableProps: ReturnType<typeof useReactTable<T>>;
}
