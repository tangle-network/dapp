// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { BehaviorSubject, Observable } from 'rxjs';

import { WebbCurrencyId } from '../../enums';

export type ContributeEvent = {
  ready: null;
};

export type Amount = {
  amount: number | string;
};

export type ContributeAmount = {
  tokenId?: WebbCurrencyId;
  balance: string;
};

/**
 * Webb crowdloan contributing interface
 **/
export abstract class Crowdloan<T, CrowdloanPayload extends Amount = Amount> {
  protected crowdloanToken: BehaviorSubject<WebbCurrencyId | null> = new BehaviorSubject<null | WebbCurrencyId>(null);

  constructor(protected inner: T) {}

  abstract get subscription(): Observable<Partial<ContributeEvent>>;

  /**
   * Contribute to a crowdloan
   **/
  abstract contribute(crowdloanPayload: CrowdloanPayload): Promise<boolean>;

  /**
   * Observing the balances of the two edges
   **/
  abstract get getContribution(): Observable<[ContributeAmount, ContributeAmount]>;
}
