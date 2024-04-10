import {
  SUBQUERY_ENDPOINT,
  TANGLE_RPC_ENDPOINT,
  TANGLE_TESTNET_EVM_EXPLORER_URL,
  TANGLE_TESTNET_NATIVE_EXPLORER_URL,
} from '.';

export type NetworkNodeType = 'parachain' | 'standalone';

export enum NetworkId {
  TANGLE_MAINNET,
  TANGLE_TESTNET,
  TANGLE_LOCAL_DEV,
  CUSTOM,
}

export type Network = {
  id: NetworkId;
  chainId?: number;
  name: string;
  nodeType: NetworkNodeType;
  subqueryEndpoint?: string;
  polkadotExplorerUrl: string;
  evmExplorerUrl: string;
  avatar?: string;

  /**
   * The Web Socket RPC endpoint of the network.
   *
   * Usually used for Substrate-based connections.
   */
  wsRpcEndpoint: string;

  /**
   * The HTTP RPC endpoint of the network.
   *
   * Usually used for EVM-based actions, such as Viem wallet
   * client requests.
   */
  httpRpcEndpoint?: string;
};

const TANGLE_MAINNET_WS_RPC_ENDPOINT = 'wss://rpc.tangle.tools';

export const TANGLE_MAINNET_NETWORK: Network = {
  id: NetworkId.TANGLE_MAINNET,
  chainId: 5845,
  name: 'Tangle Mainnet',
  nodeType: 'standalone',
  wsRpcEndpoint: TANGLE_MAINNET_WS_RPC_ENDPOINT,
  httpRpcEndpoint: 'https://rpc.tangle.tools',
  polkadotExplorerUrl: `https://polkadot.js.org/apps/?rpc=${TANGLE_MAINNET_WS_RPC_ENDPOINT}#/explorer`,
  evmExplorerUrl: 'https://explorer.tangle.tools/',
};

export const TANGLE_TESTNET_NATIVE_NETWORK: Network = {
  id: NetworkId.TANGLE_TESTNET,
  chainId: 3799,
  name: 'Tangle Testnet Native',
  nodeType: 'standalone',
  subqueryEndpoint: SUBQUERY_ENDPOINT,
  httpRpcEndpoint: 'https://testnet-rpc.tangle.tools',
  wsRpcEndpoint: TANGLE_RPC_ENDPOINT,
  polkadotExplorerUrl: TANGLE_TESTNET_NATIVE_EXPLORER_URL,
  evmExplorerUrl: TANGLE_TESTNET_EVM_EXPLORER_URL,
};

/**
 * Mainly used for local development; defined for convenience.
 */
export const TANGLE_LOCAL_DEV_NETWORK: Network = {
  id: NetworkId.TANGLE_LOCAL_DEV,
  chainId: 3799,
  name: 'Local endpoint (127.0.0.1)',
  nodeType: 'standalone',
  subqueryEndpoint: 'http://localhost:4000/graphql',
  wsRpcEndpoint: 'ws://127.0.0.1:9944',
  httpRpcEndpoint: 'http://127.0.0.1:9944',
  polkadotExplorerUrl:
    'https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:9944#/explorer',
  // TODO: Use a generic EVM block explorer that supports passing in an RPC url. For now, this isn't a priority since this is the case only for the local development network, and this URL is only used for convenience.
  evmExplorerUrl: `https://polkadot.js.org/apps/?rpc=${TANGLE_MAINNET_WS_RPC_ENDPOINT}#/explorer`,
};

export const NETWORK_MAP: Partial<Record<NetworkId, Network>> = {
  [NetworkId.TANGLE_MAINNET]: TANGLE_MAINNET_NETWORK,
  [NetworkId.TANGLE_TESTNET]: TANGLE_TESTNET_NATIVE_NETWORK,
  [NetworkId.TANGLE_LOCAL_DEV]: TANGLE_LOCAL_DEV_NETWORK,
};
