import { PoolType } from '../PoolTypeChip/types';

export interface ShieldedAssetType {
  address: string;
  symbol: string;
  url: string;
  poolType: PoolType;
  composition: string[];
  deposits24h: number;
  tvl: number;
  typedChainIds: number[];
}

export interface ShieldedAssetsTableProps {
  data?: ShieldedAssetType[];
  pageSize: number;
}
