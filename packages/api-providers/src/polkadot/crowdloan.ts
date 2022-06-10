// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/ban-ts-comment */

import '@webb-tools/types';

import { LoggerService } from '@webb-tools/app-util';

import { ContributePayload, Crowdloan } from '../abstracts/crowdloan';
import { WebbError, WebbErrorCodes } from '../webb-error';
import { WebbPolkadot } from './webb-provider';

// The DepositPayload is the Note and [treeId, leafhex]
const logger = LoggerService.get('PolkadotTx');

export class PolkadotCrowdloan extends Crowdloan<WebbPolkadot, ContributePayload> {
  constructor(protected inner: WebbPolkadot) {
    super(inner);
  }

  async contribute(contributePayload: ContributePayload): Promise<void> {
    const tx = this.inner.txBuilder.build(
      {
        section: 'crowdloan',
        method: 'contribute',
      },
      [
        contributePayload.parachainId,
        contributePayload.amount,
        undefined, // required
      ]
    );
    console.log('contribute tx', tx);
    const account = await this.inner.accounts.activeOrDefault;

    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    tx.on('finalize', () => {
      console.log('contribution done');
    });
    tx.on('failed', (e: any) => {
      console.log('contribution failed', e);
    });
    tx.on('extrinsicSuccess', () => {
      console.log('contribution done');
    });
    await tx.call(account.address);
  }
}
