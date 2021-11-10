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

export const bridgeConfig: BridgeConfig = {
  [webWEBBRinkebyHarmonyTestnet0.name]: {
    asset: webWEBBRinkebyHarmonyTestnet0,
    tokenAddresses: {
      [ChainId.HarmonyTestnet0]: '0x000Ab7A156716fC0a7ce3D6Ce5A2A741Db5548Db',
      [ChainId.Rinkeby]: '0x2dda9D44078cc48FF6B91170C3C853104B026573',
    },
    anchors: [
      {
        anchorAddresses: {
          [ChainId.HarmonyTestnet0]: '0x829B0e33F9FC6EAadE34784cA3589F9d7035F93B',
          [ChainId.Rinkeby]: '0x585C837947Db546Aeb6FfEC1676Ef77B589aC06f',
        },
        amount: '.1',
      },
    ],
  },
  [webbETHtest1.name]: {
    asset: webbETHtest1,
    tokenAddresses: {
      [ChainId.Ropsten]: '0x64C60d48B58B6d55673c1A70729aD888c613042b',
      [ChainId.Rinkeby]: '0x5fC258fB4B755eDf06DA24569eB3B7159B83a3F1',
      [ChainId.Goerli]: '0x5FBEcf0F5E587d2DFe35124De218e50D98F8c965',
    },
    anchors: [
      {
        anchorAddresses: {
          [ChainId.Ropsten]: '0x254C1cCf426fB7F1dB38Ef37363cbCc5BeFBDF23',
          [ChainId.Rinkeby]: '0x630D75A08f12a6D196E9E095F5F1d744595334eD',
          [ChainId.Goerli]: '0xAa35c2064c716641E458bC4415519CF541f7E097',
        },
        amount: '.01',
      },
    ],
  },
};
