// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { WebbCurrencyId } from '../enums';
import { AnchorConfigEntry } from './anchor-config.interface';

export interface BridgeConfig {
  asset: WebbCurrencyId;
  anchors: AnchorConfigEntry[];
}
