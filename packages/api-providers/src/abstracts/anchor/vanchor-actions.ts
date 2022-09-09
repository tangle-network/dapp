// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import type { WebbApiProvider } from '../webb-provider.interface';

import { EventBus } from '@webb-tools/app-util';
import { Keypair, Note } from '@webb-tools/sdk-core';

export type VAnchorActionEvent = {
  error: string;
};

export abstract class VAnchorActions<T extends WebbApiProvider<any>> extends EventBus<VAnchorActionEvent> {
  constructor(protected inner: T) {
    super();
  }

  // A function to check if the (account, public key) pair is registered.
  abstract isPairRegistered(target: string, account: string, pubkey: string): Promise<boolean>;
  // A function to register an account. It will return true if the account was registered, and false otherwise.
  abstract register(target: string, account: string, pubkey: string): Promise<boolean>;
  // A function to retrieve notes from chain that are spendable by a keypair
  abstract syncNotesForKeypair(target: string, owner: Keypair): Promise<Note[]>;
}
