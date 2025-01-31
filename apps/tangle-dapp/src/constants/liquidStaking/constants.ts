import { LsProtocolId } from '@webb-tools/tangle-shared-ui/types/liquidStaking';

import TANGLE_LOCAL from '../../data/liquidStaking/adapters/tangleLocal';
import TANGLE_MAINNET from '../../data/liquidStaking/adapters/tangleMainnet';
import TANGLE_TESTNET from '../../data/liquidStaking/adapters/tangleTestnet';
import { LsNetwork, LsNetworkId, LsProtocolDef } from './types';

export const LS_PROTOCOLS: LsProtocolDef[] = [
  TANGLE_MAINNET,
  TANGLE_TESTNET,
  TANGLE_LOCAL,
];

export const LS_DERIVATIVE_TOKEN_PREFIX = 'tg';

export const LS_TANGLE_MAINNET = {
  id: LsNetworkId.TANGLE_MAINNET,
  networkName: 'Tangle Mainnet',
  chainIconFileName: 'tangle',
  defaultProtocolId: LsProtocolId.TANGLE_MAINNET,
  protocols: [TANGLE_MAINNET],
} as const satisfies LsNetwork;

export const LS_TANGLE_TESTNET = {
  id: LsNetworkId.TANGLE_TESTNET,
  networkName: 'Tangle Testnet',
  chainIconFileName: 'tangle',
  defaultProtocolId: LsProtocolId.TANGLE_TESTNET,
  protocols: [TANGLE_TESTNET],
} as const satisfies LsNetwork;

export const LS_TANGLE_LOCAL = {
  id: LsNetworkId.TANGLE_LOCAL,
  networkName: 'Tangle Local Dev',
  chainIconFileName: 'tangle',
  defaultProtocolId: LsProtocolId.TANGLE_LOCAL,
  protocols: [TANGLE_LOCAL],
} as const satisfies LsNetwork;

export const LS_NETWORKS: LsNetwork[] = [
  LS_TANGLE_MAINNET,
  LS_TANGLE_TESTNET,
  LS_TANGLE_LOCAL,
];

/**
 * Allows for batching multiple contract writes into a single transaction.
 *
 * Read more about the Multicall3 contract here: https://github.com/mds1/multicall
 */
export const MULTICALL3_CONTRACT_ADDRESS =
  '0xcA11bde05977b3631167028862bE2a173976CA11';
