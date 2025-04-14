import type { BN } from '@polkadot/util';
import type { RestakeAssetId } from '../../../types';

export type VaultAssetData = {
  id: RestakeAssetId;
  name: string;
  symbol: string;
  decimals: number;
  available?: BN | null;
  deposited?: BN | null;
};

export type Props = {
  isShown?: boolean;
  data: VaultAssetData[];
  depositCapacity: BN | undefined;
  tvl: BN | undefined;
  decimals: number;
};
