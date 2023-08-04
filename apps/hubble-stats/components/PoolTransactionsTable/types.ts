import { ActivityType } from '../table/types';

export type PoolTransactionType = {
  txHash: string;
  activity: ActivityType;
  tokenAmount: number;
  tokenSymbol: string;
  sourceTypedChainId: number;
  destinationTypedChainId?: number;
  time?: string;
};

export interface PoolTransactionsTableProps {
  data: PoolTransactionType[];
  pageSize: number;
}
