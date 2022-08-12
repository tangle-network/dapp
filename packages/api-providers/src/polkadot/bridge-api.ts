// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { BridgeApi } from '../abstracts';
import { Currency } from '..';
import { WebbPolkadot } from './webb-provider';

export class PolkadotBridgeApi extends BridgeApi<WebbPolkadot> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetchWrappableAssets(typedChainId: number): Promise<Currency[]> {
    // All Substrate assets are assumed to be wrappable
    return Object.values(this.inner.state.getCurrencies()).filter((currency) => {
      currency.hasChain(typedChainId);
    });
  }
}
