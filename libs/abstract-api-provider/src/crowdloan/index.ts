// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { EventBus } from '@webb-tools/app-util';
import { BehaviorSubject } from 'rxjs';

export type CrowdloanEvent = {
  ready: null;
};

export type ContributePayload = {
  amount: number;
  parachainId: number;
};

export type CrowdloanFundInfo = {
  raised: bigint;
  end: bigint;
  cap: bigint;
};

/**
 * Webb crowdloan contributing interface
 **/
export abstract class Crowdloan<
  T,
  CrowdloanPayload extends ContributePayload
> extends EventBus<CrowdloanEvent> {
  // The crowdloan token id
  protected crowdloanToken: BehaviorSubject<number | null> =
    new BehaviorSubject<null | number>(null);

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
