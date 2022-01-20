import { WebbCurrencyId } from '@webb-dapp/apps/configs';
import { AnchorConfigEntry } from './anchor-config.interface';

export interface BridgeConfig {
  asset: WebbCurrencyId;
  anchors: AnchorConfigEntry[];
}
