// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { CancellationToken } from '@webb-dapp/api-providers/abstracts/cancelation-token';
import { EventBus } from '@webb-tools/app-util';
import { Note } from '@webb-tools/sdk-core';

import { TransactionState } from '../../abstracts/mixer/mixer-withdraw';
import { BridgeConfigEntry } from '../../types/bridge-config.interface';
import { DepositPayload } from '../mixer/mixer-deposit';
import { TXresultBase, WebbApiProvider } from '../webb-provider.interface';
import { BridgeApi } from './bridge-api';

// Todo: should we extract the interface of MixerDeposit on another class and rename `generateBridgeNote` to generate note

export type VAnchorDepositEvents = {
  // Generic Error by the provider
  error: string;
  // The instance State change event to track the current status of the instance
  stateChange: TransactionState;
  // the instance is ready
  ready: void;
  loading: boolean;
};

export interface VAnchorDepositResults extends TXresultBase {
  // Note with the right index in place
  updatedNote: Note;
}

/**
 * Anchor deposit abstract interface as fixed anchor share similar functionality as the mixer
 * The interface looks the same but there's a different function for note Generation
 **/
export abstract class VAnchorDeposit<
  T extends WebbApiProvider<any> = WebbApiProvider<any>,
  K extends DepositPayload = DepositPayload<any>
> extends EventBus<VAnchorDepositEvents> {
  state: TransactionState = TransactionState.Ideal;
  cancelToken: CancellationToken = new CancellationToken();

  constructor(protected inner: T) {
    super();
  }

  protected get bridgeApi() {
    return this.inner.methods.bridgeApi as BridgeApi<T>;
  }

  protected get config() {
    return this.inner.config;
  }

  /**
   * The deposit call it should receive the payload of type `K`
   * The implementation should
   * - Mutate the `loading` status of the instance
   * - Use the event bus to emit the status of the transaction
   **/
  // TODO: update the impls to return the TX hash instead of void
  abstract deposit(depositPayload: K): Promise<VAnchorDepositResults>;

  /** For the VAnchor, a bridge note represents a UTXO.
   ** @param anchorId - an address or tree id.
   ** @param destination - the chainIdType of the destination chain
   ** @param amount - the amount, formatted as user expects (i.e. ETH units instead of WEI)
   ** @param wrappableAssetAddress - identifier to determine if wrapping needs to occur in deposit flow.
   */
  abstract generateBridgeNote(
    anchorId: number | string,
    destination: number,
    amount: number,
    wrappableAssetAddress?: string
  ): Promise<K>;

  cancel(): Promise<void> {
    this.cancelToken.cancel();
    this.state = TransactionState.Cancelling;
    this.emit('stateChange', TransactionState.Cancelling);

    return Promise.resolve(undefined);
  }
}
