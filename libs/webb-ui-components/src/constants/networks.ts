import { EVMChainId, SubstrateChainId } from '@webb-tools/dapp-types';
import {
  TANGLE_MAINNET_WS_RPC_ENDPOINT,
  TANGLE_MAINNET_HTTP_RPC_ENDPOINT,
  TANGLE_MAINNET_NATIVE_EXPLORER_URL,
  TANGLE_MAINNET_EVM_EXPLORER_URL,
  TANGLE_MAINNET_NATIVE_TOKEN_SYMBOL,
  TANGLE_TESTNET_WS_RPC_ENDPOINT,
  TANGLE_TESTNET_HTTP_RPC_ENDPOINT,
  TANGLE_TESTNET_NATIVE_EXPLORER_URL,
  TANGLE_TESTNET_EVM_EXPLORER_URL,
  TANGLE_TESTNET_NATIVE_TOKEN_SYMBOL,
  TANGLE_LOCAL_WS_RPC_ENDPOINT,
  TANGLE_LOCAL_HTTP_RPC_ENDPOINT,
  TANGLE_LOCAL_NATIVE_EXPLORER_URL,
  TANGLE_MAINET_SS58_PREFIX,
  TANGLE_TESTNET_SS58_PREFIX,
  TANGLE_LOCAL_SS58_PREFIX,
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
  evmChainId?: number;
  name: string;
  tokenSymbol: 'tTNT' | 'TNT';
  nodeType: NetworkNodeType;
  subqueryEndpoint?: string;
  polkadotExplorerUrl: string;
  evmExplorerUrl?: string;
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
  ss58Prefix?: number;
};

export const TANGLE_MAINNET_NETWORK: Network = {
  id: NetworkId.TANGLE_MAINNET,
  chainId: SubstrateChainId.TangleMainnetNative,
  evmChainId: EVMChainId.TangleMainnetEVM,
  name: 'Tangle Mainnet',
  tokenSymbol: TANGLE_MAINNET_NATIVE_TOKEN_SYMBOL,
  nodeType: 'standalone',
  wsRpcEndpoint: TANGLE_MAINNET_WS_RPC_ENDPOINT,
  httpRpcEndpoint: TANGLE_MAINNET_HTTP_RPC_ENDPOINT,
  polkadotExplorerUrl: TANGLE_MAINNET_NATIVE_EXPLORER_URL,
  evmExplorerUrl: TANGLE_MAINNET_EVM_EXPLORER_URL,
  ss58Prefix: TANGLE_MAINET_SS58_PREFIX,
};

export const TANGLE_TESTNET_NATIVE_NETWORK: Network = {
  id: NetworkId.TANGLE_TESTNET,
  chainId: SubstrateChainId.TangleTestnetNative,
  evmChainId: EVMChainId.TangleTestnetEVM,
  name: 'Tangle Testnet',
  tokenSymbol: TANGLE_TESTNET_NATIVE_TOKEN_SYMBOL,
  nodeType: 'standalone',
  subqueryEndpoint: SUBQUERY_ENDPOINT,
  httpRpcEndpoint: TANGLE_TESTNET_HTTP_RPC_ENDPOINT,
  wsRpcEndpoint: TANGLE_TESTNET_WS_RPC_ENDPOINT,
  polkadotExplorerUrl: TANGLE_TESTNET_NATIVE_EXPLORER_URL,
  evmExplorerUrl: TANGLE_TESTNET_EVM_EXPLORER_URL,
  ss58Prefix: TANGLE_TESTNET_SS58_PREFIX,
};

/**
 * Mainly used for local development; defined for convenience.
 */
export const TANGLE_LOCAL_DEV_NETWORK: Network = {
  id: NetworkId.TANGLE_LOCAL_DEV,
  chainId: SubstrateChainId.TangleTestnetNative,
  evmChainId: EVMChainId.TangleLocalEVM,
  name: 'Local endpoint',
  tokenSymbol: TANGLE_TESTNET_NATIVE_TOKEN_SYMBOL,
  nodeType: 'standalone',
  subqueryEndpoint: 'http://localhost:4000/graphql',
  wsRpcEndpoint: TANGLE_LOCAL_WS_RPC_ENDPOINT,
  httpRpcEndpoint: TANGLE_LOCAL_HTTP_RPC_ENDPOINT,
  polkadotExplorerUrl: TANGLE_LOCAL_NATIVE_EXPLORER_URL,
  ss58Prefix: TANGLE_LOCAL_SS58_PREFIX,
};

export const NETWORK_MAP: Partial<Record<NetworkId, Network>> = {
  [NetworkId.TANGLE_MAINNET]: TANGLE_MAINNET_NETWORK,
  [NetworkId.TANGLE_TESTNET]: TANGLE_TESTNET_NATIVE_NETWORK,
  [NetworkId.TANGLE_LOCAL_DEV]: TANGLE_LOCAL_DEV_NETWORK,
};
