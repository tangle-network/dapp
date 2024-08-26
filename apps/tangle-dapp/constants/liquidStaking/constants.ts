import { HexString } from '@polkadot/util/types';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';

import { CrossChainTimeUnit } from '../../utils/CrossChainTime';
import { IS_PRODUCTION_ENV } from '../env';
import {
  LsLiquifierProtocolDef,
  LsLiquifierProtocolId,
  LsParachainChainDef,
  LsParachainChainId,
  LsParachainToken,
  LsProtocolDef,
  LsProtocolId,
  LsToken,
} from './types';

// TODO: Deploy to Sepolia and update the addresses.
export const LS_REGISTRY_ADDRESS = IS_PRODUCTION_ENV ? '0x' : '0x';

/**
 * Development only. Sepolia testnet contracts that were
 * deployed to test the liquifier functionality. These contracts
 * use dummy data.
 */
const SEPOLIA_TESTNET_CONTRACTS = {
  LIQUIFIER: '0x55D942dC55b8b3bEE51C964c4985C46C7DF98Be0',
  ERC20: '0x2eE951c2d215ba1b3E0DF20764c96a0bC7809F41',
  // Use the same address as the dummy ERC20 contract.
  TG_TOKEN: '0x2eE951c2d215ba1b3E0DF20764c96a0bC7809F41',
  UNLOCKS: '0x32d70bC73d0965209Cf175711b010dE6A7650c2B',
} as const satisfies Record<string, HexString>;

const CHAINLINK: LsLiquifierProtocolDef = {
  type: 'liquifier',
  id: LsProtocolId.CHAINLINK,
  name: 'Chainlink',
  chainIconFileName: 'chainlink',
  token: LsToken.LINK,
  decimals: 18,
  erc20TokenAddress: IS_PRODUCTION_ENV
    ? '0x514910771AF9Ca656af840dff83E8264EcF986CA'
    : SEPOLIA_TESTNET_CONTRACTS.ERC20,
  liquifierContractAddress: IS_PRODUCTION_ENV
    ? '0x'
    : SEPOLIA_TESTNET_CONTRACTS.LIQUIFIER,
  tgTokenContractAddress: IS_PRODUCTION_ENV
    ? '0x'
    : SEPOLIA_TESTNET_CONTRACTS.TG_TOKEN,
  unlocksContractAddress: IS_PRODUCTION_ENV
    ? '0x'
    : SEPOLIA_TESTNET_CONTRACTS.UNLOCKS,
  timeUnit: CrossChainTimeUnit.DAY,
  unstakingPeriod: 7,
};

const THE_GRAPH: LsLiquifierProtocolDef = {
  type: 'liquifier',
  id: LsProtocolId.THE_GRAPH,
  name: 'The Graph',
  chainIconFileName: 'the-graph',
  token: LsToken.GRT,
  decimals: 18,
  erc20TokenAddress: IS_PRODUCTION_ENV
    ? '0xc944E90C64B2c07662A292be6244BDf05Cda44a7'
    : SEPOLIA_TESTNET_CONTRACTS.ERC20,
  liquifierContractAddress: IS_PRODUCTION_ENV
    ? '0x'
    : SEPOLIA_TESTNET_CONTRACTS.LIQUIFIER,
  tgTokenContractAddress: IS_PRODUCTION_ENV
    ? '0x'
    : SEPOLIA_TESTNET_CONTRACTS.TG_TOKEN,
  unlocksContractAddress: IS_PRODUCTION_ENV
    ? '0x'
    : SEPOLIA_TESTNET_CONTRACTS.UNLOCKS,
  timeUnit: CrossChainTimeUnit.DAY,
  unstakingPeriod: 28,
};

const LIVEPEER: LsLiquifierProtocolDef = {
  type: 'liquifier',
  id: LsProtocolId.LIVEPEER,
  name: 'Livepeer',
  chainIconFileName: 'livepeer',
  token: LsToken.LPT,
  decimals: 18,
  erc20TokenAddress: IS_PRODUCTION_ENV
    ? '0x58b6A8A3302369DAEc383334672404Ee733aB239'
    : SEPOLIA_TESTNET_CONTRACTS.ERC20,
  liquifierContractAddress: IS_PRODUCTION_ENV
    ? '0x'
    : SEPOLIA_TESTNET_CONTRACTS.LIQUIFIER,
  tgTokenContractAddress: IS_PRODUCTION_ENV
    ? '0x'
    : SEPOLIA_TESTNET_CONTRACTS.TG_TOKEN,
  unlocksContractAddress: IS_PRODUCTION_ENV
    ? '0x'
    : SEPOLIA_TESTNET_CONTRACTS.UNLOCKS,
  timeUnit: CrossChainTimeUnit.LIVEPEER_ROUND,
  unstakingPeriod: 7,
};

const POLYGON: LsLiquifierProtocolDef = {
  type: 'liquifier',
  id: LsProtocolId.POLYGON,
  name: 'Polygon',
  chainIconFileName: 'polygon',
  token: LsToken.POL,
  decimals: 18,
  erc20TokenAddress: IS_PRODUCTION_ENV
    ? '0x0D500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
    : SEPOLIA_TESTNET_CONTRACTS.ERC20,
  liquifierContractAddress: IS_PRODUCTION_ENV
    ? '0x'
    : SEPOLIA_TESTNET_CONTRACTS.LIQUIFIER,
  tgTokenContractAddress: IS_PRODUCTION_ENV
    ? '0x'
    : SEPOLIA_TESTNET_CONTRACTS.TG_TOKEN,
  unlocksContractAddress: IS_PRODUCTION_ENV
    ? '0x'
    : SEPOLIA_TESTNET_CONTRACTS.UNLOCKS,
  timeUnit: CrossChainTimeUnit.POLYGON_CHECKPOINT,
  unstakingPeriod: 82,
};

const POLKADOT: LsParachainChainDef = {
  type: 'parachain',
  id: LsProtocolId.POLKADOT,
  name: 'Polkadot',
  token: LsToken.DOT,
  chainIconFileName: 'polkadot',
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
  chainIconFileName: 'phala',
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
  chainIconFileName: 'moonbeam',
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
  chainIconFileName: 'astar',
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
  chainIconFileName: 'manta',
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
  chainIconFileName: 'tangle',
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

export const LS_LIQUIFIER_PROTOCOL_MAP: Record<
  LsLiquifierProtocolId,
  LsLiquifierProtocolDef
> = {
  [LsProtocolId.CHAINLINK]: CHAINLINK,
  [LsProtocolId.THE_GRAPH]: THE_GRAPH,
  [LsProtocolId.LIVEPEER]: LIVEPEER,
  [LsProtocolId.POLYGON]: POLYGON,
};

export const LS_PROTOCOLS: LsProtocolDef[] = [
  ...Object.values(LS_PARACHAIN_CHAIN_MAP),
  ...Object.values(LS_LIQUIFIER_PROTOCOL_MAP),
];

export const LS_LIQUIFIER_PROTOCOL_IDS = [
  LsProtocolId.CHAINLINK,
  LsProtocolId.THE_GRAPH,
  LsProtocolId.LIVEPEER,
  LsProtocolId.POLYGON,
] as const satisfies LsLiquifierProtocolId[];

export const LS_PARACHAIN_CHAIN_IDS = Object.values(LsProtocolId).filter(
  (value): value is LsParachainChainId =>
    typeof value !== 'string' &&
    !LS_LIQUIFIER_PROTOCOL_IDS.includes(value as LsLiquifierProtocolId),
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