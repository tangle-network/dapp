'use client';

import type {
  Account,
  WebbApiProvider,
} from '@tangle-network/abstract-api-provider';
import {
  ApiConfig,
  type Chain,
  type Wallet,
} from '@tangle-network/dapp-config';
import type { Maybe, Nullable } from '@tangle-network/dapp-types/utils/types';
import { AppEvent, type TAppEvent } from '../app-event';
import { createContext, useContext } from 'react';

export interface WebbContextState {
  /** Whether the app is loading */
  loading: boolean;

  /** All pre-configured wallets */
  wallets: Record<number, Wallet>;

  /** All pre-configured chains */
  chains: Record<number, Chain>;

  activeApi?: WebbApiProvider;

  activeWallet?: Wallet;

  /**
   * - `undefined` means no chain is active
   * - `null` means the active chain is unsupported
   * - `Chain` means the active chain is supported
   */
  activeChain?: Nullable<Maybe<Chain>>;

  /** All pre-configured & on-chain data */
  apiConfig: ApiConfig;

  accounts: Account[];

  activeAccount: Nullable<Account>;

  /** Whether the app is connecting */
  isConnecting: boolean;

  /** Set the active account and store it in local storage */
  setActiveAccount<T extends Account>(account: T): Promise<void>;

  inactivateApi(): Promise<void>;

  switchChain(chain: Chain, wallet: Wallet): Promise<Nullable<WebbApiProvider>>;

  appName: string;

  appEvent: TAppEvent;
}

export const WebbContext = createContext<WebbContextState>({
  chains: {},
  accounts: [],
  loading: true,
  activeAccount: null,
  isConnecting: false,
  setActiveAccount() {
    return Promise.resolve();
  },
  switchChain() {
    return Promise.resolve(null);
  },
  inactivateApi() {
    return Promise.resolve();
  },
  wallets: {},
  apiConfig: ApiConfig.init({}),
  appName: '',
  appEvent: new AppEvent(),
});

export const useWebContext = () => {
  return useContext(WebbContext);
};
