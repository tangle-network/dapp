// Copyright 2024 @tangle-network/
// SPDX-License-Identifier: Apache-2.0

import {
  Account,
  AccountsAdapter,
} from '@tangle-network/abstract-api-provider/account';
import { PublicKey } from '@solana/web3.js';

export class SolanaAccount extends Account<PublicKey> {
  constructor(
    public override readonly _inner: PublicKey,
    public override readonly address: string,
  ) {
    super(_inner, address);
  }

  get avatar() {
    return '';
  }

  get name(): string {
    return '';
  }
}

export interface PhantomProvider {
  isPhantom?: boolean;
  publicKey?: PublicKey | null;
  isConnected?: boolean;
  signMessage?: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  connect?: () => Promise<{ publicKey: PublicKey }>;
  disconnect?: () => Promise<void>;
  on?: (event: string, callback: (args: any) => void) => void;
  removeListener?: (event: string, callback: (args: any) => void) => void;
  request?: (args: { method: string; params?: any }) => Promise<any>;
}

export class SolanaAccounts extends AccountsAdapter<
  PhantomProvider,
  PublicKey
> {
  providerName = 'Solana';
  private _activeAccount: SolanaAccount | null = null;

  constructor(provider: PhantomProvider) {
    super(provider);
    this.updateActiveAccount();
  }

  private updateActiveAccount(): void {
    if (this.inner.publicKey) {
      const publicKey = this.inner.publicKey;
      this._activeAccount = new SolanaAccount(publicKey, publicKey.toString());
    } else {
      this._activeAccount = null;
    }
  }

  async accounts(): Promise<SolanaAccount[]> {
    if (this.inner.publicKey) {
      const publicKey = this.inner.publicKey;
      return [new SolanaAccount(publicKey, publicKey.toString())];
    }
    return [];
  }

  get activeOrDefault(): SolanaAccount | null {
    return this._activeAccount;
  }

  async setActiveAccount(_nextAccount: Account): Promise<void> {
    return;
  }
}
