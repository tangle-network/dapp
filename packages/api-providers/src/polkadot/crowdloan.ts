// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/ban-ts-comment */

import '@webb-tools/types';

import { LoggerService } from '@webb-tools/app-util';

import { FundInfo } from '@polkadot/types/interfaces';

import { ContributePayload, Crowdloan, CrowdloanFundInfo } from '../abstracts/crowdloan';
import { WebbError, WebbErrorCodes } from '../webb-error';
import { WebbPolkadot } from './webb-provider';

// The DepositPayload is the Note and [treeId, leafhex]
const logger = LoggerService.get('PolkadotTx');

export class PolkadotCrowdloan extends Crowdloan<WebbPolkadot, ContributePayload> {
  constructor(protected inner: WebbPolkadot) {
    super(inner);
  }

  async getFundInfo(parachainId: number): Promise<CrowdloanFundInfo> {
    // @ts-ignore
    let fundInfo: FundInfo = await this.inner.api.query.crowdloan?.funds(parachainId);
    let fundInfoJSON = fundInfo ? fundInfo.toJSON() : {};

    return {
      raised: BigInt(fundInfoJSON.raised?.toString() || 0),
      cap: BigInt(fundInfoJSON.cap?.toString() || 0),
      end: BigInt(fundInfoJSON.end?.toString() || 0),
    };
  }

  async contribute(contributePayload: ContributePayload): Promise<void> {
    const tx = this.inner.txBuilder.build(
      {
        section: 'crowdloan',
        method: 'contribute',
      },
      [
        contributePayload.parachainId,
        contributePayload.amount._getInner(),
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
