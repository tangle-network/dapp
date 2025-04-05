import type { BN } from '@polkadot/util';
import type { RestakeAssetId } from '../../../types';

export type VaultAssetData = {
  id: RestakeAssetId;
  name: string;
  symbol: string;
  decimals: number;
  tvl?: BN | null;
  available?: BN | null;
  totalDeposits?: BN | null;
};

export type Props = {
  isShown?: boolean;
  data: VaultAssetData[];
  depositCapacity: BN | undefined;
  tvl: BN | undefined;
  decimals: number;
};
