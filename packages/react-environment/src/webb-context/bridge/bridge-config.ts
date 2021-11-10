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

const webWEBBRinkebyHarmonyTestnet0 = new BridgeCurrency(
  [ChainId.Rinkeby, ChainId.HarmonyTestnet0],
  WebbCurrencyId.WEBB
);

const webbETHtest1 = new BridgeCurrency([ChainId.Ropsten, ChainId.Rinkeby, ChainId.Goerli], WebbCurrencyId.ETH);
const webbWEBBRinkebyGoerli = new BridgeCurrency([ChainId.Rinkeby, ChainId.Goerli], WebbCurrencyId.WEBB);

export const bridgeConfig: BridgeConfig = {
  [webbWEBBRinkebyGoerli.name]: {
    asset: webbWEBBRinkebyGoerli,
    tokenAddresses: {
      [ChainId.Goerli]: '0x72277b0eae5c965f735cde6c54d6d7ab177186e6',
      [ChainId.Rinkeby]: '0x65fd9f7e75Abaa40fD349948e52291Bb0108eE0B',
    },
    anchors: [
      {
        anchorAddresses: {
          [ChainId.Goerli]: '0xD24Eea4f4e17f7a708b2b156D3B90C921659BE80',
          [ChainId.Rinkeby]: '0x8431fDec940555becED3f4C04374c1D60b4ac07e',
        },
        amount: '0.1',
      },
    ],
  },
  [webbETHtest1.name]: {
    asset: webbETHtest1,
    tokenAddresses: {
      [ChainId.Ropsten]: '0x0000000000000000000000000000000000000000',
      [ChainId.Rinkeby]: '0x0000000000000000000000000000000000000000',
      [ChainId.Goerli]: '0x0000000000000000000000000000000000000000',
    },
    anchors: [
      {
        anchorAddresses: {
          [ChainId.Ropsten]: '0x03812879Bc2Cc702956671036463E6873f631786',
          [ChainId.Rinkeby]: '0x0ab17504465cB1b5235c6b4020A65faf070D5cDA',
          [ChainId.Goerli]: '0x0Aa49a86f526E44853A2704984d6A91C7289Fc93',
        },
        amount: '0.01',
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
