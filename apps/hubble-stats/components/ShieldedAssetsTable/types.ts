import { PresetTypedChainId } from '@webb-tools/dapp-types';

import { PoolType } from '../PoolTypeChip/types';
export interface ShieldedAssetType {
  address: string;
  poolAddress: string;
  symbol: string;
  url: string | undefined;
  poolType: PoolType;
  composition: string[];
  deposits24h: number | undefined;
  withdrawals24h: number | undefined;
  typedChainIds: PresetTypedChainId[];
}

export interface ShieldedAssetsTableProps {
  data?: ShieldedAssetType[];
  pageSize: number;
}
