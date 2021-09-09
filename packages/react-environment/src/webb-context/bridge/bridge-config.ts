import { ChainId, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { BridgeCurrency } from '@webb-dapp/react-environment/webb-context/bridge/bridge-currency';

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

const webEthEthereumEdgware = new BridgeCurrency([ChainId.EthereumMainNet, ChainId.Edgeware], WebbCurrencyId.ETH);
const webEthEthereumEdgwareHarmony = new BridgeCurrency(
  [ChainId.EthereumMainNet, ChainId.HarmonyTest1, ChainId.Edgeware],
  WebbCurrencyId.ETH
);
const webbEdgEthereumEdgware = new BridgeCurrency([ChainId.EthereumMainNet, ChainId.Edgeware], WebbCurrencyId.EDG);
const webbOneEdgwareHarmony = new BridgeCurrency([ChainId.HarmonyTest1, ChainId.Edgeware], WebbCurrencyId.ETH);
const webbOneEthereumHarmony = new BridgeCurrency([ChainId.HarmonyTest1, ChainId.Edgeware], WebbCurrencyId.ONE);

export const bridgeConfig: BridgeConfig = {
  /// Eth Edgeware EthereumMainNet
  [webEthEthereumEdgware.name]: {
    asset: webEthEthereumEdgware,
    anchors: [
      {
        anchorAddresses: {
          [ChainId.EthereumMainNet]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
          [ChainId.Edgeware]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
        },
        amount: '1',
      },
    ],
    tokenAddresses: {
      [ChainId.EthereumMainNet]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
      [ChainId.Edgeware]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
    },
  },
  /// Eth Edgeware EthereumMainNet harmony
  [webEthEthereumEdgwareHarmony.name]: {
    asset: webEthEthereumEdgwareHarmony,
    anchors: [
      {
        anchorAddresses: {
          [ChainId.EthereumMainNet]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
          [ChainId.Edgeware]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
          [ChainId.HarmonyTest1]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
        },
        amount: '.1',
      },
      {
        anchorAddresses: {
          [ChainId.EthereumMainNet]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
          [ChainId.Edgeware]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
          [ChainId.HarmonyTest1]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
        },
        amount: '.5',
      },
      {
        anchorAddresses: {
          [ChainId.EthereumMainNet]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
          [ChainId.Edgeware]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
          [ChainId.HarmonyTest1]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
        },
        amount: '1',
      },
      {
        anchorAddresses: {
          [ChainId.EthereumMainNet]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
          [ChainId.Edgeware]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
          [ChainId.HarmonyTest1]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
        },
        amount: '10',
      },
    ],
    tokenAddresses: {
      [ChainId.EthereumMainNet]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
      [ChainId.Edgeware]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
      [ChainId.HarmonyTestnet1]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
    },
  },
  /// EDG Edgeware EthereumMainNet
  [webbEdgEthereumEdgware.name]: {
    asset: webbEdgEthereumEdgware,
    anchors: [
      {
        anchorAddresses: {
          [ChainId.EthereumMainNet]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
          [ChainId.Edgeware]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
        },
        amount: '10',
      },
      {
        anchorAddresses: {
          [ChainId.EthereumMainNet]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
          [ChainId.Edgeware]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
        },
        amount: '1000',
      },
      {
        anchorAddresses: {
          [ChainId.EthereumMainNet]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
          [ChainId.Edgeware]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
        },
        amount: '10000',
      },
      {
        anchorAddresses: {
          [ChainId.EthereumMainNet]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
          [ChainId.Edgeware]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
        },
        amount: '100000',
      },
    ],
    tokenAddresses: {
      [ChainId.EthereumMainNet]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
      [ChainId.Edgeware]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
    },
  }, /// One Edgeware Harmony
  [webbOneEdgwareHarmony.name]: {
    asset: webbOneEdgwareHarmony,
    anchors: [
      {
        anchorAddresses: {
          [ChainId.HarmonyTest1]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
          [ChainId.Edgeware]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
        },
        amount: '1',
      },
      {
        anchorAddresses: {
          [ChainId.HarmonyTest1]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
          [ChainId.Edgeware]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
        },
        amount: '10',
      },
      {
        anchorAddresses: {
          [ChainId.HarmonyTest1]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
          [ChainId.Edgeware]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
        },
        amount: '1000',
      },
      {
        anchorAddresses: {
          [ChainId.HarmonyTest1]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
          [ChainId.Edgeware]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
        },
        amount: '100000',
      },
    ],
    tokenAddresses: {
      [ChainId.HarmonyTest1]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
      [ChainId.Edgeware]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
    },
  }, /// One EthereumM Harmony
  [webbOneEthereumHarmony.name]: {
    asset: webbOneEthereumHarmony,
    anchors: [
      {
        anchorAddresses: {
          [ChainId.HarmonyTest1]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
          [ChainId.EthereumMainNet]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
        },
        amount: '1',
      },
      {
        anchorAddresses: {
          [ChainId.HarmonyTest1]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
          [ChainId.EthereumMainNet]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
        },
        amount: '10',
      },
      {
        anchorAddresses: {
          [ChainId.HarmonyTest1]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
          [ChainId.EthereumMainNet]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
        },
        amount: '1000',
      },
      {
        anchorAddresses: {
          [ChainId.HarmonyTest1]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
          [ChainId.EthereumMainNet]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
        },
        amount: '100000',
      },
    ],
    tokenAddresses: {
      [ChainId.HarmonyTest1]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
      [ChainId.EthereumMainNet]: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
    },
  },
};
