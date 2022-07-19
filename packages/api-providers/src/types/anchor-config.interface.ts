// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { InternalChainId } from '../chains';

export type ChainAddressConfig = { [key in InternalChainId]?: string };

export type VAnchorConfigEntry = {
  type: 'variable';
  anchorAddresses: ChainAddressConfig;
  anchorTreeIds: ChainAddressConfig;
};

export type AnchorConfigEntry = VAnchorConfigEntry;
