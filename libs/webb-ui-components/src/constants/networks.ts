import { EVMChainId, SubstrateChainId } from '@webb-tools/dapp-types';
import {
  TANGLE_MAINNET_WS_RPC_ENDPOINT,
  TANGLE_MAINNET_HTTP_RPC_ENDPOINT,
  TANGLE_MAINNET_POLKADOT_JS_DASHBOARD_URL,
  TANGLE_MAINNET_NATIVE_EXPLORER_URL,
  TANGLE_MAINNET_EVM_EXPLORER_URL,
  TANGLE_MAINNET_NATIVE_TOKEN_SYMBOL,
  TANGLE_TESTNET_WS_RPC_ENDPOINT,
  TANGLE_TESTNET_HTTP_RPC_ENDPOINT,
  TANGLE_TESTNET_POLKADOT_JS_DASHBOARD_URL,
  TANGLE_TESTNET_NATIVE_EXPLORER_URL,
  TANGLE_TESTNET_EVM_EXPLORER_URL,
  TANGLE_TESTNET_NATIVE_TOKEN_SYMBOL,
  TANGLE_LOCAL_WS_RPC_ENDPOINT,
  TANGLE_LOCAL_HTTP_RPC_ENDPOINT,
  TANGLE_LOCAL_POLKADOT_JS_DASHBOARD_URL,
  TANGLE_SS58_PREFIX,
  TANGLE_TESTNET_ARCHIVE_RPC_ENDPOINT,
} from '@webb-tools/dapp-config/constants/tangle';

import { SUBQUERY_ENDPOINT } from './index';
import getPolkadotJsDashboardUrl from '@webb-tools/dapp-config/utils/getPolkadotJsDashboardUrl';
import { EvmAddress, SubstrateAddress } from '../types/address';
import { HexString } from '@polkadot/util/types';
import { isEvmAddress } from '../utils';

export type NetworkNodeType = 'parachain' | 'standalone';

export enum NetworkId {
  TANGLE_MAINNET,
  TANGLE_TESTNET,
  TANGLE_LOCAL_DEV,
  CUSTOM,
  TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV,
  TANGLE_RESTAKING_PARACHAIN_TESTNET,
}

export type Network = {
  id: NetworkId;
  substrateChainId?: number;
  evmChainId?: number;
  name: string;
  tokenSymbol: 'tTNT' | 'TNT';
  nodeType: NetworkNodeType;
  subqueryEndpoint?: string;
  polkadotJsDashboardUrl: string;
  explorerUrl?: string;
  evmExplorerUrl?: string;
  avatar?: string;
  evmTxRelayerEndpoint?: string;
  ss58Prefix?: number;

  createExplorerAccountUrl: (
    address: SubstrateAddress | EvmAddress,
  ) => string | null;

  createExplorerTxUrl: (
    isEvm: boolean,
    txHash: HexString,
    blockHash?: HexString,
  ) => string | null;

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

  /**
   * The endpoint for the archive node of the network.
   *
   * Usually used for fetching historical data.
   */
  archiveRpcEndpoint?: string;
};

export const TANGLE_MAINNET_NETWORK = {
  id: NetworkId.TANGLE_MAINNET,
  substrateChainId: SubstrateChainId.TangleMainnetNative,
  evmChainId: EVMChainId.TangleMainnetEVM,
  name: 'Tangle Mainnet',
  tokenSymbol: TANGLE_MAINNET_NATIVE_TOKEN_SYMBOL,
  nodeType: 'standalone',
  wsRpcEndpoint: TANGLE_MAINNET_WS_RPC_ENDPOINT,
  httpRpcEndpoint: TANGLE_MAINNET_HTTP_RPC_ENDPOINT,
  archiveRpcEndpoint: TANGLE_MAINNET_WS_RPC_ENDPOINT,
  polkadotJsDashboardUrl: TANGLE_MAINNET_POLKADOT_JS_DASHBOARD_URL,
  explorerUrl: TANGLE_MAINNET_NATIVE_EXPLORER_URL,
  evmExplorerUrl: TANGLE_MAINNET_EVM_EXPLORER_URL,
  ss58Prefix: TANGLE_SS58_PREFIX,

  createExplorerAccountUrl: (address) => {
    return isEvmAddress(address)
      ? `${TANGLE_MAINNET_EVM_EXPLORER_URL}/address/${address}`
      : `${TANGLE_MAINNET_NATIVE_EXPLORER_URL}/#/accounts/${address}`;
  },

  createExplorerTxUrl: (isEvm, txHash, blockHash) => {
    if (isEvm) {
      return `${TANGLE_MAINNET_EVM_EXPLORER_URL}/tx/${txHash}`;
    }

    return blockHash === undefined
      ? null
      : `${TANGLE_MAINNET_NATIVE_EXPLORER_URL}/#/blocks/${blockHash}`;
  },
} as const satisfies Network;

