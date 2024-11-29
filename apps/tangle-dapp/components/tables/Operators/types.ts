import type { TableStatusProps } from '@webb-tools/tangle-shared-ui/components/tables/TableStatus';
import type { OperatorData } from '@webb-tools/tangle-shared-ui/types';
import type { Table } from '@webb-tools/webb-ui-components/components/Table';
import type { ComponentProps } from 'react';

export type Props = {
  isLoading?: boolean;
  data?: OperatorData[];
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  loadingTableProps?: Partial<TableStatusProps>;
  emptyTableProps?: Partial<TableStatusProps>;
  tableProps?: Partial<ComponentProps<typeof Table>>;
};
