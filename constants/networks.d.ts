import { EVMChainId, SubstrateChainId } from '../../../dapp-types/src/index.ts';
import { EvmAddress, SubstrateAddress } from '../types/address';
import { HexString } from '@polkadot/util/types';
export type NetworkNodeType = 'parachain' | 'standalone';
export declare enum NetworkId {
    TANGLE_MAINNET = 0,
    TANGLE_TESTNET = 1,
    TANGLE_LOCAL_DEV = 2,
    CUSTOM = 3,
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV = 4,
    TANGLE_RESTAKING_PARACHAIN_TESTNET = 5
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
    createExplorerAccountUrl: (address: SubstrateAddress | EvmAddress) => string | null;
    createExplorerTxUrl: (isEvm: boolean, txHash: HexString, blockHash?: HexString) => string | null;
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
export declare const TANGLE_MAINNET_NETWORK: {
    readonly id: NetworkId.TANGLE_MAINNET;
    readonly substrateChainId: SubstrateChainId.TangleMainnetNative;
    readonly evmChainId: EVMChainId.TangleMainnetEVM;
    readonly name: "Tangle Mainnet";
    readonly tokenSymbol: "TNT";
    readonly nodeType: "standalone";
    readonly wsRpcEndpoint: "wss://rpc.tangle.tools";
    readonly httpRpcEndpoint: "https://rpc.tangle.tools";
    readonly archiveRpcEndpoint: "wss://rpc.tangle.tools";
    readonly polkadotJsDashboardUrl: `https://polkadot.js.org/apps/?rpc=${string}#/explorer`;
    readonly explorerUrl: "https://tangle.statescan.io/";
    readonly evmExplorerUrl: "https://explorer.tangle.tools/";
    readonly ss58Prefix: 5845;
    readonly createExplorerAccountUrl: (address: SubstrateAddress | EvmAddress) => string;
    readonly createExplorerTxUrl: (isEvm: boolean, txHash: `0x${string}`, blockHash: `0x${string}` | undefined) => string | null;
};
export declare const TANGLE_TESTNET_NATIVE_NETWORK: {
    readonly id: NetworkId.TANGLE_TESTNET;
    readonly substrateChainId: SubstrateChainId.TangleTestnetNative;
    readonly evmChainId: EVMChainId.TangleTestnetEVM;
    readonly name: "Tangle Testnet";
    readonly tokenSymbol: "tTNT";
    readonly nodeType: "standalone";
    readonly subqueryEndpoint: "https://standalone-subql.tangle.tools/graphql";
    readonly httpRpcEndpoint: "https://testnet-rpc.tangle.tools";
    readonly wsRpcEndpoint: "wss://testnet-rpc.tangle.tools";
    readonly archiveRpcEndpoint: "wss://testnet-rpc-direct.tangle.tools";
    readonly polkadotJsDashboardUrl: `https://polkadot.js.org/apps/?rpc=${string}#/explorer`;
    readonly explorerUrl: "https://polkadot.js.org/apps/?rpc=wss://testnet-rpc.tangle.tools#/explorer";
    readonly evmExplorerUrl: "https://testnet-explorer.tangle.tools";
    readonly ss58Prefix: 5845;
    readonly evmTxRelayerEndpoint: "https://testnet-txrelayer.tangle.tools/";
    readonly createExplorerAccountUrl: (address: SubstrateAddress | EvmAddress) => string | null;
    readonly createExplorerTxUrl: (isEvm: boolean, txHash: `0x${string}`, blockHash: `0x${string}` | undefined) => string | null;
};
/**
 * Mainly used for local development; defined for convenience.
 */
export declare const TANGLE_LOCAL_DEV_NETWORK: {
    readonly id: NetworkId.TANGLE_LOCAL_DEV;
    readonly substrateChainId: SubstrateChainId.TangleLocalNative;
    readonly evmChainId: EVMChainId.TangleLocalEVM;
    readonly name: "Tangle Local Dev";
    readonly tokenSymbol: "tTNT";
    readonly nodeType: "standalone";
    readonly subqueryEndpoint: "http://localhost:4000/graphql";
    readonly wsRpcEndpoint: "ws://127.0.0.1:9944";
    readonly httpRpcEndpoint: "http://127.0.0.1:9944";
    readonly polkadotJsDashboardUrl: `https://polkadot.js.org/apps/?rpc=${string}#/explorer`;
    readonly ss58Prefix: 42;
    readonly evmTxRelayerEndpoint: "http://localhost:3000";
    readonly createExplorerAccountUrl: () => null;
    readonly createExplorerTxUrl: (isEvm: boolean, _txHash: `0x${string}`, blockHash: `0x${string}` | undefined) => string | null;
};
export declare const TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK: {
    readonly id: NetworkId.TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV;
    readonly name: "Tangle Restaking Parachain (Local)";
    readonly nodeType: "parachain";
    readonly tokenSymbol: "TNT";
    readonly wsRpcEndpoint: "ws://localhost:30337";
    readonly polkadotJsDashboardUrl: `https://polkadot.js.org/apps/?rpc=${string}#/explorer`;
    readonly createExplorerAccountUrl: () => null;
    readonly createExplorerTxUrl: () => null;
};
export declare const TANGLE_RESTAKING_PARACHAIN_TESTNET_NETWORK: {
    readonly id: NetworkId.TANGLE_RESTAKING_PARACHAIN_TESTNET;
    readonly name: "Tangle Restaking Parachain (Testnet)";
    readonly nodeType: "parachain";
    readonly tokenSymbol: "tTNT";
    readonly wsRpcEndpoint: "wss://testnet-parachain.tangle.tools";
    readonly polkadotJsDashboardUrl: `https://polkadot.js.org/apps/?rpc=${string}#/explorer`;
    readonly createExplorerAccountUrl: () => null;
    readonly createExplorerTxUrl: () => null;
};
export declare const NETWORK_MAP: Partial<Record<NetworkId, Network>>;
