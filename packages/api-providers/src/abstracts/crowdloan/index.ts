// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { EventBus } from '@webb-tools/app-util';
import { BehaviorSubject, Observable } from 'rxjs';

import { WebbCurrencyId } from '../../enums';

export type CrowdloanEvent = {
  ready: null;
};

export type ContributePayload = {
  amount: number | string;
  parachainId: string;
};

/**
 * Webb crowdloan contributing interface
 **/
export abstract class Crowdloan<T, CrowdloanPayload extends ContributePayload> extends EventBus<CrowdloanEvent> {
  protected crowdloanToken: BehaviorSubject<WebbCurrencyId | null> = new BehaviorSubject<null | WebbCurrencyId>(null);

  constructor(protected inner: T) {
    super();
  }
  /**
   * Contribute to a crowdloan
   **/
  abstract contribute(crowdloanPayload: CrowdloanPayload): Promise<void>;

  // /**
  //  * Observing the balances of the two edges
  //  **/
  // abstract get getContribution(): Observable<CrowdloanAmount>;
}
