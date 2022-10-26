// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { CurrencyId } from '@nepoche/dapp-types';
import { EventBus } from '@webb-tools/app-util';
import { FixedPointNumber } from '@webb-tools/sdk-core';
import { BehaviorSubject } from 'rxjs';

export type CrowdloanEvent = {
  ready: null;
};

export type ContributePayload = {
  amount: FixedPointNumber;
  parachainId: number;
};

export type CrowdloanFundInfo = {
  raised: BigInt;
  end: BigInt;
  cap: BigInt;
};

/**
 * Webb crowdloan contributing interface
 **/
export abstract class Crowdloan<T, CrowdloanPayload extends ContributePayload> extends EventBus<CrowdloanEvent> {
  protected crowdloanToken: BehaviorSubject<CurrencyId | null> = new BehaviorSubject<null | CurrencyId>(null);

  constructor(protected inner: T) {
    super();
  }
  /**
   * Contribute to a crowdloan
   **/
  abstract contribute(crowdloanPayload: CrowdloanPayload): Promise<void>;

  /**
   * Observing the balances of the two edges
   **/
  abstract getFundInfo(parachainId: number): Promise<CrowdloanFundInfo>;
}
