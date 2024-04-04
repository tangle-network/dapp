import {
  SUBQUERY_ENDPOINT,
  TANGLE_RPC_ENDPOINT,
  TANGLE_TESTNET_EVM_EXPLORER_URL,
  TANGLE_TESTNET_NATIVE_EXPLORER_URL,
} from '.';

/**
 * The network type (use to categorize the network)
 */
export type NetworkType = 'mainnet' | 'testnet' | 'dev';

export type NetworkNodeType = 'parachain' | 'standalone';

export enum NetworkId {
  TANGLE_MAINNET,
  TANGLE_TESTNET,
  TANGLE_LOCAL_DEV,
}

export type Network = {
  id: NetworkId;
  name: string;
  type: NetworkType;
  nodeType: NetworkNodeType;
  subqueryEndpoint?: string;
  polkadotEndpoint: string;
  polkadotExplorer: string;
  evmExplorer?: string;
  avatar?: string;
};

/**
 * Easy toggle to show/hide the mainnet network option
 * on the network selector.
 */
export const HAS_TANGLE_MAINNET_LAUNCHED = false;

const TANGLE_MAINNET_RPC_ENDPOINT = 'wss://internal-testing.tangle.tools';

export const TANGLE_MAINNET_NETWORK: Network = {
  id: NetworkId.TANGLE_MAINNET,
  name: 'Tangle Mainnet',
  type: 'mainnet',
  nodeType: 'standalone',
  polkadotEndpoint: TANGLE_MAINNET_RPC_ENDPOINT,
  polkadotExplorer: `https://polkadot.js.org/apps/?rpc=${TANGLE_MAINNET_RPC_ENDPOINT}#/explorer`,
};

export const TANGLE_TESTNET_NATIVE_NETWORK: Network = {
  id: NetworkId.TANGLE_TESTNET,
  name: 'Tangle Testnet Native',
  type: 'testnet',
  nodeType: 'standalone',
  subqueryEndpoint: SUBQUERY_ENDPOINT,
  polkadotEndpoint: TANGLE_RPC_ENDPOINT,
  polkadotExplorer: TANGLE_TESTNET_NATIVE_EXPLORER_URL,
  evmExplorer: TANGLE_TESTNET_EVM_EXPLORER_URL,
};

/**
 * Mainly used for local development; defined for convenience.
 */
export const TANGLE_LOCAL_DEV_NETWORK: Network = {
  id: NetworkId.TANGLE_LOCAL_DEV,
  name: 'Local endpoint (127.0.0.1)',
  type: 'dev',
  nodeType: 'standalone',
  subqueryEndpoint: 'http://localhost:4000/graphql',
  polkadotEndpoint: 'ws://127.0.0.1:9944',
  polkadotExplorer:
    'https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:9944#/explorer',
};
