// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { BridgeConfig } from '../..';
import { MixerSize } from '../../abstracts';
import { DepositPayload, MixerDeposit } from '../mixer/mixer-deposit';
import { WebbApiProvider } from '../webb-provider.interface';
import { AnchorApi } from './anchor-api';

// Todo: should we extract the interface of MixerDeposit on another class and rename `generateBridgeNote` to generate note
export type VAnchorSize = Omit<MixerSize, 'amount'>;
/**
 * Anchor deposit abstract interface as fixed anchor share similar functionality as the mixer
 * The interface looks the same but there's a different function for note Generation
 **/
export abstract class VAnchorDeposit<
  T extends WebbApiProvider<any>,
  K extends DepositPayload = DepositPayload<any>
> extends MixerDeposit<T, K> {
  protected get bridgeApi() {
    return this.inner.methods.anchorApi as AnchorApi<T, BridgeConfig>;
  }

  protected get config() {
    return this.inner.config;
  }

  generateNote(anchorId: number | string): Promise<K> {
    throw new Error('api not ready:Not mixer api for ' + anchorId);
  }

  /** For the VAnchor, a bridge note represents a UTXO.
   ** @param anchorId - an address or tree id.
   ** @param destination - the chainIdType of the destination chain
   ** @param amount - the amount to be controlled by the generated UTXO
   ** @param wrappableAssetAddress - identifier to determine if wrapping needs to occur in deposit flow.
   */
  abstract generateBridgeNote(
    anchorId: number | string,
    destination: number,
    amount: number,
    wrappableAssetAddress?: string
  ): Promise<K>;
}
