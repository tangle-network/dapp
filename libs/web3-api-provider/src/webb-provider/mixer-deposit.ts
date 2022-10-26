// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { DepositPayload as IDepositPayload, MixerDeposit, MixerSize } from '@nepoche/abstract-api-provider';
import { IAnchorDepositInfo } from '@webb-tools/interfaces';
import { Note } from '@webb-tools/sdk-core';

import { WebbWeb3Provider } from '..';

type DepositPayload = IDepositPayload<Note, [IAnchorDepositInfo, number | string, string?]>;

// The Web3 version used a deprecated fixed anchor where src and target chainID were the same.
// This is stubbed out to support Substrate mixers in the parent abstraction.
export class Web3MixerDeposit extends MixerDeposit<WebbWeb3Provider, DepositPayload> {
  // Override the deposit in AnchorDeposit to emit different notifications
  async deposit(depositPayload: DepositPayload): Promise<void> {
    throw new Error('No mixers exist for EVM networks');
  }

  async generateNote(mixerId: string): Promise<DepositPayload> {
    throw new Error('Cannot generate note for mixer on an EVM network');
  }

  async getSizes(): Promise<MixerSize[]> {
    return [];
  }
}
