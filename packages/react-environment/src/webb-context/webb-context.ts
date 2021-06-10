import { WebbApiProvider } from '@webb-dapp/react-environment/webb-context/webb-provider.interface';
import { Chain, Wallet } from '@webb-dapp/react-environment/webb-context/common';
import { Account } from '@webb-dapp/wallet/account/Accounts.adapter';
import React from 'react';
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

  setActiveAccount<T extends Account>(account: T): Promise<void>;

  setActiveChain(id: number): void;

  setActiveWallet(id: number): void;
}

export const WebbContext = React.createContext<WebbContentState>({
  chains: {},
  accounts: [],
  loading: true,
  activeAccount: null,

  setActiveAccount<T extends Account>(account: T): Promise<void> {
    return Promise.resolve();
  },
  setActiveChain(id: number): void {},
  setActiveWallet(id: number): void {},
  wallets: {},
});

export const useWebContext = <T = unknown>() => {
  return React.useContext(WebbContext) as WebbContentState<T>;
};
