// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { VAnchorWithdraw } from '../abstracts/anchor/vanchor-withdraw';
import { WebbPolkadot } from './webb-provider';

export class PolkadotVAnchorWithdraw extends VAnchorWithdraw<WebbPolkadot> {
  withdraw(note: string[], recipient: string, amount: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
}
