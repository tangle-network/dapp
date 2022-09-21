// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import type { NewNotesTxResult, WebbApiProvider } from '../webb-provider.interface';

import { CancellationToken } from '@webb-dapp/api-providers/abstracts/cancelation-token';
import { EventBus } from '@webb-tools/app-util';

import { TransactionState, WebbWithdrawEvents } from '../mixer';

export abstract class VAnchorWithdraw<T extends WebbApiProvider<any>> extends EventBus<WebbWithdrawEvents> {
  state: TransactionState = TransactionState.Ideal;
  cancelToken: CancellationToken = new CancellationToken();

  constructor(protected inner: T) {
    super();
  }

  cancelWithdraw(): Promise<void> {
    this.cancelToken.cancel();
    this.emit('stateChange', TransactionState.Cancelling);

    return Promise.resolve(undefined);
  }

  abstract withdraw(notes: string[], recipient: string, amount: string): Promise<NewNotesTxResult>;
}
