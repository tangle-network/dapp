import {
  TanglePrimitivesCurrencyTokenSymbol,
  TanglePrimitivesTimeUnit,
} from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';

import { StaticAssetPath } from '..';

export enum LsParachainChainId {
  POLKADOT,
  PHALA,
  MOONBEAM,
  ASTAR,
  MANTA,
  TANGLE_RESTAKING_PARACHAIN,
}

export enum LsParachainToken {
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

export type LsParachainProtocolDef = {
  id: LsParachainChainId;
  name: string;
  token: LsParachainToken;
  logo: StaticAssetPath;
  networkName: string;
  currency: ParachainCurrency;
  decimals: number;
  rpcEndpoint: string;
};

const POLKADOT: LsParachainProtocolDef = {
  id: LsParachainChainId.POLKADOT,
  name: 'Polkadot',
  token: LsParachainToken.DOT,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_POLKADOT,
  networkName: 'Polkadot Mainnet',
  currency: 'Dot',
  decimals: 10,
  rpcEndpoint: 'wss://polkadot-rpc.dwellir.com',
};

const PHALA: LsParachainProtocolDef = {
  id: LsParachainChainId.PHALA,
  name: 'Phala',
  token: LsParachainToken.PHALA,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_PHALA,
  networkName: 'Phala',
  currency: 'Pha',
  decimals: 18,
  rpcEndpoint: 'wss://api.phala.network/ws',
};

const MOONBEAM: LsParachainProtocolDef = {
  id: LsParachainChainId.MOONBEAM,
  name: 'Moonbeam',
  token: LsParachainToken.GLMR,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_GLIMMER,
  networkName: 'Moonbeam',
  // TODO: No currency entry for GLMR in the Tangle Primitives?
  currency: 'Dot',
  decimals: 18,
  rpcEndpoint: 'wss://moonbeam.api.onfinality.io/public-ws',
};

const ASTAR: LsParachainProtocolDef = {
  id: LsParachainChainId.ASTAR,
  name: 'Astar',
  token: LsParachainToken.ASTAR,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_ASTAR,
  networkName: 'Astar',
  // TODO: No currency entry for ASTAR in the Tangle Primitives?
  currency: 'Dot',
  decimals: 18,
  rpcEndpoint: 'wss://astar.api.onfinality.io/public-ws',
};

const MANTA: LsParachainProtocolDef = {
  id: LsParachainChainId.MANTA,
  name: 'Manta',
  token: LsParachainToken.MANTA,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_MANTA,
  networkName: 'Manta',
  // TODO: No currency entry for ASTAR in the Tangle Primitives?
  currency: 'Dot',
  decimals: 18,
  rpcEndpoint: 'wss://ws.manta.systems',
};

const TANGLE_RESTAKING_PARACHAIN: LsParachainProtocolDef = {
  id: LsParachainChainId.TANGLE_RESTAKING_PARACHAIN,
  name: 'Tangle Parachain',
  token: LsParachainToken.TNT,
  logo: StaticAssetPath.LIQUID_STAKING_TANGLE_LOGO,
  networkName: 'Tangle Parachain',
  currency: 'Bnc',
  decimals: TANGLE_TOKEN_DECIMALS,
  rpcEndpoint: TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
};

export const LS_CHAIN_MAP: Record<LsParachainChainId, LsParachainProtocolDef> =
  {
    [LsParachainChainId.POLKADOT]: POLKADOT,
    [LsParachainChainId.PHALA]: PHALA,
    [LsParachainChainId.MOONBEAM]: MOONBEAM,
    [LsParachainChainId.ASTAR]: ASTAR,
    [LsParachainChainId.MANTA]: MANTA,
    [LsParachainChainId.TANGLE_RESTAKING_PARACHAIN]: TANGLE_RESTAKING_PARACHAIN,
  };

export const LIQUID_STAKING_CHAINS: LsParachainProtocolDef[] =
  Object.values(LS_CHAIN_MAP);

export const TVS_TOOLTIP =
  "Total Value Staked (TVS) refers to the total value of assets that are currently staked for this network in fiat currency. Generally used as an indicator of a network's security and trustworthiness.";

export const LST_PREFIX = 'tg';

// TODO: These should be moved/managed in libs/webb-ui-components/src/constants/networks.ts and not here. This is just a temporary solution.
export type Network = {
  name: string;
  endpoint: string;
  tokenSymbol: LsParachainToken;
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

export type LsCardSearchParams = {
  amount: BN;
  chainId: LsParachainChainId;
};

export enum LsSearchParamKey {
  AMOUNT = 'amount',
  CHAIN_ID = 'chainId',
  ACTION = 'action',
}
