// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */

import { Note } from '@webb-tools/sdk-core';

import { DepositPayload as IDepositPayload, MixerSize, VAnchorDeposit } from '../abstracts';
import { WebbPolkadot } from './webb-provider';

// The Deposit Payload is the note and [treeId, leafHex]
type DepositPayload = IDepositPayload<Note, [number, string]>;
/**
 * Webb Anchor API implementation for Polkadot
 **/
export class PolkadotVAnchorDeposit extends VAnchorDeposit<WebbPolkadot, DepositPayload> {
  generateBridgeNote(
    anchorId: string | number,
    destination: number,
    amount: number,
    wrappableAssetAddress?: string
  ): Promise<DepositPayload> {
    throw new Error('Method not implemented.');
  }

  deposit(depositPayload: DepositPayload): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getSizes(): Promise<MixerSize[]> {
    throw new Error('Method not implemented.');
  }
}
