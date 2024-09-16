import {
  TanglePrimitivesCurrencyTokenSymbol,
  TanglePrimitivesTimeUnit,
} from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';
import { HexString } from '@polkadot/util/types';

import {
  LsNetworkEntityAdapter,
  ProtocolEntity,
} from '../../data/liquidStaking/adapter';
import { SubstrateAddress } from '../../types/utils';
import { CrossChainTimeUnit } from '../../utils/CrossChainTime';

export enum LsProtocolId {
  POLKADOT,
  PHALA,
  MOONBEAM,
  ASTAR,
  MANTA,
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

type ProtocolDefCommon = {
  name: string;
  decimals: number;
  timeUnit: CrossChainTimeUnit;
  unstakingPeriod: number;
  chainIconFileName: string;
};

export enum LsNetworkId {
  TANGLE_RESTAKING_PARACHAIN,
  ETHEREUM_MAINNET_LIQUIFIER,
}

export interface LsParachainChainDef<T extends ProtocolEntity = ProtocolEntity>
  extends ProtocolDefCommon {
  networkId: LsNetworkId.TANGLE_RESTAKING_PARACHAIN;
  id: LsParachainChainId;
  name: string;
  token: LsParachainToken;
  currency: ParachainCurrency;
  rpcEndpoint: string;
  ss58Prefix: number;
  adapter: LsNetworkEntityAdapter<T>;
}

export interface LsLiquifierProtocolDef extends ProtocolDefCommon {
  networkId: LsNetworkId.ETHEREUM_MAINNET_LIQUIFIER;
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
  protocolId: LsProtocolId;
};

export enum LsSearchParamKey {
  AMOUNT = 'amount',
  PROTOCOL_ID = 'protocol',
  ACTION = 'action',
  NETWORK_ID = 'network',
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

export type LsParachainSimpleTimeUnit = {
  value: number;
  unit: LsParachainTimeUnit;
};

export type LsNetwork = {
  type: LsNetworkId;
  networkName: string;
  chainIconFileName: string;
  defaultProtocolId: LsProtocolId;
  protocols: LsProtocolDef[];
};

export type LsPool = {
  id: number;
  metadata?: string;
  ownerAddress?: SubstrateAddress;
  ownerStake?: BN;
  validators: SubstrateAddress[];
  totalStaked: BN;
  apyPercentage?: number;
  commissionPercentage?: number;
};
