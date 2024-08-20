import {
  TanglePrimitivesCurrencyTokenSymbol,
  TanglePrimitivesTimeUnit,
} from '@polkadot/types/lookup';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';

import { CrossChainTimeUnit } from '../../utils/CrossChainTime';
import { StaticAssetPath } from '..';
import {
  LsParachainChainDef,
  LsParachainChainId,
  LsProtocolId,
  LsToken,
} from './types';

const POLKADOT: LsParachainChainDef = {
  type: 'parachain',
  id: LsProtocolId.POLKADOT,
  name: 'Polkadot',
  token: LsToken.DOT,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_POLKADOT,
  networkName: 'Polkadot Mainnet',
  currency: 'Dot',
  decimals: 10,
  rpcEndpoint: 'wss://polkadot-rpc.dwellir.com',
  timeUnit: CrossChainTimeUnit.POLKADOT_ERA,
  unstakingPeriod: 28,
};

const PHALA: LsParachainChainDef = {
  type: 'parachain',
  id: LsProtocolId.PHALA,
  name: 'Phala',
  token: LsToken.PHALA,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_PHALA,
  networkName: 'Phala',
  currency: 'Pha',
  decimals: 18,
  rpcEndpoint: 'wss://api.phala.network/ws',
  timeUnit: CrossChainTimeUnit.DAY,
  unstakingPeriod: 7,
};

const MOONBEAM: LsParachainChainDef = {
  type: 'parachain',
  id: LsProtocolId.MOONBEAM,
  name: 'Moonbeam',
  token: LsToken.GLMR,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_GLIMMER,
  networkName: 'Moonbeam',
  // TODO: No currency entry for GLMR in the Tangle Primitives?
  currency: 'Dot',
  decimals: 18,
  rpcEndpoint: 'wss://moonbeam.api.onfinality.io/public-ws',
  timeUnit: CrossChainTimeUnit.MOONBEAM_ROUND,
  unstakingPeriod: 28,
};

const ASTAR: LsParachainChainDef = {
  type: 'parachain',
  id: LsProtocolId.ASTAR,
  name: 'Astar',
  token: LsToken.ASTAR,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_ASTAR,
  networkName: 'Astar',
  // TODO: No currency entry for ASTAR in the Tangle Primitives?
  currency: 'Dot',
  decimals: 18,
  rpcEndpoint: 'wss://astar.api.onfinality.io/public-ws',
  timeUnit: CrossChainTimeUnit.ASTAR_ERA,
  unstakingPeriod: 7,
};

const MANTA: LsParachainChainDef = {
  type: 'parachain',
  id: LsProtocolId.MANTA,
  name: 'Manta',
  token: LsToken.MANTA,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_MANTA,
  networkName: 'Manta',
  // TODO: No currency entry for ASTAR in the Tangle Primitives?
  currency: 'Dot',
  decimals: 18,
  rpcEndpoint: 'wss://ws.manta.systems',
  timeUnit: CrossChainTimeUnit.DAY,
  unstakingPeriod: 7,
};

const TANGLE_RESTAKING_PARACHAIN: LsParachainChainDef = {
  type: 'parachain',
  id: LsProtocolId.TANGLE_RESTAKING_PARACHAIN,
  name: 'Tangle Parachain',
  token: LsToken.TNT,
  logo: StaticAssetPath.LIQUID_STAKING_TANGLE_LOGO,
  networkName: 'Tangle Parachain',
  currency: 'Bnc',
  decimals: TANGLE_TOKEN_DECIMALS,
  rpcEndpoint: TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  timeUnit: CrossChainTimeUnit.TANGLE_RESTAKING_PARACHAIN_ERA,
  // TODO: The Tangle Restaking Parachain is a special case.
  unstakingPeriod: 0,
};

export const LS_PARACHAIN_CHAIN_MAP: Record<
  LsParachainChainId,
  LsParachainChainDef
> = {
  [LsProtocolId.POLKADOT]: POLKADOT,
  [LsProtocolId.PHALA]: PHALA,
  [LsProtocolId.MOONBEAM]: MOONBEAM,
  [LsProtocolId.ASTAR]: ASTAR,
  [LsProtocolId.MANTA]: MANTA,
  [LsProtocolId.TANGLE_RESTAKING_PARACHAIN]: TANGLE_RESTAKING_PARACHAIN,
};

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
