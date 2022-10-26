// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { NewNotesTxResult, VAnchorTransfer, VanchorTransferPayload } from '@nepoche/abstract-api-provider';

import { WebbPolkadot } from '..';

export class PolkadotVAnchorTransfer extends VAnchorTransfer<WebbPolkadot> {
  /**
   * @param notes - an array of notes which should be spent for the transfer.
   *                the array may be empty, which would indicate a 'deposit and transfer' flow.
   * @param recipient - An identifier for the recipient.
   * @param amount - the amount to transfer.
   * @param destination - the destination typedChainId.
   */
  transfer(transferData: VanchorTransferPayload): Promise<NewNotesTxResult> {
    throw new Error('transfer not implemented for polkadot');
  }
}
