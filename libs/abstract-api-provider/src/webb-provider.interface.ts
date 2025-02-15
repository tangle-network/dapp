// Copyright 2024 @tangle-network/
// SPDX-License-Identifier: Apache-2.0

import { ApiConfig } from '@tangle-network/dapp-config';
import { EventBus } from '@tangle-network/dapp-types/EventBus';
import { BehaviorSubject, Observable } from 'rxjs';
import { AccountsAdapter } from './account/Accounts.adapter';

export type WebbProviderEvents<T = any> = {
  /// The provider is updated and an action is required to handle this update
  providerUpdate: T;
  /// accountsChange
  newAccounts: AccountsAdapter<any>;
};

export interface WebbApiProvider extends EventBus<WebbProviderEvents> {
  accounts: AccountsAdapter<unknown>;

  typedChainidSubject: BehaviorSubject<number>;

  destroy(): Promise<void> | void;

  endSession?(): Promise<void>;

  getProvider(): any;

  // Configuration passed to the ApiProvider on initialization.
  // Then, the config is used as state for the provider.
  config: ApiConfig;

  // new block observable
  newBlock: Observable<bigint | null>;

  /** Get the latest block number */
  getBlockNumber(): bigint | null;

  sign(message: string): Promise<string>;
}
