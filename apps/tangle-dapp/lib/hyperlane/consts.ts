import {
  ChainMap,
  ChainMetadata,
  TokenStandard,
  WarpCoreConfig,
} from '@hyperlane-xyz/sdk';

export const customChains: ChainMap<ChainMetadata> = {};

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
