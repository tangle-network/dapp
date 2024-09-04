import type { Table } from '@webb-tools/webb-ui-components/components/Table';
import type { ComponentProps } from 'react';

import type { TableStatus } from '../../TableStatus';

export type VaultData = {
  id: string;
  name: string;
  apyPercentage: number | null;
  tokensCount: number;
  tvlInUsd: number | null;
  representToken: string;
};

export type Props = {
  data?: VaultData[];
  isLoading?: boolean;
  loadingTableProps?: Partial<ComponentProps<typeof TableStatus>>;
  emptyTableProps?: Partial<ComponentProps<typeof TableStatus>>;
  tableProps?: Partial<ComponentProps<typeof Table<VaultData>>>;
};