export const TANGLE_TESTNET_NATIVE_NETWORK = {
  id: NetworkId.TANGLE_TESTNET,
  substrateChainId: SubstrateChainId.TangleTestnetNative,
  evmChainId: EVMChainId.TangleTestnetEVM,
  name: 'Tangle Testnet',
  tokenSymbol: TANGLE_TESTNET_NATIVE_TOKEN_SYMBOL,
  nodeType: 'standalone',
  subqueryEndpoint: SUBQUERY_ENDPOINT,
  httpRpcEndpoint: TANGLE_TESTNET_HTTP_RPC_ENDPOINT,
  wsRpcEndpoint: TANGLE_TESTNET_WS_RPC_ENDPOINT,
  archiveRpcEndpoint: TANGLE_TESTNET_ARCHIVE_RPC_ENDPOINT,
  polkadotJsDashboardUrl: TANGLE_TESTNET_POLKADOT_JS_DASHBOARD_URL,
  explorerUrl: TANGLE_TESTNET_NATIVE_EXPLORER_URL,
  evmExplorerUrl: TANGLE_TESTNET_EVM_EXPLORER_URL,
  ss58Prefix: TANGLE_SS58_PREFIX,
  evmTxRelayerEndpoint: 'https://testnet-txrelayer.tangle.tools/',

  createExplorerAccountUrl: (address) => {
    return isEvmAddress(address)
      ? `${TANGLE_TESTNET_EVM_EXPLORER_URL}/address/${address}`
      : null;
  },

  createExplorerTxUrl: (isEvm, txHash, blockHash) => {
    if (isEvm) {
      return `${TANGLE_TESTNET_EVM_EXPLORER_URL}/tx/${txHash}`;
    }

    return blockHash === undefined
      ? null
      : `${TANGLE_TESTNET_NATIVE_EXPLORER_URL}/#/explorer/query/${blockHash}`;
  },
} as const satisfies Network;

/**
 * Mainly used for local development; defined for convenience.
 */
export const TANGLE_LOCAL_DEV_NETWORK = {
  id: NetworkId.TANGLE_LOCAL_DEV,
  substrateChainId: SubstrateChainId.TangleLocalNative,
  evmChainId: EVMChainId.TangleLocalEVM,
  name: 'Tangle Local Dev',
  tokenSymbol: TANGLE_TESTNET_NATIVE_TOKEN_SYMBOL,
  nodeType: 'standalone',
  subqueryEndpoint: 'http://localhost:4000/graphql',
  wsRpcEndpoint: TANGLE_LOCAL_WS_RPC_ENDPOINT,
  httpRpcEndpoint: TANGLE_LOCAL_HTTP_RPC_ENDPOINT,
  polkadotJsDashboardUrl: TANGLE_LOCAL_POLKADOT_JS_DASHBOARD_URL,
  ss58Prefix: 42,
  evmTxRelayerEndpoint: 'http://localhost:3000',
  createExplorerAccountUrl: () => null,

  createExplorerTxUrl: (isEvm, _txHash, blockHash) => {
    if (isEvm) {
      return null;
    }

    return blockHash === undefined
      ? null
      : `${TANGLE_LOCAL_POLKADOT_JS_DASHBOARD_URL}/query/${blockHash}`;
  },
} as const satisfies Network;

export const TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK = {
  id: NetworkId.TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV,
  name: 'Tangle Restaking Parachain (Local)',
  nodeType: 'parachain',
  tokenSymbol: 'TNT',
  wsRpcEndpoint: 'ws://localhost:30337',
  polkadotJsDashboardUrl: getPolkadotJsDashboardUrl('ws://localhost:30337'),
  createExplorerAccountUrl: () => null,
  createExplorerTxUrl: () => null,
} as const satisfies Network;

export const TANGLE_RESTAKING_PARACHAIN_TESTNET_NETWORK = {
  id: NetworkId.TANGLE_RESTAKING_PARACHAIN_TESTNET,
  name: 'Tangle Restaking Parachain (Testnet)',
  nodeType: 'parachain',
  tokenSymbol: 'tTNT',
  wsRpcEndpoint: 'wss://testnet-parachain.tangle.tools',
  polkadotJsDashboardUrl: getPolkadotJsDashboardUrl(
    'wss://testnet-parachain.tangle.tools',
  ),
  createExplorerAccountUrl: () => null,
  createExplorerTxUrl: () => null,
} as const satisfies Network;

export const NETWORK_MAP: Partial<Record<NetworkId, Network>> = {
  [NetworkId.TANGLE_MAINNET]: TANGLE_MAINNET_NETWORK,
  [NetworkId.TANGLE_TESTNET]: TANGLE_TESTNET_NATIVE_NETWORK,
  [NetworkId.TANGLE_LOCAL_DEV]: TANGLE_LOCAL_DEV_NETWORK,
  [NetworkId.TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV]:
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK,
  [NetworkId.TANGLE_RESTAKING_PARACHAIN_TESTNET]:
    TANGLE_RESTAKING_PARACHAIN_TESTNET_NETWORK,
};
