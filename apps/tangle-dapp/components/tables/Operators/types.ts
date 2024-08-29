import type { Table } from '@webb-tools/webb-ui-components/components/Table';
import type { ComponentProps } from 'react';

import type { TableStatus } from '../../TableStatus';

export type OperatorData = {
  address: string;
  identityName: string;
  restakersCount: number;
  concentrationPercentage: number;
  tvlInUsd: number;
  vaultTokens: string[];
};

export type Props = {
  isLoading?: boolean;
  data?: OperatorData[];
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  loadingTableProps?: Partial<ComponentProps<typeof TableStatus>>;
  emptyTableProps?: Partial<ComponentProps<typeof TableStatus>>;
  tableProps?: Partial<ComponentProps<typeof Table>>;
};
