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
  operators?: OperatorData[];
  loadingTableProps?: ComponentProps<typeof TableStatus>;
  emptyTableProps?: ComponentProps<typeof TableStatus>;
  tableProps?: ComponentProps<typeof Table>;
};
