import { ChainId, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { BridgeCurrency } from '@webb-dapp/react-environment/webb-context/bridge/bridge-currency';

export type BridgeAnchor = {
  anchorAddresses: Record<ChainId, string>;
  amount: string;
};
export type BridgeConfigEntry = {
  asset: BridgeCurrency;
  tokenAddresses: Record<ChainId, string>;
  anchors: BridgeAnchor[];
};
export type BridgeConfig = Record<string, BridgeConfigEntry>;
