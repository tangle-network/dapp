import { RowData, type useReactTable } from '@tanstack/react-table';
import type { ButtonProps } from '@tangle-network/sandbox-ui/primitives';
import type React from 'react';

export type TableStatusProps = {
  icon?: React.ReactNode;
  title: string;
  description: string;
  buttonText?: string;
  buttonProps?: ButtonProps;
  className?: string;
};

export type TangleCloudTableConfig = {
  className?: string;
  tableClassName?: string;
  thClassName?: string;
  tbodyClassName?: string;
  trClassName?: string;
  tdClassName?: string;
  paginationClassName?: string;
  expandedRowClassName?: string;
};

export interface TangleCloudTableProps<T extends RowData> {
  title: string;
  hideTitle?: boolean;
  data: T[];
  isLoading: boolean;
  error: Error | null;
  loadingTableProps?: Partial<TableStatusProps>;
  errorTableProps?: Partial<TableStatusProps>;
  emptyTableProps?: Partial<TableStatusProps>;
  onRetry?: () => void | Promise<unknown>;
  tableConfig?: TangleCloudTableConfig;
  tableProps: ReturnType<typeof useReactTable<T>>;
}
