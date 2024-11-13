import type { BN } from '@polkadot/util';
import type { WebbProviderType } from '@webb-tools/abstract-api-provider/types';

export type TangleTokenSymbol = 'tTNT' | 'TNT';

export type AddressWithIdentity = {
  address: string;
  identity: string;
};

export type Payout = {
  era: number;
  validator: AddressWithIdentity;
  validatorTotalStake: BN;
  nominators: AddressWithIdentity[];
  validatorTotalReward: BN;
  nominatorTotalReward: BN;
  nominatorTotalRewardRaw: BN;
};

export const ExplorerType = {
  Substrate: 'polkadot' as WebbProviderType,
  EVM: 'web3' as WebbProviderType,
} as const;
