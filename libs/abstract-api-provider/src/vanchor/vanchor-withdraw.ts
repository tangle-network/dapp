import { VAnchorContract } from '@webb-tools/evm-contracts';
// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import type { WebbApiProvider } from '../webb-provider.interface';
import { NewNotesTxResult, Transaction } from '../transaction';
import type { Note } from '@webb-tools/sdk-core';

export abstract class VAnchorWithdraw<T extends WebbApiProvider<any>> {
  constructor(protected inner: T) {}

  /**
   * Withdraw notes from the vanchor
   * @param notes the spend notes to withdraw
   * @param recipient the recipient of the withdraw
   * @param amount the amount to withdraw
   * @param metaDataNote the meta data note to provide the information about the withdraw
   * @param unwrapTokenAddress the token address to unwrap
   * (if zero address, then unwrap to native asset,
   * if fungible token address, then no unwrap,
   * if non-fungible token address, then unwrap to that token)
   */
  abstract withdraw(
    notes: string[],
    recipient: string,
    amount: string,
    metaDataNote: Note,
    unwrapTokenAddress: string
  ): Transaction<NewNotesTxResult>;

  abstract getDestVAnchorContract(destChainId: number): VAnchorContract | null;
}
