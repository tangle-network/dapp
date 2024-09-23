import ASTAR from '../../data/liquidStaking/adapters/astar';
import CHAINLINK from '../../data/liquidStaking/adapters/chainlink';
import LIVEPEER from '../../data/liquidStaking/adapters/livepeer';
import MANTA from '../../data/liquidStaking/adapters/manta';
import MOONBEAM from '../../data/liquidStaking/adapters/moonbeam';
import PHALA from '../../data/liquidStaking/adapters/phala';
import POLKADOT from '../../data/liquidStaking/adapters/polkadot';
import POLYGON from '../../data/liquidStaking/adapters/polygon';
import TANGLE_MAINNET from '../../data/liquidStaking/adapters/tangleMainnet';
import TANGLE_TESTNET from '../../data/liquidStaking/adapters/tangleTestnet';
import THE_GRAPH from '../../data/liquidStaking/adapters/theGraph';
import { IS_PRODUCTION_ENV } from '../env';
import {
  LsLiquifierProtocolDef,
  LsLiquifierProtocolId,
  LsNetwork,
  LsNetworkId,
  LsParachainChainDef,
  LsParachainChainId,
  LsParachainToken,
  LsProtocolDef,
  LsProtocolId,
  LsToken,
} from './types';

export const LS_REGISTRY_ADDRESS = IS_PRODUCTION_ENV
  ? '0x'
  : '0xCFF6785AC20878250b3FE70152905cEed38cf554';

// TODO: Find a way to avoid casting. Some type errors are being pesky.
export const LS_PARACHAIN_CHAIN_MAP: Record<
  LsParachainChainId,
  LsParachainChainDef
> = {
  [LsProtocolId.POLKADOT]: POLKADOT,
  [LsProtocolId.PHALA]: PHALA,
  [LsProtocolId.MOONBEAM]: MOONBEAM,
  [LsProtocolId.ASTAR]: ASTAR,
  [LsProtocolId.MANTA]: MANTA,
} as Record<LsParachainChainId, LsParachainChainDef>;

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
  TANGLE_MAINNET,
  TANGLE_TESTNET,
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
] as const satisfies LsParachainToken[];

export const TVS_TOOLTIP =
  "Total Value Staked (TVS) refers to the total value of assets that are currently staked for this network in fiat currency. Generally used as an indicator of a network's security and trustworthiness.";

export const LS_DERIVATIVE_TOKEN_PREFIX = 'tg';

export const LS_ETHEREUM_MAINNET_LIQUIFIER: LsNetwork = {
  id: LsNetworkId.ETHEREUM_MAINNET_LIQUIFIER,
  networkName: IS_PRODUCTION_ENV ? 'Ethereum Mainnet' : 'Sepolia Testnet',
  chainIconFileName: 'ethereum',
  defaultProtocolId: LsProtocolId.CHAINLINK,
  protocols: [CHAINLINK, THE_GRAPH, LIVEPEER, POLYGON],
};

export const LS_TANGLE_RESTAKING_PARACHAIN: LsNetwork = {
  id: LsNetworkId.TANGLE_RESTAKING_PARACHAIN,
  networkName: 'Tangle Parachain',
  chainIconFileName: 'tangle',
  defaultProtocolId: LsProtocolId.POLKADOT,
  // TODO: Find a way to avoid casting. Some type errors are being pesky.
  protocols: [POLKADOT, PHALA, MOONBEAM, ASTAR, MANTA] as LsProtocolDef[],
};

export const LS_TANGLE_MAINNET: LsNetwork = {
  id: LsNetworkId.TANGLE_MAINNET,
  networkName: 'Tangle Mainnet',
  chainIconFileName: 'tangle',
  defaultProtocolId: LsProtocolId.TANGLE_MAINNET,
  protocols: [TANGLE_MAINNET],
};

export const LS_TANGLE_TESTNET: LsNetwork = {
  id: LsNetworkId.TANGLE_MAINNET,
  networkName: 'Tangle Testnet',
  chainIconFileName: 'tangle',
  defaultProtocolId: LsProtocolId.TANGLE_MAINNET,
  protocols: [TANGLE_MAINNET],
};

export const LS_NETWORKS: LsNetwork[] = [
  LS_TANGLE_MAINNET,
  LS_TANGLE_TESTNET,
  LS_TANGLE_RESTAKING_PARACHAIN,
  LS_ETHEREUM_MAINNET_LIQUIFIER,
];

/**
 * Allows for batching multiple contract writes into a single transaction.
 *
 * Read more about the Multicall3 contract here: https://github.com/mds1/multicall
 */
export const MULTICALL3_CONTRACT_ADDRESS =
  '0xcA11bde05977b3631167028862bE2a173976CA11';
