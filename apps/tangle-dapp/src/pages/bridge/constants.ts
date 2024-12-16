import {
  ChainMap,
  ChainMetadata,
  ExplorerFamily,
  WarpCoreConfig,
} from '@hyperlane-xyz/sdk';
import { ProtocolType } from '@hyperlane-xyz/utils';
import { PresetTypedChainId } from '@webb-tools/dapp-types';
import {
  EVMTokenBridgeEnum,
  EVMTokenEnum,
  EVMTokens,
  HyperlaneWarpRouteConfig,
} from '@webb-tools/evm-contract-metadata';

import {
  BridgeChainsConfigType,
  BridgeTokenType,
} from '@webb-tools/tangle-shared-ui/types';
import { Abi } from 'viem';

const asAbi = (abi: any): Abi => abi as Abi;

export const BRIDGE_TOKENS: Record<PresetTypedChainId, BridgeTokenType[]> = {
  [PresetTypedChainId.EthereumMainNet]: [
    {
      tokenSymbol: 'routerTNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: EVMTokens.ethereum.router.TNT.address,
      abi: asAbi(EVMTokens.ethereum.router.TNT.abi),
      decimals: EVMTokens.ethereum.router.TNT.decimals,
      chainId: PresetTypedChainId.EthereumMainNet,
    },
  ],
  [PresetTypedChainId.Polygon]: [
    {
      tokenSymbol: 'routerTNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: EVMTokens.polygon.router.TNT.address,
      abi: asAbi(EVMTokens.polygon.router.TNT.abi),
      decimals: EVMTokens.polygon.router.TNT.decimals,
      chainId: PresetTypedChainId.Polygon,
    },
  ],
  [PresetTypedChainId.Arbitrum]: [
    {
      tokenSymbol: 'routerTNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: EVMTokens.arbitrum.router.TNT.address,
      abi: asAbi(EVMTokens.arbitrum.router.TNT.abi),
      decimals: EVMTokens.arbitrum.router.TNT.decimals,
      chainId: PresetTypedChainId.Arbitrum,
    },
  ],
  [PresetTypedChainId.Optimism]: [
    {
      tokenSymbol: 'routerTNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: EVMTokens.optimism.router.TNT.address,
      abi: asAbi(EVMTokens.optimism.router.TNT.abi),
      decimals: EVMTokens.optimism.router.TNT.decimals,
      chainId: PresetTypedChainId.Optimism,
    },
  ],
  [PresetTypedChainId.Linea]: [
    {
      tokenSymbol: 'routerTNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: EVMTokens.linea.router.TNT.address,
      abi: asAbi(EVMTokens.linea.router.TNT.abi),
      decimals: EVMTokens.linea.router.TNT.decimals,
      chainId: PresetTypedChainId.Linea,
    },
  ],
  [PresetTypedChainId.Base]: [
    {
      tokenSymbol: 'routerTNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: EVMTokens.base.router.TNT.address,
      abi: asAbi(EVMTokens.base.router.TNT.abi),
      decimals: EVMTokens.base.router.TNT.decimals,
      chainId: PresetTypedChainId.Base,
    },
  ],
  [PresetTypedChainId.BSC]: [
    {
      tokenSymbol: 'routerTNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: EVMTokens.bsc.router.TNT.address,
      abi: asAbi(EVMTokens.bsc.router.TNT.abi),
      decimals: EVMTokens.bsc.router.TNT.decimals,
      chainId: PresetTypedChainId.BSC,
    },
  ],
  [PresetTypedChainId.Holesky]: [
    {
      tokenSymbol: 'WETH',
      tokenType: EVMTokenEnum.WETH,
      // This is a collateral token on Holesky but will be bridged using Hyperlane
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: EVMTokens.holesky.none.WETH.address,
      abi: asAbi(EVMTokens.holesky.none.WETH.abi),
      decimals: EVMTokens.holesky.none.WETH.decimals,
      chainId: PresetTypedChainId.Holesky,
      hyperlaneRouteContractAddress: EVMTokens.holesky.hyperlane.WETH.address,
    },
  ],
  [PresetTypedChainId.TangleTestnetEVM]: [
    {
      tokenSymbol: 'hypWETH',
      tokenType: EVMTokenEnum.WETH,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: EVMTokens.tangletestnet.hyperlane.WETH.address,
      abi: asAbi(EVMTokens.tangletestnet.hyperlane.WETH.abi),
      decimals: EVMTokens.tangletestnet.hyperlane.WETH.decimals,
      chainId: PresetTypedChainId.TangleTestnetEVM,
    },
  ],
};

