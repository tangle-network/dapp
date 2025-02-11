import { TableStatusProps } from '@webb-tools/tangle-shared-ui/components/tables/TableStatus';
import type { Table } from '@webb-tools/webb-ui-components/components/Table';
import type { ComponentProps } from 'react';
import type { VaultType } from '../../../utils/calculateVaults';

export type Props = {
  data?: VaultType[];
  isLoading?: boolean;
  loadingTableProps?: Partial<TableStatusProps>;
  emptyTableProps?: Partial<TableStatusProps>;
  tableProps?: Partial<ComponentProps<typeof Table<VaultType>>>;
};
