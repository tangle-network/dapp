import { SubstrateChainId } from '@webb-tools/dapp-types';
import {
  TANGLE_MAINNET_WS_RPC_ENDPOINT,
  TANGLE_MAINNET_HTTP_RPC_ENDPOINT,
  TANGLE_MAINNET_NATIVE_EXPLORER_URL,
  TANGLE_MAINNET_EVM_EXPLORER_URL,
  TANGLE_TESTNET_WS_RPC_ENDPOINT,
  TANGLE_TESTNET_HTTP_RPC_ENDPOINT,
  TANGLE_TESTNET_NATIVE_EXPLORER_URL,
  TANGLE_TESTNET_EVM_EXPLORER_URL,
  TANGLE_LOCAL_WS_RPC_ENDPOINT,
  TANGLE_LOCAL_HTTP_RPC_ENDPOINT,
  TANGLE_LOCAL_NATIVE_EXPLORER_URL,
} from '@webb-tools/dapp-config/constants/tangle';

import { SUBQUERY_ENDPOINT } from '.';

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

export const TANGLE_MAINNET_NETWORK: Network = {
  id: NetworkId.TANGLE_MAINNET,
  chainId: SubstrateChainId.TangleMainnetNative,
  name: 'Tangle Mainnet',
  nodeType: 'standalone',
  wsRpcEndpoint: TANGLE_MAINNET_WS_RPC_ENDPOINT,
  httpRpcEndpoint: TANGLE_MAINNET_HTTP_RPC_ENDPOINT,
  polkadotExplorerUrl: TANGLE_MAINNET_NATIVE_EXPLORER_URL,
  evmExplorerUrl: TANGLE_MAINNET_EVM_EXPLORER_URL,
};

export const TANGLE_TESTNET_NATIVE_NETWORK: Network = {
  id: NetworkId.TANGLE_TESTNET,
  chainId: SubstrateChainId.TangleTestnetNative,
  name: 'Tangle Testnet',
  nodeType: 'standalone',
  subqueryEndpoint: SUBQUERY_ENDPOINT,
  httpRpcEndpoint: TANGLE_TESTNET_HTTP_RPC_ENDPOINT,
  wsRpcEndpoint: TANGLE_TESTNET_WS_RPC_ENDPOINT,
  polkadotExplorerUrl: TANGLE_TESTNET_NATIVE_EXPLORER_URL,
  evmExplorerUrl: TANGLE_TESTNET_EVM_EXPLORER_URL,
};

/**
 * Mainly used for local development; defined for convenience.
 */
export const TANGLE_LOCAL_DEV_NETWORK: Network = {
  id: NetworkId.TANGLE_LOCAL_DEV,
  chainId: SubstrateChainId.TangleTestnetNative,
  name: 'Local endpoint',
  nodeType: 'standalone',
  subqueryEndpoint: 'http://localhost:4000/graphql',
  wsRpcEndpoint: TANGLE_LOCAL_WS_RPC_ENDPOINT,
  httpRpcEndpoint: TANGLE_LOCAL_HTTP_RPC_ENDPOINT,
  polkadotExplorerUrl: TANGLE_LOCAL_NATIVE_EXPLORER_URL,
  // TODO: Use a generic EVM block explorer that supports passing in an RPC url. For now, this isn't a priority since this is the case only for the local development network, and this URL is only used for convenience.
  evmExplorerUrl: TANGLE_LOCAL_NATIVE_EXPLORER_URL,
};

export const NETWORK_MAP: Partial<Record<NetworkId, Network>> = {
  [NetworkId.TANGLE_MAINNET]: TANGLE_MAINNET_NETWORK,
  [NetworkId.TANGLE_TESTNET]: TANGLE_TESTNET_NATIVE_NETWORK,
  [NetworkId.TANGLE_LOCAL_DEV]: TANGLE_LOCAL_DEV_NETWORK,
};
