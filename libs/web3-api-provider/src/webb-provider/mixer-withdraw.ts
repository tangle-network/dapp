// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { MixerWithdraw } from '@nepoche/abstract-api-provider';

import { WebbWeb3Provider } from '../webb-provider';

// The Web3Mixer Withdraw used a deprecated Fixed Anchor, with the same target and source chain id.
// This is stubbed out to support Substrate mixers in the parent abstraction.
export class Web3MixerWithdraw extends MixerWithdraw<WebbWeb3Provider> {
  // Withdraw is overriden to emit notifications specific to 'mixer'
  async withdraw(note: string, recipient: string): Promise<string> {
    throw new Error('No mixers exist for EVM networks');
  }
}
