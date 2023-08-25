import { PresetTypedChainId } from '@webb-tools/dapp-types';

import { PoolType } from '../PoolTypeChip/types';

export interface ShieldedPoolType {
  symbol: string;
  address: string;
  poolType: PoolType;
  token: number;
  deposits24h: number | undefined;
  tvl: number | undefined;
  typedChainIds: PresetTypedChainId[];
}

export interface ShieldedPoolsTableProps {
  data?: ShieldedPoolType[];
  pageSize: number;
}
