import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';

import { CrossChainTimeUnit } from '../../utils/CrossChainTime';
import { StaticAssetPath } from '..';
import {
  LsErc20TokenDef,
  LsErc20TokenId,
  LsParachainChainDef,
  LsParachainChainId,
  LsParachainToken,
  LsProtocolDef,
  LsProtocolId,
  LsToken,
} from './types';

const CHAINLINK: LsErc20TokenDef = {
  type: 'erc20',
  id: LsProtocolId.CHAINLINK,
  name: 'Chainlink',
  // TODO: Add logo and link it here.
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_PHALA,
  token: LsToken.LINK,
  decimals: 18,
  // TODO: Use Liquifier's testnet address if the environment is development.
  address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  // TODO: Use the actual Chainlink Liquifier Adapter address. This is likely deployed to a testnet (Tenderly?).
  liquifierAdapterAddress: '0x',
  liquifierTgTokenAddress: '0x',
  timeUnit: CrossChainTimeUnit.DAY,
  unstakingPeriod: 7,
};

const THE_GRAPH: LsErc20TokenDef = {
  type: 'erc20',
  id: LsProtocolId.THE_GRAPH,
  name: 'The Graph',
  // TODO: Add logo and link it here.
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_PHALA,
  token: LsToken.GRT,
  decimals: 18,
  // TODO: Use Liquifier's testnet address if the environment is development.
  address: '0xc944E90C64B2c07662A292be6244BDf05Cda44a7',
  // TODO: Use the actual Chainlink Liquifier Adapter address. This is likely deployed to a testnet (Tenderly?).
  liquifierAdapterAddress: '0x',
  liquifierTgTokenAddress: '0x',
  timeUnit: CrossChainTimeUnit.DAY,
  unstakingPeriod: 28,
};

const LIVEPEER: LsErc20TokenDef = {
  type: 'erc20',
  id: LsProtocolId.LIVEPEER,
  name: 'Livepeer',
  // TODO: Add logo and link it here.
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_PHALA,
  token: LsToken.LPT,
  decimals: 18,
  // TODO: Use Liquifier's testnet address if the environment is development.
  address: '0x58b6A8A3302369DAEc383334672404Ee733aB239',
  // TODO: Use the actual Chainlink Liquifier Adapter address. This is likely deployed to a testnet (Tenderly?).
  liquifierAdapterAddress: '0x',
  liquifierTgTokenAddress: '0x',
  timeUnit: CrossChainTimeUnit.LIVEPEER_ROUND,
  unstakingPeriod: 7,
};

const POLYGON: LsErc20TokenDef = {
  type: 'erc20',
  id: LsProtocolId.POLYGON,
  name: 'Polygon',
  // TODO: Add logo and link it here.
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_PHALA,
  token: LsToken.POL,
  decimals: 18,
  // TODO: Use Liquifier's testnet address if the environment is development.
  address: '0x0D500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  // TODO: Use the actual Chainlink Liquifier Adapter address. This is likely deployed to a testnet (Tenderly?).
  liquifierAdapterAddress: '0x',
  liquifierTgTokenAddress: '0x',
  timeUnit: CrossChainTimeUnit.POLYGON_CHECKPOINT,
  unstakingPeriod: 82,
};

const POLKADOT: LsParachainChainDef = {
  type: 'parachain',
  id: LsProtocolId.POLKADOT,
  name: 'Polkadot',
  token: LsToken.DOT,
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_POLKADOT,
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

export const LS_ERC20_TOKEN_MAP: Record<LsErc20TokenId, LsErc20TokenDef> = {
  [LsProtocolId.CHAINLINK]: CHAINLINK,
  [LsProtocolId.THE_GRAPH]: THE_GRAPH,
  [LsProtocolId.LIVEPEER]: LIVEPEER,
  [LsProtocolId.POLYGON]: POLYGON,
};

export const LS_PROTOCOLS: LsProtocolDef[] = [
  ...Object.values(LS_PARACHAIN_CHAIN_MAP),
  ...Object.values(LS_ERC20_TOKEN_MAP),
];

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

export const LS_PARACHAIN_TOKENS = [
  LsToken.DOT,
  LsToken.GLMR,
  LsToken.MANTA,
  LsToken.ASTAR,
  LsToken.PHALA,
  LsToken.TNT,
] as const satisfies LsParachainToken[];

export const TVS_TOOLTIP =
  "Total Value Staked (TVS) refers to the total value of assets that are currently staked for this network in fiat currency. Generally used as an indicator of a network's security and trustworthiness.";

export const LST_PREFIX = 'tg';
