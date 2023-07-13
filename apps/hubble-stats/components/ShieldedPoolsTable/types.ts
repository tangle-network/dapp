import { PoolType } from '../table/types';

export interface ShieldedPoolType {
  poolSymbol: string;
  poolAddress: string;
  poolType: PoolType;
  token: number;
  deposits24h: number;
  tvl: number;
  chains: string[];
}

export interface ShieldedPoolsTableProps {
  data: ShieldedPoolType[];
  globalSearchText: string;
  pageSize: number;
}
