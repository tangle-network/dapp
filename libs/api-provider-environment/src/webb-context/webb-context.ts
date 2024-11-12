'use client';

import type {
  Account,
  Bridge,
  TransactionExecutor,
  WebbApiProvider,
} from '@webb-tools/abstract-api-provider';
import { ApiConfig, type Chain, type Wallet } from '@webb-tools/dapp-config';
import type { InteractiveFeedback } from '@webb-tools/dapp-types';
import type { Maybe, Nullable } from '@webb-tools/dapp-types/utils/types';
import type { NoteManager } from '@webb-tools/note-manager';
import React from 'react';
import { AppEvent, type TAppEvent } from '../app-event';
import type { TransactionQueueApi } from '../transaction';
import noop from 'lodash/noop';

export interface WebbContextState<T = unknown> {
  /** Whether the app is loading */
  loading: boolean;

  /** All pre-configured wallets */
  wallets: Record<number, Wallet>;

  /** All pre-configured chains */
  chains: Record<number, Chain>;

  activeApi?: WebbApiProvider<T>;

  activeWallet?: Wallet;

  /**
   * - `undefined` means no chain is active
   * - `null` means the active chain is unsupported
   * - `Chain` means the active chain is supported
   */
  activeChain?: Nullable<Maybe<Chain>>;

  noteManager: Nullable<NoteManager>;

  /**
   * @param key the key to login
   * @param walletAddress the wallet address to login
   */
  loginNoteAccount(
    key: string,
    walletAddress: string,
  ): Promise<Nullable<NoteManager>>;

  /**
   * @param walletAddress the wallet address to logout
   */
  logoutNoteAccount(walletAddress: string): Promise<void>;

  /**
   * Clear note account corresponding to the wallet address
   * @param walletAddress the wallet address to purge
   */
  purgeNoteAccount(walletAddress: string): Promise<void>;

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
  ): Promise<Nullable<WebbApiProvider<T>>>;

  activeFeedback: Nullable<InteractiveFeedback>;

  registerInteractiveFeedback: (
    interactiveFeedback: InteractiveFeedback,
  ) => void;

  appName: string;

  appEvent: TAppEvent;

  txQueue: TransactionQueueApi;
}

export const WebbContext = React.createContext<WebbContextState<unknown>>({
  chains: {},
  accounts: [],
  loading: true,
  activeAccount: null,
  noteManager: null,
  loginNoteAccount() {
    return Promise.resolve(null);
  },
  logoutNoteAccount() {
    return Promise.resolve();
  },
  purgeNoteAccount() {
    return Promise.resolve();
  },
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
  txQueue: {
    txQueue: [],
    currentTxId: null,
    txPayloads: [],
    api: {
      startNewTransaction() {
        return;
      },
      cancelTransaction(_id: string) {
        return;
      },
      dismissTransaction(_id: string) {
        return;
      },
      registerTransaction(_tx: TransactionExecutor<any>) {
        return;
      },
      getLatestTransaction(_name: 'Deposit' | 'Withdraw' | 'Transfer') {
        return null;
      },
    },
  },
});

export const useWebContext = () => {
  return React.useContext(WebbContext);
};
