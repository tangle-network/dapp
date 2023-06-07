import {
  Account,
  Bridge,
  Transaction,
  WebbApiProvider,
} from '@webb-tools/abstract-api-provider';
import { ApiConfig, Chain, Wallet } from '@webb-tools/dapp-config';
import { InteractiveFeedback } from '@webb-tools/dapp-types';
import { NoteManager } from '@webb-tools/note-manager';
import React from 'react';
import { AppEvent, TAppEvent } from '../app-event';
import { TransactionQueueApi } from '../transaction';

export interface WebbContextState<T = unknown> {
  loading: boolean;
  wallets: Record<number, Wallet>;
  chains: Record<number, Chain>;
  activeApi?: WebbApiProvider<T>;
  activeWallet?: Wallet;
  activeChain?: Chain;
  noteManager: NoteManager | null;

  loginNoteAccount(key: string): Promise<NoteManager | null>;

  logoutNoteAccount(): Promise<void>;

  purgeNoteAccount(): Promise<void>;

  apiConfig: ApiConfig;
  accounts: Account[];
  activeAccount: Account | null;
  isConnecting: boolean;

  setActiveAccount<T extends Account>(account: T): Promise<void>;

  inactivateApi(): Promise<void>;

  switchChain(
    chain: Chain,
    wallet: Wallet,
    bridge?: Bridge
  ): Promise<WebbApiProvider<T> | null>;

  activeFeedback: InteractiveFeedback | null;
  registerInteractiveFeedback: (
    interactiveFeedback: InteractiveFeedback
  ) => void;
  appEvent: TAppEvent;

  txQueue: TransactionQueueApi;
}

export const WebbContext = React.createContext<WebbContextState>({
  chains: {},
  accounts: [],
  loading: true,
  activeAccount: null,
  noteManager: null,
  loginNoteAccount(key: string) {
    return Promise.resolve(null);
  },
  logoutNoteAccount() {
    return Promise.resolve();
  },
  purgeNoteAccount() {
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
      registerTransaction(_tx: Transaction<any>) {
        return;
      },
      getLatestTransaction(_name: 'Deposit' | 'Withdraw' | 'Transfer') {
        return null;
      },
    },
  },
});

export const useWebContext = <T = unknown>() => {
  return React.useContext(WebbContext) as WebbContextState<T>;
};
export const useApiConfig = () => {
  const { apiConfig } = useWebContext();
  return apiConfig;
};
