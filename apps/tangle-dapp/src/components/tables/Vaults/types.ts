import { TableStatusProps } from '@webb-tools/tangle-shared-ui/components/tables/TableStatus';
import type { Table } from '@webb-tools/webb-ui-components/components/Table';
import type { ComponentProps } from 'react';

export type VaultData = {
  id: number;
  name: string;
  apyPercentage: number | null;
  tokenCount: number;
  tvlInUsd: number | null;
  representToken: string;
};

export type Props = {
  data?: VaultData[];
  isLoading?: boolean;
  loadingTableProps?: Partial<TableStatusProps>;
  emptyTableProps?: Partial<TableStatusProps>;
  tableProps?: Partial<ComponentProps<typeof Table<VaultData>>>;
};
