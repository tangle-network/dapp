// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import type { TXresultBase, WebbApiProvider } from '../webb-provider.interface';

import { EventBus } from '@webb-tools/app-util';
import { Note } from '@webb-tools/sdk-core';

import { InternalChainId } from '../../chains';
import { CancelToken, WebbWithdrawEvents, WithdrawState } from '../mixer';
import { Bridge } from './bridge';

export interface VAnchorWithdrawResult extends TXresultBase {
  outputNotes: Note[];
}
export abstract class VAnchorWithdraw<T extends WebbApiProvider<any>> extends EventBus<WebbWithdrawEvents> {
  state: WithdrawState = WithdrawState.Ideal;
  cancelToken: CancelToken = { cancelled: false };

  constructor(protected inner: T) {
    super();
  }

  get tokens() {
    return Bridge.getTokens(this.inner.config.currencies);
  }

  getTokensOfChain(chainId: InternalChainId) {
    return Bridge.getTokensOfChain(this.inner.config.currencies, chainId);
  }

  cancelWithdraw(): Promise<void> {
    this.cancelToken.cancelled = true;
    this.emit('stateChange', WithdrawState.Cancelling);

    return Promise.resolve(undefined);
  }

  abstract withdraw(notes: string[], recipient: string, amount: string): Promise<VAnchorWithdrawResult>;
}
