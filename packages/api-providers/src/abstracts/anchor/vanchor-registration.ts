// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import type { WebbApiProvider } from '../webb-provider.interface';

import { EventBus } from '@webb-tools/app-util';

export type VAnchorRegistrationEvent = {
  error: string;
};

export abstract class VAnchorRegistration<T extends WebbApiProvider<any>> extends EventBus<VAnchorRegistrationEvent> {
  constructor(protected inner: T) {
    super();
  }

  // A function to check if the (account, public key) pair is registered.
  abstract isPairingRegistered(target: string, account: string, pubkey: string): Promise<boolean>;
  // A function to register an account. It will return true if the account was registered, and false otherwise.
  abstract register(target: string, account: string, pubkey: string): Promise<boolean>;
}
