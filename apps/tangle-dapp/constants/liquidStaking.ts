import {
  TanglePrimitivesCurrencyTokenSymbol,
  TanglePrimitivesTimeUnit,
} from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';

import { StaticAssetPath } from '.';

export enum LsProtocolId {
  POLKADOT,
  PHALA,
  MOONBEAM,
  ASTAR,
  MANTA,
  TANGLE_RESTAKING_PARACHAIN,
  CHAINLINK,
}

export type Erc20ProtocolId = LsProtocolId.CHAINLINK;

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

export type LsParachainProtocolDef = {
  id: LsProtocolId;
  name: string;
  token: LsToken;
  logo: StaticAssetPath;
  networkName: string;
  currency: ParachainCurrency;
  decimals: number;
  rpcEndpoint: string;
};

const POLKADOT: LsParachainProtocolDef = {
  id: LsProtocolId.POLKADOT,
  name: 'Polkadot',
  token: LsToken.DOT,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_POLKADOT,
  networkName: 'Polkadot Mainnet',
  currency: 'Dot',
  decimals: 10,
  rpcEndpoint: 'wss://polkadot-rpc.dwellir.com',
};

const PHALA: LsParachainProtocolDef = {
  id: LsProtocolId.PHALA,
  name: 'Phala',
  token: LsToken.PHALA,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_PHALA,
  networkName: 'Phala',
  currency: 'Pha',
  decimals: 18,
  rpcEndpoint: 'wss://api.phala.network/ws',
};

const MOONBEAM: LsParachainProtocolDef = {
  id: LsProtocolId.MOONBEAM,
  name: 'Moonbeam',
  token: LsToken.GLMR,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_GLIMMER,
  networkName: 'Moonbeam',
  // TODO: No currency entry for GLMR in the Tangle Primitives?
  currency: 'Dot',
  decimals: 18,
  rpcEndpoint: 'wss://moonbeam.api.onfinality.io/public-ws',
};

const ASTAR: LsParachainProtocolDef = {
  id: LsProtocolId.ASTAR,
  name: 'Astar',
  token: LsToken.ASTAR,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_ASTAR,
  networkName: 'Astar',
  // TODO: No currency entry for ASTAR in the Tangle Primitives?
  currency: 'Dot',
  decimals: 18,
  rpcEndpoint: 'wss://astar.api.onfinality.io/public-ws',
};

const MANTA: LsParachainProtocolDef = {
  id: LsProtocolId.MANTA,
  name: 'Manta',
  token: LsToken.MANTA,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_MANTA,
  networkName: 'Manta',
  // TODO: No currency entry for ASTAR in the Tangle Primitives?
  currency: 'Dot',
  decimals: 18,
  rpcEndpoint: 'wss://ws.manta.systems',
};

const TANGLE_RESTAKING_PARACHAIN: LsParachainProtocolDef = {
  id: LsProtocolId.TANGLE_RESTAKING_PARACHAIN,
  name: 'Tangle Parachain',
  token: LsToken.TNT,
  logo: StaticAssetPath.LIQUID_STAKING_TANGLE_LOGO,
  networkName: 'Tangle Parachain',
  currency: 'Bnc',
  decimals: TANGLE_TOKEN_DECIMALS,
  rpcEndpoint: TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
};

const CHAINLINK: LsParachainProtocolDef = {
  id: LsProtocolId.CHAINLINK,
  name: 'Chainlink',
  token: LsToken.LINK,
  networkName: 'Chainlink',
  decimals: 18,
  // TODO: Dummy data. Need to differentiate between EVM and Substrate chains.
  currency: 'Asg',
  logo: StaticAssetPath.LIQUID_STAKING_TANGLE_LOGO,
  rpcEndpoint: 'wss://api.chain.link',
};

export const LS_CHAIN_MAP: Record<LsProtocolId, LsParachainProtocolDef> = {
  [LsProtocolId.POLKADOT]: POLKADOT,
  [LsProtocolId.PHALA]: PHALA,
  [LsProtocolId.MOONBEAM]: MOONBEAM,
  [LsProtocolId.ASTAR]: ASTAR,
  [LsProtocolId.MANTA]: MANTA,
  [LsProtocolId.TANGLE_RESTAKING_PARACHAIN]: TANGLE_RESTAKING_PARACHAIN,
  [LsProtocolId.CHAINLINK]: CHAINLINK,
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

export type LsCardSearchParams = {
  amount: BN;
  chainId: LsProtocolId;
};

export enum LsSearchParamKey {
  AMOUNT = 'amount',
  CHAIN_ID = 'chainId',
  ACTION = 'action',
}
