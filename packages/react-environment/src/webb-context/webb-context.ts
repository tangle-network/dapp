import { WebbApiProvider } from '@webb-dapp/react-environment/webb-context/webb-provider.interface';
import { Chain, Wallet } from '@webb-dapp/react-environment/webb-context/common';
import { Account } from '@webb-dapp/wallet/account/Accounts.adapter';
import React from 'react';
import { InteractiveFeedback, WebbError } from '@webb-dapp/utils/webb-error';

interface Note {
  serialize(): string;

  // deserialize(noteStr: string): Note;
}

type DespotStates = 'ideal' | 'generating-note' | 'depositing';

export interface WebbContentState<T = unknown> {
  loading: boolean;
  wallets: Record<number, Wallet>;
  chains: Record<number, Chain>;
  activeApi?: WebbApiProvider<T>;
  activeWallet?: Wallet;
  activeChain?: Chain;

  accounts: Account[];
  activeAccount: Account | null;
  isConnecting: boolean;

  setActiveAccount<T extends Account>(account: T): Promise<void>;

  inactivateApi(): Promise<void>;

  switchChain(chain: Chain, wallet: Wallet): Promise<WebbApiProvider<T> | null>;

  activeFeedback: InteractiveFeedback | null;
  registerInteractiveFeedback: (interactiveFeedback: InteractiveFeedback) => void;
}

export const WebbContext = React.createContext<WebbContentState>({
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
  registerInteractiveFeedback: (interactiveFeedback: InteractiveFeedback) => {
    return;
  },
});

export const useWebContext = <T = unknown>() => {
  return React.useContext(WebbContext) as WebbContentState<T>;
};
