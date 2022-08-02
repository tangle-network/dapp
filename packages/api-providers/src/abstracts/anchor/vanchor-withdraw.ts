// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import type { TXresultBase, WebbApiProvider } from '../webb-provider.interface';

import { EventBus } from '@webb-tools/app-util';
import { Note } from '@webb-tools/sdk-core';

import { CancelToken, TransactionState, WebbWithdrawEvents } from '../mixer';

export interface VAnchorWithdrawResult extends TXresultBase {
  outputNotes: Note[];
}
export abstract class VAnchorWithdraw<T extends WebbApiProvider<any>> extends EventBus<WebbWithdrawEvents> {
  state: TransactionState = TransactionState.Ideal;
  cancelToken: CancelToken = { cancelled: false };

  constructor(protected inner: T) {
    super();
  }

  cancelWithdraw(): Promise<void> {
    this.cancelToken.cancelled = true;
    this.emit('stateChange', TransactionState.Cancelling);

    return Promise.resolve(undefined);
  }

  abstract withdraw(notes: string[], recipient: string, amount: string): Promise<VAnchorWithdrawResult>;
}
