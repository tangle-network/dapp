import { BN } from '@polkadot/util';
import { HexString } from '@polkadot/util/types';
import assert from 'assert';

import { CrossChainTimeUnit } from '../../utils/CrossChainTime';
import { StaticAssetPath } from '..';
import { LS_ERC20_TOKEN_MAP } from './liquidStakingErc20';
import {
  LS_PARACHAIN_CHAIN_MAP,
  ParachainCurrency,
} from './liquidStakingParachain';

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

export const LS_PARACHAIN_TOKENS = [
  LsToken.DOT,
  LsToken.GLMR,
  LsToken.MANTA,
  LsToken.ASTAR,
  LsToken.PHALA,
  LsToken.TNT,
] as const satisfies LsParachainToken[];

export type LsParachainToken = Exclude<LsToken, LsErc20Token>;

export const LS_ERC20_TOKEN_IDS = [
  LsProtocolId.CHAINLINK,
  LsProtocolId.THE_GRAPH,
  LsProtocolId.LIVEPEER,
  LsProtocolId.POLYGON,
] as const satisfies LsErc20TokenId[];

export const LS_PARACHAIN_CHAIN_IDS = Object.values(LsProtocolId).filter(
  (value): value is LsParachainChainId =>
    typeof value !== 'string' &&
    !LS_ERC20_TOKEN_IDS.includes(value as LsErc20TokenId),
) satisfies LsParachainChainId[];

type ProtocolDefCommon = {
  name: string;
  decimals: number;
  networkName: string;
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
  networkName: string;
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

export const LS_PROTOCOLS: LsProtocolDef[] = [
  ...Object.values(LS_PARACHAIN_CHAIN_MAP),
  ...Object.values(LS_ERC20_TOKEN_MAP),
];

type IdToDefMap<T extends LsProtocolId> = T extends LsParachainChainId
  ? LsParachainChainDef
  : LsErc20TokenDef;

export const getLsProtocolDef = <T extends LsProtocolId>(
  id: T,
): IdToDefMap<T> => {
  const result = LS_PROTOCOLS.find((def) => def.id === id);

  assert(
    result !== undefined,
    `No protocol definition found for id: ${id} (did you forget to add a new entry to the list?)`,
  );

  return result as IdToDefMap<T>;
};

export const TVS_TOOLTIP =
  "Total Value Staked (TVS) refers to the total value of assets that are currently staked for this network in fiat currency. Generally used as an indicator of a network's security and trustworthiness.";

export const LST_PREFIX = 'tg';
