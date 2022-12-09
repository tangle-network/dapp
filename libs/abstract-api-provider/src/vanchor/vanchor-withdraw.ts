// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import type { WebbApiProvider } from '../webb-provider.interface';
import { NewNotesTxResult, Transaction } from '../transaction';
import type { Note } from '@webb-tools/sdk-core';

export abstract class VAnchorWithdraw<T extends WebbApiProvider<any>> {
  constructor(protected inner: T) {}

  abstract withdraw(
    notes: string[],
    recipient: string,
    amount: string,
    metaDataNote: Note,
    unwrapTokenAddress?: string
  ): Transaction<NewNotesTxResult>;
}
