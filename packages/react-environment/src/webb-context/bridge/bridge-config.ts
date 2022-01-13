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

export const getNameFromBridgeCurrencyId = (id: string): string => {
  if (id === 'webb$ETH$WETH-4-5-7-13-14-15') return 'webbWETH';
  return 'unknown';
};

const webbWETHtest1 = new BridgeCurrency(
  [
    ChainId.Ropsten,
    ChainId.Rinkeby,
    ChainId.Goerli,
    ChainId.PolygonTestnet,
    ChainId.OptimismTestnet,
    ChainId.ArbitrumTestnet,
  ],
  [WebbCurrencyId.ETH, WebbCurrencyId.WETH],
  'webbWETH'
);

export const bridgeConfig: BridgeConfig = {
  [webbWETHtest1.name]: {
    asset: webbWETHtest1,
    tokenAddresses: {
      [ChainId.Ropsten]: '0x105779076d17FAe5EAADF010CA677475549F49E4',
      [ChainId.Rinkeby]: '0x4e7D4BEe028655F2865d9D147cF7B609c516d39C',
      [ChainId.Goerli]: '0x5257c558c246311552A824c491285667B3a445a2',
      [ChainId.PolygonTestnet]: '0x50A7b748F3C50F808a289cA041E48834A41A6d95',
      [ChainId.OptimismTestnet]: '0xEAF873F1F6c91fEf73d4839b5fC7954554BBE518',
      [ChainId.ArbitrumTestnet]: '0xD6F1E78B5F1Ebf8fF5a60C9d52eabFa73E5c5220',
    },
    anchors: [
      {
        anchorAddresses: {
          [ChainId.Ropsten]: '0x97747a4De7302Ff7Ee3334e33138879469BFEcf8',
          [ChainId.Rinkeby]: '0x09B722aA809A076027FA51902e431a8C03e3f8dF',
          [ChainId.Goerli]: '0x6aA5C74953F7Da1556a298C5e129E417410474E2',
          [ChainId.PolygonTestnet]: '0x12323BcABB342096669d80F968f7a31bdB29d4C4',
          [ChainId.OptimismTestnet]: '0xC44A4EcAC4f23b6F92485Cb1c90dBEd75a987BC8',
          [ChainId.ArbitrumTestnet]: '0xD8a8F9629a98EABFF31CfA9493f274A4D5e768Cd',
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
