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
      addressOrDenom: '0x9DB8ebb2666E2e9f6864A82272199632eE45d182',
      chainName: 'holesky',
      collateralAddressOrDenom: '0x94373a4919B3240D86eA41593D5eBa789FEF3848',
      connections: [
        {
          token: 'ethereum|sepolia|0x0F4C1d951295Fe17c1514eB3020dFA6EedAd0137',
        },
      ],
      decimals: 18,
      name: 'Wrapped Ether',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'WETH',
    },
    {
      addressOrDenom: '0x0F4C1d951295Fe17c1514eB3020dFA6EedAd0137',
      chainName: 'sepolia',
      connections: [
        {
          token: 'ethereum|holesky|0x9DB8ebb2666E2e9f6864A82272199632eE45d182',
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
  'WETH/holesky-sepolia',
];
