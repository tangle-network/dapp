// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { EventBus } from '@webb-tools/app-util';
import { ApiConfig } from '@webb-tools/dapp-config';
import { BehaviorSubject, Observable } from 'rxjs';
import { AccountsAdapter } from './account/Accounts.adapter';

export type WebbProviderEvents<T = any> = {
  /// The provider is updated and an action is required to handle this update
  providerUpdate: T;
  /// accountsChange
  newAccounts: AccountsAdapter<any>;
};

export type ProvideCapabilities = {
  addNetworkRpc: boolean;
  listenForAccountChange: boolean;
  listenForChainChane: boolean;
  hasSessions: boolean;
};

export interface WebbApiProvider extends EventBus<WebbProviderEvents> {
  accounts: AccountsAdapter<unknown>;

  typedChainidSubject: BehaviorSubject<number>;

  destroy(): Promise<void> | void;

  capabilities?: ProvideCapabilities;

  endSession?(): Promise<void>;

  getProvider(): any;

  // Used by frontend to prevent unsupported actions
  // e.g. attempting to fetch available tokens from a DKG chain.
  ensureApiInterface(): Promise<boolean>;

  // Configuration passed to the ApiProvider on initialization.
  // Then, the config is used as state for the provider.
  config: ApiConfig;

  // new block observable
  newBlock: Observable<bigint | null>;

  /** Get the latest block number */
  getBlockNumber(): bigint | null;

  sign(message: string): Promise<string>;
}
