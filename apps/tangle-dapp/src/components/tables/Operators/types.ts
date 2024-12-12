import type { Table } from '@webb-tools/webb-ui-components/components/Table';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import type { ComponentProps } from 'react';

import type { TableStatus } from '../../TableStatus';

export type VaultToken = {
  name: string;
  symbol: string;
  amount: number | string;
};

export type OperatorData = {
  address: SubstrateAddress;
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
  loadingTableProps?: Partial<ComponentProps<typeof TableStatus>>;
  emptyTableProps?: Partial<ComponentProps<typeof TableStatus>>;
  tableProps?: Partial<ComponentProps<typeof Table>>;
};
