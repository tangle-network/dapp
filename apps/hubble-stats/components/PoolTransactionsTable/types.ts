import { ChainBase } from '@webb-tools/dapp-config';

import { ActivityType } from '../table/types';

export type PoolTransactionType = {
  txHash: string;
  activity: ActivityType;
  tokenAmount: number;
  tokenSymbol: string;
  source: string;
  sourceChainType: ChainBase;
  destination: string;
  time: number;
};

export interface PoolTransactionsTableProps {
  data: PoolTransactionType[];
  globalSearchText: string;
  pageSize: number;
}
