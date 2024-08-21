import {
  TanglePrimitivesCurrencyTokenSymbol,
  TanglePrimitivesTimeUnit,
} from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';
import { HexString } from '@polkadot/util/types';

import { CrossChainTimeUnit } from '../../utils/CrossChainTime';
import { StaticAssetPath } from '..';

export enum LsProtocolId {
  POLKADOT,
  PHALA,
  MOONBEAM,
  ASTAR,
  MANTA,
  TANGLE_RESTAKING_PARACHAIN,
  CHAINLINK,
  THE_GRAPH,
  LIVEPEER,
  POLYGON,
}

export type LsErc20TokenId =
  | LsProtocolId.CHAINLINK
  | LsProtocolId.THE_GRAPH
  | LsProtocolId.LIVEPEER
  | LsProtocolId.POLYGON;

export type LsParachainChainId = Exclude<LsProtocolId, LsErc20TokenId>;

export enum LsToken {
  DOT = 'DOT',
  GLMR = 'GLMR',
  MANTA = 'MANTA',
  ASTAR = 'ASTR',
  PHALA = 'PHALA',
  TNT = 'TNT',
  LINK = 'LINK',
  GRT = 'GRT',
  LPT = 'LPT',
  POL = 'POL',
}

export type LsErc20Token =
  | LsToken.LINK
  | LsToken.GRT
  | LsToken.LPT
  | LsToken.POL;

export type LsParachainToken = Exclude<LsToken, LsErc20Token>;

type ProtocolDefCommon = {
  name: string;
  decimals: number;
  timeUnit: CrossChainTimeUnit;
  unstakingPeriod: number;
  logo: StaticAssetPath;
};

export interface LsParachainChainDef extends ProtocolDefCommon {
  type: 'parachain';
  id: LsParachainChainId;
  name: string;
  token: LsParachainToken;
  currency: ParachainCurrency;
  rpcEndpoint: string;
}

export interface LsErc20TokenDef extends ProtocolDefCommon {
  type: 'erc20';
  id: LsErc20TokenId;
  token: LsErc20Token;
  address: HexString;
  liquifierAdapterAddress: HexString;
  liquifierTgTokenAddress: HexString;
}

export type LsProtocolDef = LsParachainChainDef | LsErc20TokenDef;

export type LsCardSearchParams = {
  amount: BN;
  chainId: LsProtocolId;
};

export enum LsSearchParamKey {
  AMOUNT = 'amount',
  PROTOCOL_ID = 'protocol',
  ACTION = 'action',
}

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

// TODO: Temporary manual override until the Parachain types are updated.
export type ParachainCurrency = TanglePrimitivesCurrencyTokenSymbol['type'];
// | Exclude<TanglePrimitivesCurrencyTokenSymbol['type'], 'Bnc'>
// | 'Tnt';

export type LsParachainCurrencyKey =
  | { lst: ParachainCurrency }
  | { Native: ParachainCurrency };

export type LsParachainTimeUnit = TanglePrimitivesTimeUnit['type'];

export type LsSimpleParachainTimeUnit = {
  value: number;
  unit: LsParachainTimeUnit;
};
