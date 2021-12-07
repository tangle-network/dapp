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

const webbETHtest1 = new BridgeCurrency(
  [ChainId.Ropsten, ChainId.Rinkeby, ChainId.Goerli, ChainId.Kovan, ChainId.OptimismTestnet, ChainId.ArbitrumTestnet],
  WebbCurrencyId.ETH
);

export const bridgeConfig: BridgeConfig = {
  [webbETHtest1.name]: {
    asset: webbETHtest1,
    tokenAddresses: {
      [ChainId.Ropsten]: '0x2C165572FeBE99C25644eF3433989D6e37F2a8bE',
      [ChainId.Rinkeby]: '0x80DF11835B03bE444fd6f6587bEa70175d12da39',
      [ChainId.Goerli]: '0x021C3Ad0971c10f39a36E783419A491FB2dE3f64',
      [ChainId.Kovan]: '0xdd1CcAb2fB769A0D07bb9795F309964a12A79F7D',
      [ChainId.OptimismTestnet]: '0x33Ae40e485fcb8fD196f22229ba094F2b1680Bb7',
      [ChainId.ArbitrumTestnet]: '0x95A5CcfCa50F7Dcf410CE397Bb7Becf1b42Ae601',
    },
    anchors: [
      {
        anchorAddresses: {
          [ChainId.Ropsten]: '0x8DB24d0Df8cc4CEbF275528f7725E560F50329bf',
          [ChainId.Rinkeby]: '0x99285189A0DA76dce5D3Da6Cf71aD3f2b498DC88',
          [ChainId.Goerli]: '0xC44A4EcAC4f23b6F92485Cb1c90dBEd75a987BC8',
          [ChainId.Kovan]: '0xd961d7Cf4d001EC57ff3F6F9F6428B73b7d924Bc',
          [ChainId.OptimismTestnet]: '0xd2e52699762D00f142e2c61280cd87D47B3A3b97',
          [ChainId.ArbitrumTestnet]: '0x626FEc5Ffa7Bf1EE8CEd7daBdE545630473E3ABb',
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
