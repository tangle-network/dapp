// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { AnchorConfigEntry } from '../anchors/anchor-config.interface';

export interface BridgeConfigEntry {
  /**
   * The fungible currency id
   */
  asset: number;

  /**
   * Map of typed chain id to anchor identifier (address on evm and tree id on substrate)
   */
  anchors: AnchorConfigEntry;
}
