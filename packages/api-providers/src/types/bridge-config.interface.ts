// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { CurrencyId } from '../enums';
import { AnchorConfigEntry } from './anchor-config.interface';

export interface BridgeConfig {
  asset: CurrencyId;
  anchors: AnchorConfigEntry[];
}
