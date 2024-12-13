import type { Table } from '@webb-tools/webb-ui-components/components/Table';
import type { ComponentProps, PropsWithChildren } from 'react';
import type { TableStatusProps } from '../../../components/tables/TableStatus';
import type { OperatorData } from '../../../types';

export type Props = {
  isLoading?: boolean;
  data?: OperatorData[];
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  loadingTableProps?: Partial<TableStatusProps>;
  emptyTableProps?: Partial<TableStatusProps>;
  tableProps?: Partial<ComponentProps<typeof Table>>;
  ViewOperatorWrapper?: React.FC<PropsWithChildren<{ address: string }>>;
  RestakeOperatorWrapper?: React.FC<PropsWithChildren<{ address: string }>>;
};
