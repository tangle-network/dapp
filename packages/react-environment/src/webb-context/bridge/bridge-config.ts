import { ChainId, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { BridgeCurrency } from '@webb-dapp/react-environment/webb-context/bridge/bridge-currency';

// todo change to wrappedTokenAddresses (they are  governed token wrapper contract)
// todo change to Fixed anchors
// todo: Add change to Fixed variable anchors

type ChainRecordConfig<T = string> = { [key in ChainId]?: T };
export type BridgeAnchor = {
  /// Anchor contract addresses Map
  anchorAddresses: ChainRecordConfig;
  amount: string;
};
export type BridgeConfigEntry = {
  asset: BridgeCurrency;
  /// Token contract addresses map
  tokenAddresses: ChainRecordConfig;
  anchors: BridgeAnchor[];
};
export type BridgeConfig = Record<string, BridgeConfigEntry>;

const webbWETHtest2 = new BridgeCurrency(
  [
    ChainId.Ropsten,
    ChainId.Rinkeby,
    ChainId.Goerli,
    ChainId.PolygonTestnet,
    ChainId.OptimismTestnet,
    ChainId.ArbitrumTestnet,
  ],
  [WebbCurrencyId.ETH, WebbCurrencyId.WETH]
);

export const bridgeConfig: BridgeConfig = {
  [webbWETHtest2.name]: {
    asset: webbWETHtest2,
    tokenAddresses: {
      [ChainId.Ropsten]: '0x68667f0d3f1184e061bEbe51d15aFF54ca1C4615',
      [ChainId.Rinkeby]: '0x4afBE7bd0A0f7b10bB0fa0c5f3c6D0A376375e64',
      [ChainId.Goerli]: '0x9Bb56eb884BEAe73C64F15C02FE86aF767264949',
      [ChainId.PolygonTestnet]: '0xE91EB19dd96512D33b7a87A8B56b63AF6db103e4',
      [ChainId.OptimismTestnet]: '0x2C165572FeBE99C25644eF3433989D6e37F2a8bE',
      [ChainId.ArbitrumTestnet]: '0xB30d9F95e052E5b0b24a5f18833D51f5fCf42B3a',
    },
    anchors: [
      {
        anchorAddresses: {
          [ChainId.Ropsten]: '0x67113f749696ca459ccca451d7686561c5a69172',
          [ChainId.Rinkeby]: '0x60897804fc2c3ab55be07d2f77c7900eba218b5e',
          [ChainId.Goerli]: '0xe0d36e297f63991fa9ea39fba26a6d3f359aa70a',
          [ChainId.PolygonTestnet]: '0x6f82483876ab96dd948805db93da675e920362ed',
          [ChainId.OptimismTestnet]: '0x4446bccbde6d906e0cd65a55eb13913018ab1f58',
          [ChainId.ArbitrumTestnet]: '0xaabfe16c55062a9446d06c4f8ff7a64ff750fb27',
        },
        amount: '0.1',
      },
    ],
  },
};

export const getAnchorAddressForBridge = (assetName: string, chainId: number, amount: number): string | undefined => {
  const linkedAnchorConfig = bridgeConfig[assetName]?.anchors.find((anchor) => anchor.amount == amount.toString());
  if (!linkedAnchorConfig) {
    throw new Error('Unsupported configuration for bridge');
  }

  const anchorAddress = linkedAnchorConfig.anchorAddresses[chainId as ChainId];
  return anchorAddress;
};
