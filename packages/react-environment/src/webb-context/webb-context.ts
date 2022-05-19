import { Account, Chain, Wallet, WebbApiProvider } from '@webb-tools/api-providers';
import { AppConfig } from '@webb-tools/api-providers';
import { InteractiveFeedback } from '@webb-tools/api-providers/webb-error';
import React from 'react';
interface Note {
  serialize(): string;
}

type DepositStates = 'ideal' | 'generating-note' | 'depositing';

export interface WebbContextState<T = unknown> {
  loading: boolean;
  wallets: Record<number, Wallet>;
  chains: Record<number, Chain>;
  activeApi?: WebbApiProvider<T>;
  activeWallet?: Wallet;
  activeChain?: Chain;
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
