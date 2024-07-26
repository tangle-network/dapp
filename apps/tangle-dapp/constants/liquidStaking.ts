import {
  TanglePrimitivesCurrencyTokenSymbol,
  TanglePrimitivesTimeUnit,
} from '@polkadot/types/lookup';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config';

import { StaticAssetPath } from '.';

export enum ParachainChainId {
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
  ASTAR = 'ASTR',
  PHALA = 'PHALA',
  TNT = 'TNT',
}

// TODO: Temporary manual override until the Parachain types are updated.
export type ParachainCurrency = TanglePrimitivesCurrencyTokenSymbol['type'];
// | Exclude<TanglePrimitivesCurrencyTokenSymbol['type'], 'Bnc'>
// | 'Tnt';

export type SubstrateChainTimingSpec = {
  expectedBlockTimeMs: number;
  blocksPerSession: number;
  sessionsPerEra: number;
};

export type ParachainChainDef = {
  id: ParachainChainId;
  name: string;
  token: LiquidStakingToken;
  logo: StaticAssetPath;
  networkName: string;
  currency: ParachainCurrency;
  decimals: number;
  substrateTimingSpec?: SubstrateChainTimingSpec;
  rpcEndpoint: string;
};

const POLKADOT: ParachainChainDef = {
  id: ParachainChainId.POLKADOT,
  name: 'Polkadot',
  token: LiquidStakingToken.DOT,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_POLKADOT,
  networkName: 'Polkadot Mainnet',
  currency: 'Dot',
  decimals: 10,
  rpcEndpoint: 'wss://polkadot-rpc.dwellir.com',
};

const PHALA: ParachainChainDef = {
  id: ParachainChainId.PHALA,
  name: 'Phala',
  token: LiquidStakingToken.PHALA,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_PHALA,
  networkName: 'Phala',
  currency: 'Pha',
  decimals: 18,
  rpcEndpoint: 'wss://api.phala.network/ws',
};

const MOONBEAM: ParachainChainDef = {
  id: ParachainChainId.MOONBEAM,
  name: 'Moonbeam',
  token: LiquidStakingToken.GLMR,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_GLIMMER,
  networkName: 'Moonbeam',
  // TODO: No currency entry for GLMR in the Tangle Primitives?
  currency: 'Dot',
  decimals: 18,
  rpcEndpoint: 'wss://moonbeam.api.onfinality.io/public-ws',
};

const ASTAR: ParachainChainDef = {
  id: ParachainChainId.ASTAR,
  name: 'Astar',
  token: LiquidStakingToken.ASTAR,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_ASTAR,
  networkName: 'Astar',
  // TODO: No currency entry for ASTAR in the Tangle Primitives?
  currency: 'Dot',
  decimals: 18,
  rpcEndpoint: 'wss://astar.api.onfinality.io/public-ws',
};

const MANTA: ParachainChainDef = {
  id: ParachainChainId.MANTA,
  name: 'Manta',
  token: LiquidStakingToken.MANTA,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_MANTA,
  networkName: 'Manta',
  // TODO: No currency entry for ASTAR in the Tangle Primitives?
  currency: 'Dot',
  decimals: 18,
  rpcEndpoint: 'wss://ws.manta.systems',
};

const TANGLE_RESTAKING_PARACHAIN: ParachainChainDef = {
  id: ParachainChainId.TANGLE_RESTAKING_PARACHAIN,
  name: 'Tangle Parachain',
  token: LiquidStakingToken.TNT,
  logo: StaticAssetPath.LIQUID_STAKING_TANGLE_LOGO,
  networkName: 'Tangle Parachain',
  currency: 'Bnc',
  decimals: TANGLE_TOKEN_DECIMALS,
  rpcEndpoint: '',
};

export const PARACHAIN_CHAIN_MAP: Record<ParachainChainId, ParachainChainDef> =
  {
    [ParachainChainId.POLKADOT]: POLKADOT,
    [ParachainChainId.PHALA]: PHALA,
    [ParachainChainId.MOONBEAM]: MOONBEAM,
    [ParachainChainId.ASTAR]: ASTAR,
    [ParachainChainId.MANTA]: MANTA,
    [ParachainChainId.TANGLE_RESTAKING_PARACHAIN]: TANGLE_RESTAKING_PARACHAIN,
  };

export const LIQUID_STAKING_CHAINS: ParachainChainDef[] =
  Object.values(PARACHAIN_CHAIN_MAP);

// TODO: Instead of mapping to names, map to network/chain definitions themselves. This avoids redundancy and relies on a centralized definition for the network/chain which is better, since it simplifies future refactoring.
export const LS_CHAIN_TO_NETWORK_NAME: Record<ParachainChainId, string> = {
  [ParachainChainId.POLKADOT]: 'Polkadot Mainnet',
  [ParachainChainId.PHALA]: 'Phala',
  [ParachainChainId.MOONBEAM]: 'Moonbeam',
  [ParachainChainId.ASTAR]: 'Astar',
  [ParachainChainId.MANTA]: 'Manta',
  [ParachainChainId.TANGLE_RESTAKING_PARACHAIN]: 'Tangle Parachain',
};

export const TVS_TOOLTIP =
  "Total Value Staked (TVS) refers to the total value of assets that are currently staked for this network in fiat currency. Generally used as an indicator of a network's security and trustworthiness.";

export const LST_PREFIX = 'tg';

// TODO: These should be moved/managed in libs/webb-ui-components/src/constants/networks.ts and not here. This is just a temporary solution.
export type Network = {
  name: string;
  endpoint: string;
  tokenSymbol: LiquidStakingToken;
  chainType: NetworkType;
};

export enum NetworkType {
  RELAY_CHAIN = 'Relay Chain',
  PARACHAIN = 'Parachain',
}

export type ParachainCurrencyFetchKey =
  | { lst: ParachainCurrency }
  | { Native: ParachainCurrency };

export type ParachainTimeUnit = TanglePrimitivesTimeUnit['type'];

export type SimpleTimeUnitInstance = {
  value: number;
  unit: ParachainTimeUnit;
};
