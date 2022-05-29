// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

export abstract class Account<T = unknown> {
  constructor(protected readonly _inner: T, public readonly address: string) {}

  // TODO abstract create react element
  abstract get avatar(): unknown;

  abstract get name(): string;

  protected get inner() {
    return this._inner;
  }
}

/*
 * This class is wrapping the accounts and accounts meta data
 * form multiple providers into a single interface
 **/

export type PromiseOrT<T> = Promise<T> | T;

export abstract class AccountsAdapter<T = unknown, K = unknown> {
  abstract providerName: string;

  constructor(protected readonly _inner: T) {}

  abstract get activeOrDefault(): Promise<Account<K> | null> | Account<K> | null;

  abstract accounts(): PromiseOrT<Account<T | K>[]>;

  abstract setActiveAccount(account: Account): PromiseOrT<void>;

  protected get inner() {
    return this._inner;
  }
}
