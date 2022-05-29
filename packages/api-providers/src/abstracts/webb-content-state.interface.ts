// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { Chain, Wallet } from './common';
import { WebbApiProvider } from './webb-provider.interface';

export interface WebbContextState<T = unknown> {
  wallets: Record<number, Wallet>;
  chains: Record<number, Chain>;
  activeApi?: WebbApiProvider<T>;
  activeWallet?: Wallet;
  activeChain?: Chain;

  setActiveChain(id: number): void;

  setActiveWallet(id: number): void;
}
