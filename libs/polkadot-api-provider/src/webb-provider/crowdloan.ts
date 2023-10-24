// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/ban-ts-comment */

import {
  ContributePayload,
  Crowdloan,
  CrowdloanFundInfo,
} from '@webb-tools/abstract-api-provider/crowdloan';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import '@webb-tools/tangle-substrate-types';

import { LoggerService } from '@webb-tools/app-util';

import { FundInfo } from '@polkadot/types/interfaces';

import { WebbPolkadot } from '../webb-provider';

const logger = LoggerService.get('PolkadotTx');

export class PolkadotCrowdloan extends Crowdloan<
  WebbPolkadot,
  ContributePayload
> {
  constructor(protected inner: WebbPolkadot) {
    super(inner);
  }

  async getFundInfo(parachainId: number): Promise<CrowdloanFundInfo> {
    // @ts-ignore
    const fundInfo: FundInfo = await this.inner.api.query.crowdloan?.funds(
      parachainId
    );
    const fundInfoJSON = fundInfo ? fundInfo.toJSON() : {};

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
    tx.on('failed', (e) => {
      console.log('contribution failed', e);
    });
    tx.on('extrinsicSuccess', () => {
      console.log('contribution done');
    });
    await tx.call(account.address);
  }
}
