import React from 'react';
export abstract class Account<T extends unknown = unknown> {
  constructor(protected readonly _inner: T, protected readonly address: string) {}
  abstract get avatar(): React.ReactNode;
  abstract get name(): string;

  protected get inner() {
    return this._inner;
  }
}

/*
 * This class is wrapping the accounts and accounts meta data
 * form multiple providers into a single interface
 * */

export type PromiseOrT<T> = Promise<T> | T;

export abstract class AccountsAdapter<T extends unknown = unknown, K = unknown> {
  abstract providerName: string;
  constructor(protected readonly _inner: T) {}

  abstract get activeOrDefault(): Promise<Account<K> | null> | Account<K> | null;

  abstract accounts(): PromiseOrT<Account<T | K>[]>;

  abstract setActiveAccount(account: Account): PromiseOrT<void>;

  protected get inner() {
    return this._inner;
  }
}
