import { TableStatusProps } from '@webb-tools/tangle-shared-ui/components/tables/TableStatus';
import type { Table } from '@webb-tools/webb-ui-components/components/Table';
import type { ComponentProps } from 'react';

export type VaultToken = {
  name: string;
  symbol: string;
  amount: number | string;
};

export type OperatorData = {
  address: string;
  identityName: string;
  restakersCount: number;
  concentrationPercentage: number | null;
  tvlInUsd: number | null;
  vaultTokens: VaultToken[];
};

export type Props = {
  isLoading?: boolean;
  data?: OperatorData[];
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  loadingTableProps?: Partial<TableStatusProps>;
  emptyTableProps?: Partial<TableStatusProps>;
  tableProps?: Partial<ComponentProps<typeof Table>>;
};
