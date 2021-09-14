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

const webWEBBRainkybeBeresheet = new BridgeCurrency([ChainId.Rinkeby, ChainId.EdgewareTestNet], WebbCurrencyId.WEBB);

export const bridgeConfig: BridgeConfig = {
  [webWEBBRainkybeBeresheet.name]: {
    asset: webWEBBRainkybeBeresheet,
    tokenAddresses: {
      [ChainId.EdgewareTestNet]: '0x7bfE3302472E1177661300dF063d721f76348D1D',
      [ChainId.Rinkeby]: '0xD6F1E78B5F1Ebf8fF5a60C9d52eabFa73E5c5220',
    },
    anchors: [
      {
        anchorAddresses: {
          [ChainId.EdgewareTestNet]: '0xc4f39Adfd41c3c858c71309A3C5484707B99138f',
          [ChainId.Rinkeby]: '0x5aCF1A99945AeC335309Ff0662504c8ebbf5c000',
        },
        amount: '.1',
      },
    ],
  },
};
