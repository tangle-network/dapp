import {
  TanglePrimitivesCurrencyTokenSymbol,
  TanglePrimitivesTimeUnit,
} from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';
import { HexString } from '@polkadot/util/types';

import { AnyValidator, LsAdapterDef } from '../../data/liquidStaking/adapter';
import { CrossChainTimeUnit } from '../../utils/CrossChainTime';

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

export type LsLiquifierProtocolId =
  | LsProtocolId.CHAINLINK
  | LsProtocolId.THE_GRAPH
  | LsProtocolId.LIVEPEER
  | LsProtocolId.POLYGON;

export type LsParachainChainId = Exclude<LsProtocolId, LsLiquifierProtocolId>;

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

export type LsLiquifierProtocolToken =
  | LsToken.LINK
  | LsToken.GRT
  | LsToken.LPT
  | LsToken.POL;

export type LsParachainToken = Exclude<LsToken, LsLiquifierProtocolToken>;

type ProtocolDefCommon<T extends AnyValidator> = {
  name: string;
  decimals: number;
  timeUnit: CrossChainTimeUnit;
  unstakingPeriod: number;
  chainIconFileName: string;
  adapter: LsAdapterDef<T>;
};

export enum LsProtocolType {
  TANGLE_RESTAKING_PARACHAIN,
  ETHEREUM_MAINNET_LIQUIFIER,
}

export interface LsParachainChainDef<T extends AnyValidator = AnyValidator>
  extends ProtocolDefCommon<T> {
  type: LsProtocolType.TANGLE_RESTAKING_PARACHAIN;
  id: LsParachainChainId;
  name: string;
  token: LsParachainToken;
  currency: ParachainCurrency;
  rpcEndpoint: string;
  ss58Prefix: number;
}

export interface LsLiquifierProtocolDef<T extends AnyValidator = AnyValidator>
  extends ProtocolDefCommon<T> {
  type: LsProtocolType.ETHEREUM_MAINNET_LIQUIFIER;
  id: LsLiquifierProtocolId;
  token: LsLiquifierProtocolToken;
  erc20TokenAddress: HexString;
  liquifierContractAddress: HexString;
  tgTokenContractAddress: HexString;
  unlocksContractAddress: HexString;
}

export type LsProtocolDef = LsParachainChainDef | LsLiquifierProtocolDef;

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

export type LsProtocolTypeMetadata = {
  type: LsProtocolType;
  networkName: string;
  chainIconFileName: string;
  protocols: LsProtocolDef[];
};
