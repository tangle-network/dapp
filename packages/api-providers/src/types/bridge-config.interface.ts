// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { AnchorConfigEntry } from './anchor-config.interface';

export interface BridgeConfigEntry {
  asset: number;
  anchors: AnchorConfigEntry;
}
