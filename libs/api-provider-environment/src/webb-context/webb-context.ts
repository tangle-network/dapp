'use client';

import type {
  Account,
  Bridge,
  WebbApiProvider,
} from '@webb-tools/abstract-api-provider';
import { ApiConfig, type Chain, type Wallet } from '@webb-tools/dapp-config';
import type { InteractiveFeedback } from '@webb-tools/dapp-types';
import type { Maybe, Nullable } from '@webb-tools/dapp-types/utils/types';
import noop from 'lodash/noop';
import React from 'react';
import { AppEvent, type TAppEvent } from '../app-event';

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

  switchChain(
    chain: Chain,
    wallet: Wallet,
    bridge?: Bridge,
  ): Promise<Nullable<WebbApiProvider>>;

  activeFeedback: Nullable<InteractiveFeedback>;

  registerInteractiveFeedback: (
    interactiveFeedback: InteractiveFeedback,
  ) => void;

  appName: string;

  appEvent: TAppEvent;
}

export const WebbContext = React.createContext<WebbContextState>({
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
  activeFeedback: null,
  apiConfig: ApiConfig.init({}),
  registerInteractiveFeedback: noop,
  appName: '',
  appEvent: new AppEvent(),
});

export const useWebContext = () => {
  return React.useContext(WebbContext);
};
