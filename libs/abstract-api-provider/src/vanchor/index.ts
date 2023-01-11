// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { EventBus } from '@webb-tools/app-util';
import { CancellationToken } from '../cancelation-token';
import { ActionEvent, TransactionState, NewNotesTxResult } from '../transaction';
import { WebbApiProvider } from '../webb-provider.interface';
import { VanchorTransferPayload } from './vanchor-transfer';

export * from './bridge-api';
export * from './vanchor-actions';
export * from './vanchor-deposit';
export * from './vanchor-withdraw';
export * from './vanchor-transfer';

export abstract class AbstractState<
  T extends WebbApiProvider<any>
> extends EventBus<ActionEvent> {
  state: TransactionState = TransactionState.Ideal;
  cancelToken: CancellationToken = new CancellationToken();

  constructor(protected inner: T) {
    super();
  }

  cancel(): Promise<void> {
    this.cancelToken.cancel();
    this.state = TransactionState.Cancelling;
    this.emit('stateChange', TransactionState.Cancelling);

    return Promise.resolve(undefined);
  }

  change(state: TransactionState): void {
    this.state = state;
    this.emit('stateChange', state);
  }
}
