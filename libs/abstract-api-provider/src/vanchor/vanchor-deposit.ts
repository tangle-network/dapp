// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { EventBus } from '@webb-tools/app-util';

import { CancellationToken } from '../cancelation-token';
import { DepositPayload } from '../mixer/mixer-deposit';
import { NewNotesTxResult, TransactionState } from '../transaction';
import { WebbApiProvider } from '../webb-provider.interface';
import { BridgeApi } from './bridge-api';
import { LoggerService } from '@webb-tools/browser-utils';
import { AbstractState } from '.';

/**
 * Anchor deposit abstract interface as fixed anchor share similar functionality as the mixer
 * The interface looks the same but there's a different function for note Generation
 **/
export abstract class VAnchorDeposit<
  T extends WebbApiProvider<any> = WebbApiProvider<any>,
  K extends DepositPayload = DepositPayload<any>
> extends AbstractState<T> {
  readonly logger = LoggerService.get('VAnchorDeposit');

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
  abstract deposit(depositPayload: K): PromiseLike<NewNotesTxResult>;

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
}
