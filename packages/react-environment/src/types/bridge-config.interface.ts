import { AnchorConfigEntry, WebbCurrencyId } from "@webb-dapp/apps/configs";

export interface BridgeConfig {
  asset: WebbCurrencyId;
  anchors: AnchorConfigEntry[];
}

export interface BridgeConfigByChain {
  
}
