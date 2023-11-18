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

export interface WebbContextState<T = unknown> {
  /** Boolean indicating if the app is loading */
  loading: boolean;

  /** All preconfigured wallets */
  wallets: Record<number, Wallet>;

  /** All preconfigured chains */
  chains: Record<number, Chain>;

  /** Active api */
  activeApi?: WebbApiProvider<T>;

  /** Active wallet */
  activeWallet?: Wallet;

  /**
   * Active chain
   * - `undefined` means no chain is active
   * - `null` means the active chain is unsupported
   * - `Chain` means the active chain is supported
   */
  activeChain?: Nullable<Maybe<Chain>>;

  /**
   * Active note manager
   */
  noteManager: Nullable<NoteManager>;

  /**
   * Login note account
   * @param key the key to login
   * @param walletAddress the wallet address to login
   */
  loginNoteAccount(
    key: string,
    walletAddress: string
  ): Promise<Nullable<NoteManager>>;

  /**
   * Logout note account
   * @param walletAddress the wallet address to logout
   */
  logoutNoteAccount(walletAddress: string): Promise<void>;

  /**
   * Clear note account corresponding to the wallet address
   * @param walletAddress the wallet address to purge
   */
  purgeNoteAccount(walletAddress: string): Promise<void>;

  /** apiConfig contains all preconfigured & on-chain data */
  apiConfig: ApiConfig;

  /** Active accounts list */
  accounts: Account[];

  /** Active account */
  activeAccount: Nullable<Account>;

  /** Boolean indicating if the app is connecting */
  isConnecting: boolean;

  /** Function to set active account and store it in local storage */
  setActiveAccount<T extends Account>(account: T): Promise<void>;

  /** Function to inactivate api */
  inactivateApi(): Promise<void>;

  /** Function to switch chain */
  switchChain(
    chain: Chain,
    wallet: Wallet,
    bridge?: Bridge
  ): Promise<Nullable<WebbApiProvider<T>>>;

  /** The active feedback */
  activeFeedback: Nullable<InteractiveFeedback>;

  /** Function to register interactive feedback */
  registerInteractiveFeedback: (
    interactiveFeedback: InteractiveFeedback
  ) => void;

  /** App event */
  appEvent: TAppEvent;

  /** App transaction queue */
  txQueue: TransactionQueueApi;
}

export const WebbContext = React.createContext<WebbContextState<unknown>>({
  chains: {},
  accounts: [],
  loading: true,
  activeAccount: null,
  noteManager: null,
  loginNoteAccount(key: string, walletAddress: string) {
    return Promise.resolve(null);
  },
  logoutNoteAccount(walletAddress: string) {
    return Promise.resolve();
  },
  purgeNoteAccount(walletAddress: string) {
    return Promise.resolve();
  },
  isConnecting: false,
  setActiveAccount<T extends Account>(account: T): Promise<void> {
    return Promise.resolve();
  },
  switchChain(chain, wallet) {
    return Promise.resolve(null);
  },
  inactivateApi(): Promise<void> {
    return Promise.resolve();
  },
  wallets: {},
  activeFeedback: null,
  apiConfig: ApiConfig.init({}),
  registerInteractiveFeedback: (interactiveFeedback: InteractiveFeedback) => {
    return;
  },
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
