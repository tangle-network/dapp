// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { MixerWithdraw } from '../mixer';
import { WebbApiProvider } from '../webb-provider.interface';
import { Bridge } from './bridge';

export abstract class AnchorWithdraw<T extends WebbApiProvider<any>> extends MixerWithdraw<T> {
  get tokens() {
    return Bridge.getTokens(this.inner.config.currencies);
  }

  getTokensOfChain(chainId: number) {
    return Bridge.getTokensOfChain(this.inner.config.currencies, chainId);
  }
}
