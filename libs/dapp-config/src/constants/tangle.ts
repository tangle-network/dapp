import type { StakingQueryFlags } from '@polkadot/api-derive/staking/types';

import getPolkadotJsDashboardUrl from '../utils/getPolkadotJsDashboardUrl';

// MAINNET
export const TANGLE_MAINNET_WS_RPC_ENDPOINT = 'wss://rpc.tangle.tools';
export const TANGLE_MAINNET_HTTP_RPC_ENDPOINT = 'https://rpc.tangle.tools';
export const TANGLE_MAINNET_POLKADOT_JS_DASHBOARD_URL =
  getPolkadotJsDashboardUrl(TANGLE_MAINNET_WS_RPC_ENDPOINT);
export const TANGLE_MAINNET_NATIVE_EXPLORER_URL =
  'https://tangle.statescan.io/';
export const TANGLE_MAINNET_EVM_EXPLORER_URL = 'https://explorer.tangle.tools/';
export const TANGLE_MAINNET_NATIVE_TOKEN_SYMBOL = 'TNT';

// TESTNET
export const TANGLE_TESTNET_WS_RPC_ENDPOINT = 'wss://testnet-rpc.tangle.tools';
export const TANGLE_TESTNET_HTTP_RPC_ENDPOINT =
  'https://testnet-rpc.tangle.tools';
export const TANGLE_TESTNET_POLKADOT_JS_DASHBOARD_URL =
  getPolkadotJsDashboardUrl(TANGLE_TESTNET_WS_RPC_ENDPOINT);
export const TANGLE_TESTNET_NATIVE_EXPLORER_URL =
  'https://testnet-explorer.tangle.tools/';
export const TANGLE_TESTNET_EVM_EXPLORER_URL =
  'https://testnet-explorer.tangle.tools';
export const TANGLE_TESTNET_NATIVE_TOKEN_SYMBOL = 'tTNT';

// LOCAL
export const TANGLE_LOCAL_WS_RPC_ENDPOINT = 'ws://127.0.0.1:9944';
export const TANGLE_LOCAL_HTTP_RPC_ENDPOINT = 'http://127.0.0.1:9944';
export const TANGLE_LOCAL_POLKADOT_JS_DASHBOARD_URL = getPolkadotJsDashboardUrl(
  TANGLE_LOCAL_WS_RPC_ENDPOINT,
);

export const TANGLE_MAINNET_SS58_PREFIX = 5845;
export const TANGLE_TESTNET_SS58_PREFIX = 5845;
export const TANGLE_LOCAL_SS58_PREFIX = 42;

// Note that the chain decimal count is usually constant, and set when
// the blockchain is deployed. It could be technically changed due to
// governance decisions and subsequent runtime upgrades, but that would
// be exceptionally rare, so it is best to assume that it remains constant
// here. Regardless, it can easily be changed here in the future if need be.
export const TANGLE_TOKEN_DECIMALS = 18;

/**
 * Follow the Polkadot Apps UI's default flags for elected info.
 * @see https://github.com/polkadot-js/apps/blob/3d799b04bca0b2aa50b8ce54ab6a3436ae609890/packages/page-staking/src/useSortedTargets.ts#L41
 */
export const DEFAULT_FLAGS_ELECTED = {
  withClaimedRewardsEras: false,
  withController: true,
  withExposure: true,
  withExposureMeta: true,
  withPrefs: true,
} as const satisfies StakingQueryFlags;

/**
 * Follow the Polkadot Apps UI's default flags for waiting info.
 * @see https://github.com/polkadot-js/apps/blob/3d799b04bca0b2aa50b8ce54ab6a3436ae609890/packages/page-staking/src/useSortedTargets.ts#L42
 */
export const DEFAULT_FLAGS_WAITING = {
  withController: true,
  withPrefs: true,
} as const satisfies StakingQueryFlags;
