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

const webWEBBRinkebyHarmonyTestnet0 = new BridgeCurrency(
  [ChainId.Rinkeby, ChainId.HarmonyTestnet0],
  WebbCurrencyId.WEBB
);
const webbETHtest1 = new BridgeCurrency([ChainId.Ropsten, ChainId.Rinkeby, ChainId.Goerli], WebbCurrencyId.ETH);

export const bridgeConfig: BridgeConfig = {
  [webWEBBRinkebyHarmonyTestnet0.name]: {
    asset: webWEBBRinkebyHarmonyTestnet0,
    tokenAddresses: {
      [ChainId.HarmonyTestnet0]: '0x9d609F54536Cef34f5F612BD976ca632F1fa208E',
      [ChainId.Rinkeby]: '0x7Cec2Bf7D9c4C3C96Da8a0BfeBAB1E84b8212394',
    },
    anchors: [
      {
        anchorAddresses: {
          [ChainId.HarmonyTestnet0]: '0x30a9E294b1Fc166194d2D1AF936CDdfF0e86A47B',
          [ChainId.Rinkeby]: '0x6244Cf3D15aE8D9F973f080Af561b99c501e5e9D',
        },
        amount: '.1',
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
          [ChainId.Ropsten]: '0x0711Ea63FDEDD2c8a9d3C9340a5A8F6cd84b6A92',
          [ChainId.Rinkeby]: '0x15A66977f0A9D21e09eB6C1B42b001aF992f0C8f',
          [ChainId.Goerli]: '0x025348e15e9d5529E5A4A55E8eA7eC923b7fB8b6',
        },
        amount: '.01',
      },
    ],
  },
};

console.log({ bridgeConfig });
