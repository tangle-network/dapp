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
