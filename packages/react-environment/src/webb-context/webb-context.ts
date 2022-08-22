import { Account, AppConfig, Chain, InteractiveFeedback, Wallet, WebbApiProvider } from '@webb-dapp/api-providers';
import { NoteManager } from '@webb-dapp/api-providers/notes/note-manager';
import React from 'react';

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
  appConfig: AppConfig;
  accounts: Account[];
  activeAccount: Account | null;
  isConnecting: boolean;
  setActiveAccount<T extends Account>(account: T): Promise<void>;
  inactivateApi(): Promise<void>;
  switchChain(chain: Chain, wallet: Wallet): Promise<WebbApiProvider<T> | null>;
  activeFeedback: InteractiveFeedback | null;
  registerInteractiveFeedback: (interactiveFeedback: InteractiveFeedback) => void;
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
  appConfig: {
    wallet: {},
    anchors: {},
    bridgeByAsset: {},
    chains: {},
    currencies: {},
  },
  registerInteractiveFeedback: (interactiveFeedback: InteractiveFeedback) => {
    return;
  },
});

export const useWebContext = <T = unknown>() => {
  return React.useContext(WebbContext) as WebbContextState<T>;
};
export const useAppConfig = () => {
  const { appConfig } = useWebContext();
  return appConfig;
};
