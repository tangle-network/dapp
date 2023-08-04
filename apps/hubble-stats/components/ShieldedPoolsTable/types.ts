import { PoolType } from '../PoolTypeChip/types';

export interface ShieldedPoolType {
  symbol: string;
  address: string;
  poolType: PoolType;
  token: number;
  deposits24h: number;
  tvl: number;
  typedChainIds: number[];
}

export interface ShieldedPoolsTableProps {
  data?: ShieldedPoolType[];
  pageSize: number;
}
