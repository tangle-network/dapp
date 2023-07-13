import { PoolType } from '../table/types';

export interface ShieldedAssetType {
  assetAddress: string;
  assetSymbol: string;
  assetsUrl: string;
  poolType: PoolType;
  composition: string[];
  deposits24h: number;
  tvl: number;
  chains: string[];
}

export interface ShieldedAssetsTableProps {
  data: ShieldedAssetType[];
  globalSearchText: string;
  pageSize: number;
}
