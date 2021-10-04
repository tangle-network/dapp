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

const webWEBBRinkebyBeresheet = new BridgeCurrency([ChainId.Rinkeby, ChainId.HarmonyTestnet0], WebbCurrencyId.WEBB);

export const bridgeConfig: BridgeConfig = {
  [webWEBBRinkebyBeresheet.name]: {
    asset: webWEBBRinkebyBeresheet,
    tokenAddresses: {
      [ChainId.HarmonyTestnet0]: '0x9d609F54536Cef34f5F612BD976ca632F1fa208E',
      [ChainId.Rinkeby]: '0x7Cec2Bf7D9c4C3C96Da8a0BfeBAB1E84b8212394',
    },
    anchors: [
      {
        anchorAddresses: {
          [ChainId.HarmonyTestnet0]: '0x64E9727C4a835D518C34d3A50A8157120CAeb32F',
          [ChainId.Rinkeby]: '0xB42139fFcEF02dC85db12aC9416a19A12381167D',
        },
        amount: '.1',
      },
    ],
  },
};
