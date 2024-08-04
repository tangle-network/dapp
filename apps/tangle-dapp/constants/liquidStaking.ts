import {
  TanglePrimitivesCurrencyTokenSymbol,
  TanglePrimitivesTimeUnit,
} from '@polkadot/types/lookup';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';

import { StaticAssetPath } from '.';

export enum LsChainId {
  POLKADOT = 'Polkadot',
  PHALA = 'Phala',
  MOONBEAM = 'Moonbeam',
  ASTAR = 'Astar',
  MANTA = 'Manta',
  TANGLE_RESTAKING_PARACHAIN = 'Tangle Parachain',
  CHAINLINK = 'Chainlink',
}

export enum LsToken {
  DOT = 'DOT',
  GLMR = 'GLMR',
  MANTA = 'MANTA',
  ASTAR = 'ASTR',
  PHALA = 'PHALA',
  TNT = 'TNT',
  LINK = 'LINK',
}

// TODO: Temporary manual override until the Parachain types are updated.
export type ParachainCurrency = TanglePrimitivesCurrencyTokenSymbol['type'];
// | Exclude<TanglePrimitivesCurrencyTokenSymbol['type'], 'Bnc'>
// | 'Tnt';

export type LsChainDef = {
  id: LsChainId;
  name: string;
  token: LsToken;
  logo: StaticAssetPath;
  networkName: string;
  currency: ParachainCurrency;
  decimals: number;
  rpcEndpoint: string;
};

const POLKADOT: LsChainDef = {
  id: LsChainId.POLKADOT,
  name: 'Polkadot',
  token: LsToken.DOT,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_POLKADOT,
  networkName: 'Polkadot Mainnet',
  currency: 'Dot',
  decimals: 10,
  rpcEndpoint: 'wss://polkadot-rpc.dwellir.com',
};

const PHALA: LsChainDef = {
  id: LsChainId.PHALA,
  name: 'Phala',
  token: LsToken.PHALA,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_PHALA,
  networkName: 'Phala',
  currency: 'Pha',
  decimals: 18,
  rpcEndpoint: 'wss://api.phala.network/ws',
};

const MOONBEAM: LsChainDef = {
  id: LsChainId.MOONBEAM,
  name: 'Moonbeam',
  token: LsToken.GLMR,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_GLIMMER,
  networkName: 'Moonbeam',
  // TODO: No currency entry for GLMR in the Tangle Primitives?
  currency: 'Dot',
  decimals: 18,
  rpcEndpoint: 'wss://moonbeam.api.onfinality.io/public-ws',
};

const ASTAR: LsChainDef = {
  id: LsChainId.ASTAR,
  name: 'Astar',
  token: LsToken.ASTAR,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_ASTAR,
  networkName: 'Astar',
  // TODO: No currency entry for ASTAR in the Tangle Primitives?
  currency: 'Dot',
  decimals: 18,
  rpcEndpoint: 'wss://astar.api.onfinality.io/public-ws',
};

const MANTA: LsChainDef = {
  id: LsChainId.MANTA,
  name: 'Manta',
  token: LsToken.MANTA,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_MANTA,
  networkName: 'Manta',
  // TODO: No currency entry for ASTAR in the Tangle Primitives?
  currency: 'Dot',
  decimals: 18,
  rpcEndpoint: 'wss://ws.manta.systems',
};

const TANGLE_RESTAKING_PARACHAIN: LsChainDef = {
  id: LsChainId.TANGLE_RESTAKING_PARACHAIN,
  name: 'Tangle Parachain',
  token: LsToken.TNT,
  logo: StaticAssetPath.LIQUID_STAKING_TANGLE_LOGO,
  networkName: 'Tangle Parachain',
  currency: 'Bnc',
  decimals: TANGLE_TOKEN_DECIMALS,
  rpcEndpoint: TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
};

const CHAINLINK: LsChainDef = {
  id: LsChainId.CHAINLINK,
  name: 'Chainlink',
  token: LsToken.LINK,
  networkName: 'Chainlink',
  decimals: 18,
  // TODO: Dummy data. Need to differentiate between EVM and Substrate chains.
  currency: 'Asg',
  logo: StaticAssetPath.LIQUID_STAKING_TANGLE_LOGO,
  rpcEndpoint: 'wss://api.chain.link',
};

export const LS_CHAIN_MAP: Record<LsChainId, LsChainDef> = {
  [LsChainId.POLKADOT]: POLKADOT,
  [LsChainId.PHALA]: PHALA,
  [LsChainId.MOONBEAM]: MOONBEAM,
  [LsChainId.ASTAR]: ASTAR,
  [LsChainId.MANTA]: MANTA,
  [LsChainId.TANGLE_RESTAKING_PARACHAIN]: TANGLE_RESTAKING_PARACHAIN,
  [LsChainId.CHAINLINK]: CHAINLINK,
};

export const LIQUID_STAKING_CHAINS: LsChainDef[] = Object.values(LS_CHAIN_MAP);

export const TVS_TOOLTIP =
  "Total Value Staked (TVS) refers to the total value of assets that are currently staked for this network in fiat currency. Generally used as an indicator of a network's security and trustworthiness.";

export const LST_PREFIX = 'tg';

// TODO: These should be moved/managed in libs/webb-ui-components/src/constants/networks.ts and not here. This is just a temporary solution.
export type Network = {
  name: string;
  endpoint: string;
  tokenSymbol: LsToken;
  chainType: NetworkType;
};

export enum NetworkType {
  RELAY_CHAIN = 'Relay Chain',
  PARACHAIN = 'Parachain',
}

export type LsParachainCurrencyKey =
  | { lst: ParachainCurrency }
  | { Native: ParachainCurrency };

export type LsParachainTimeUnit = TanglePrimitivesTimeUnit['type'];

export type LsSimpleParachainTimeUnit = {
  value: number;
  unit: LsParachainTimeUnit;
};
