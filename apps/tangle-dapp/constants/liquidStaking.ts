import {
  TanglePrimitivesCurrencyTokenSymbol,
  TanglePrimitivesTimeUnit,
} from '@polkadot/types/lookup';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config';

import { StaticAssetPath } from '.';

export enum LiquidStakingChainId {
  POLKADOT = 'Polkadot',
  PHALA = 'Phala',
  MOONBEAM = 'Moonbeam',
  ASTAR = 'Astar',
  MANTA = 'Manta',
  TANGLE_RESTAKING_PARACHAIN = 'Tangle Parachain',
}

export enum LiquidStakingToken {
  DOT = 'DOT',
  GLMR = 'GLMR',
  MANTA = 'MANTA',
  ASTAR = 'ASTAR',
  PHALA = 'PHALA',
  TNT = 'TNT',
}

// TODO: Temporary manual override until the Parachain types are updated.
export type LiquidStakingCurrency =
  | Exclude<TanglePrimitivesCurrencyTokenSymbol['type'], 'Bnc'>
  | 'Tnt';

export type LiquidStakingChainDef = {
  id: LiquidStakingChainId;
  name: string;
  token: LiquidStakingToken;
  logo: StaticAssetPath;
  networkName: string;
  currency: LiquidStakingCurrency;
  decimals: number;
};

const POLKADOT: LiquidStakingChainDef = {
  id: LiquidStakingChainId.POLKADOT,
  name: 'Polkadot',
  token: LiquidStakingToken.DOT,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_POLKADOT,
  networkName: 'Polkadot Mainnet',
  currency: 'Dot',
  decimals: 10,
};

const PHALA: LiquidStakingChainDef = {
  id: LiquidStakingChainId.PHALA,
  name: 'Phala',
  token: LiquidStakingToken.PHALA,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_PHALA,
  networkName: 'Phala',
  currency: 'Pha',
  decimals: 18,
};

const MOONBEAM: LiquidStakingChainDef = {
  id: LiquidStakingChainId.MOONBEAM,
  name: 'Moonbeam',
  token: LiquidStakingToken.GLMR,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_GLIMMER,
  networkName: 'Moonbeam',
  // TODO: No currency entry for GLMR in the Tangle Primitives?
  currency: 'Dot',
  decimals: 18,
};

const ASTAR: LiquidStakingChainDef = {
  id: LiquidStakingChainId.ASTAR,
  name: 'Astar',
  token: LiquidStakingToken.ASTAR,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_ASTAR,
  networkName: 'Astar',
  // TODO: No currency entry for ASTAR in the Tangle Primitives?
  currency: 'Dot',
  decimals: 18,
};

const MANTA: LiquidStakingChainDef = {
  id: LiquidStakingChainId.MANTA,
  name: 'Manta',
  token: LiquidStakingToken.MANTA,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_MANTA,
  networkName: 'Manta',
  // TODO: No currency entry for ASTAR in the Tangle Primitives?
  currency: 'Dot',
  decimals: 18,
};

const TANGLE_RESTAKING_PARACHAIN: LiquidStakingChainDef = {
  id: LiquidStakingChainId.TANGLE_RESTAKING_PARACHAIN,
  name: 'Tangle Parachain',
  token: LiquidStakingToken.TNT,
  logo: StaticAssetPath.LIQUID_STAKING_TANGLE_LOGO,
  networkName: 'Tangle Parachain',
  currency: 'Tnt',
  decimals: TANGLE_TOKEN_DECIMALS,
};

export const LIQUID_STAKING_CHAIN_MAP: Record<
  LiquidStakingChainId,
  LiquidStakingChainDef
> = {
  [LiquidStakingChainId.POLKADOT]: POLKADOT,
  [LiquidStakingChainId.PHALA]: PHALA,
  [LiquidStakingChainId.MOONBEAM]: MOONBEAM,
  [LiquidStakingChainId.ASTAR]: ASTAR,
  [LiquidStakingChainId.MANTA]: MANTA,
  [LiquidStakingChainId.TANGLE_RESTAKING_PARACHAIN]: TANGLE_RESTAKING_PARACHAIN,
};

export const LIQUID_STAKING_CHAINS: LiquidStakingChainDef[] = Object.values(
  LIQUID_STAKING_CHAIN_MAP,
);

// TODO: Instead of mapping to names, map to network/chain definitions themselves. This avoids redundancy and relies on a centralized definition for the network/chain which is better, since it simplifies future refactoring.
export const LS_CHAIN_TO_NETWORK_NAME: Record<LiquidStakingChainId, string> = {
  [LiquidStakingChainId.POLKADOT]: 'Polkadot Mainnet',
  [LiquidStakingChainId.PHALA]: 'Phala',
  [LiquidStakingChainId.MOONBEAM]: 'Moonbeam',
  [LiquidStakingChainId.ASTAR]: 'Astar',
  [LiquidStakingChainId.MANTA]: 'Manta',
  [LiquidStakingChainId.TANGLE_RESTAKING_PARACHAIN]: 'Tangle Parachain',
};

export const TVS_TOOLTIP =
  "Total Value Staked (TVS) refers to the total value of assets that are currently staked for this network in fiat currency. Generally used as an indicator of a network's security and trustworthiness.";

export const LIQUID_STAKING_TOKEN_PREFIX = 'tg';

export type LiquidStakingCurrencyKey =
  | { lst: LiquidStakingCurrency }
  | { Native: LiquidStakingCurrency };

export type LiquidStakingTimeUnit = TanglePrimitivesTimeUnit['type'];

export type LiquidStakingTimeUnitInstance = {
  value: number;
  unit: LiquidStakingTimeUnit;
};
