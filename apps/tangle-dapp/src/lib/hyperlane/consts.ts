import {
  ChainMap,
  ChainMetadata,
  ExplorerFamily,
  TokenStandard,
  WarpCoreConfig,
} from '@hyperlane-xyz/sdk';
import { ProtocolType } from '@hyperlane-xyz/utils';

export const customChains: ChainMap<ChainMetadata> = {
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

// A list of Warp Route token configs
// These configs will be merged with the warp routes in the configured registry
// NOTE: the route configs was deployed with Hyperlane SDK. Link: https://docs.hyperlane.xyz/docs/guides/deploy-warp-route
// TODO: remove these routes (this is for testing Hyperlane only)
export const customWarpRouteConfigs: WarpCoreConfig = {
  tokens: [
    {
      addressOrDenom: '0xdFe0fbA0F8C62278DF4A9fDc787F9cFF28522FD3',
      chainName: 'holesky',
      collateralAddressOrDenom: '0x94373a4919B3240D86eA41593D5eBa789FEF3848',
      connections: [
        {
          token:
            'ethereum|tangletestnet|0x200DE548e393c38ee80482e9c5c186CBA7096ad4',
        },
      ],
      decimals: 18,
      name: 'Wrapped Ether',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'WETH',
    },
    {
      addressOrDenom: '0x200DE548e393c38ee80482e9c5c186CBA7096ad4',
      chainName: 'tangletestnet',
      connections: [
        {
          token: 'ethereum|holesky|0xdFe0fbA0F8C62278DF4A9fDc787F9cFF28522FD3',
        },
      ],
      decimals: 18,
      name: 'Wrapped Ether',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'WETH',
    },
  ],
};

// A list of warp route config IDs to be included in the app
// Warp Route IDs use format `SYMBOL/chainname1-chainname2...` where chains are ordered alphabetically
// If left null, all warp routes in the configured registry will be included
// If set to a list (including an empty list), only the specified routes will be included
export const warpRouteWhitelist: Array<string> | null = [
  'WETH/holesky-tangletestnet',
];

export const mailboxAddress = {
  holesky: '0x57529d3663bb44e8ab3335743dd42d2e1E3b46BA',
  tangletestnet: '0x0FDc2400B5a50637880dbEfB25d631c957620De8',
};