export const BRIDGE_CHAINS: BridgeChainsConfigType = {
  [PresetTypedChainId.TangleMainnetEVM]: {
    [PresetTypedChainId.EthereumMainNet]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.EthereumMainNet],
    },
    [PresetTypedChainId.Polygon]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Polygon],
    },
    [PresetTypedChainId.Arbitrum]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Arbitrum],
    },
    [PresetTypedChainId.Optimism]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Optimism],
    },
    [PresetTypedChainId.Linea]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Linea],
    },
    [PresetTypedChainId.Base]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Base],
    },
    [PresetTypedChainId.BSC]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.BSC],
    },
  },
  [PresetTypedChainId.EthereumMainNet]: {
    [PresetTypedChainId.TangleMainnetEVM]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.EthereumMainNet],
    },
  },
  [PresetTypedChainId.Polygon]: {
    [PresetTypedChainId.TangleMainnetEVM]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Polygon],
    },
  },
  [PresetTypedChainId.Arbitrum]: {
    [PresetTypedChainId.TangleMainnetEVM]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Arbitrum],
    },
  },
  [PresetTypedChainId.Optimism]: {
    [PresetTypedChainId.TangleMainnetEVM]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Optimism],
    },
  },
  [PresetTypedChainId.Linea]: {
    [PresetTypedChainId.TangleMainnetEVM]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Linea],
    },
  },
  [PresetTypedChainId.Base]: {
    [PresetTypedChainId.TangleMainnetEVM]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Base],
    },
  },
  [PresetTypedChainId.BSC]: {
    [PresetTypedChainId.TangleMainnetEVM]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.BSC],
    },
  },
};

export const ROUTER_QUOTE_URL = `https://api-beta.pathfinder.routerprotocol.com/api/v2/quote`;

export const ROUTER_TRANSACTION_URL = `https://api-beta.pathfinder.routerprotocol.com/api/v2/transaction`;

export const ROUTER_NATIVE_TOKEN_ADDRESS =
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export const ROUTER_PARTNER_ID = 252;

export enum ROUTER_ERROR_CODE {
  LOW_AMOUNT_INPUT = 'AMOUNT-LOW-W-VALUE',
}

export const ROUTER_TX_EXPLORER_URL = 'https://explorer.routernitro.com/tx/';

export const HYPERLANE_REGISTRY_URL =
  process.env.NEXT_PUBLIC_HYPERLANE_REGISTRY_URL ||
  'https://github.com/hyperlane-xyz/hyperlane-registry';

export const HYPERLANE_CHAINS: ChainMap<ChainMetadata> = {
  holesky: {
    blockExplorers: [
      {
        apiUrl: 'https://api-holesky.etherscan.io/api',
        family: ExplorerFamily.Etherscan,
        name: 'Etherscan',
        url: 'https://holesky.etherscan.io',
      },
    ],
    blocks: {
      confirmations: 1,
      estimateBlockTime: 13,
      reorgPeriod: 2,
    },
    chainId: 17000,
    displayName: 'Holesky',
    domainId: 17000,
    isTestnet: true,
    name: 'holesky',
    nativeToken: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    protocol: ProtocolType.Ethereum,
    rpcUrls: [
      {
        http: 'https://ethereum-holesky-rpc.publicnode.com',
      },
    ],
  },
  tangletestnet: {
    blockExplorers: [
      {
        apiUrl: 'https://testnet-explorer.tangle.tools/api',
        family: ExplorerFamily.Blockscout,
        name: 'Tangle Testnet Explorer',
        url: 'https://testnet-explorer.tangle.tools',
      },
    ],
    blocks: {
      confirmations: 4,
      estimateBlockTime: 6,
      reorgPeriod: 4,
    },
    chainId: 3799,
    displayName: 'Tangle Testnet',
    domainId: 3799,
    isTestnet: true,
    name: 'tangletestnet',
    nativeToken: {
      decimals: 18,
      name: 'Tangle Testnet Token',
      symbol: 'tTNT',
    },
    protocol: ProtocolType.Ethereum,
    rpcUrls: [
      {
        http: 'https://testnet-rpc.tangle.tools',
      },
    ],
  },
};

export const HYPERLANE_WARP_ROUTE_CONFIGS: WarpCoreConfig =
  HyperlaneWarpRouteConfig;

export const HYPERLANE_WARP_ROUTE_WHITELIST: Array<string> | null = [
  'WETH/holesky-tangletestnet',
];
