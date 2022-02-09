import { AppConfig, Chain, Wallet } from '@webb-dapp/react-environment/webb-context/common';
import { WebbApiProvider } from '@webb-dapp/react-environment/webb-context/webb-provider.interface';
import { InteractiveFeedback } from '@webb-dapp/utils/webb-error';
import { Account } from '@webb-dapp/wallet/account/Accounts.adapter';
import React from 'react';

interface Note {
  serialize(): string;

  // deserialize(noteStr: string): Note;
}

type DespotStates = 'ideal' | 'generating-note' | 'depositing';

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
  wallets: {},

  activeAccount: null,
  isConnecting: false,
  appConfig: {
    anchors: {},
    bridgeByAsset: {},
    chains: {},
    currencies: {},
    mixers: {},
    wallet: {},
  },
  setActiveAccount<T extends Account>(account: T): Promise<void> {
    return Promise.resolve();
  },
  switchChain(chain, wallet) {
    return Promise.resolve(null);
  },
  inactivateApi(): Promise<void> {
    return Promise.resolve();
  },
  activeFeedback: null,
  registerInteractiveFeedback: (interactiveFeedback: InteractiveFeedback) => {
    return;
  },
});

export const useWebContext = <T = unknown>() => {
  return React.useContext(WebbContext) as WebbContextState<T>;
};
