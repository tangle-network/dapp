import React from 'react';
import { WalletConfig } from '@webb-dapp/react-environment/types/wallet-config.interface';
import { ChainConfig } from '@webb-dapp/react-environment/types/chian-config.interface';
import { AccountsAdapter } from '@webb-dapp/wallet/account/Accounts.adapter';
import { EventBus } from '@webb-tools/app-util';

export type AppConfig = {
  wallet: Record<number, WalletConfig>;
  chains: Record<number, ChainConfig>;
};

export type WebbMethod<T extends EventBus<K>, K extends Record<string, unknown>> = {
  inner: T;
  enabled: boolean;
};

type Note = unknown;

export type MixerDepositEvents = {
  error: string;
  ready: undefined;
};

type DespotStates = 'ideal' | 'generating-note' | 'depositing';

export abstract class MixerDeposit<T> extends EventBus<MixerDepositEvents> {
  constructor(protected inner: T) {
    super();
  }

  abstract generateNote(mixerId: number): Note;

  abstract deposit(note: Note): Promise<void>;

  loading: DespotStates = 'ideal';

  abstract getSizes(): Promise<string[]>;
}

export enum WithdrawState {
  Canceled,
  Ideal,

  GeneratingZk,

  SendingTransaction,

  Done,
  Failed,
}

export type MixerWithdrawEvents = {
  error: string;
  validationError: {
    note: string;
    recipient: string;
  };
  stateChange: WithdrawState;

  ready: void;
  loading: boolean;
};

export abstract class MixerWithdraw<T> extends EventBus<MixerWithdrawEvents> {
  state: WithdrawState = WithdrawState.Ideal;

  constructor(protected inner: T) {
    super();
  }

  abstract withdraw(note: string, recipient: string): Promise<void>;

  abstract cancelWithdraw(): Promise<void>;
}

export interface WebbMixer<T> {
  // deposit
  deposit: WebbMethod<MixerDeposit<T>, MixerDepositEvents>;
  // withdraw
  withdraw: WebbMethod<MixerWithdraw<T>, MixerWithdrawEvents>;
}

export interface WebbMethods<T> {
  mixer: WebbMixer<T>;
}

export interface WebbApiProvider<T> {
  accounts: AccountsAdapter<any>;
  methods: WebbMethods<T>;
}

export type Chain = ChainConfig & {
  wallets: Record<number, Wallet>;
};
export type Wallet = WalletConfig & {};

export interface WebbContentState {
  wallets: Record<number, Wallet>;
  chains: Record<number, Chain>;
  activeApi?: WebbApiProvider<unknown>;
  activeWallet?: Wallet;
  activeChain?: Chain;

  setActiveChain(id: number): void;

  setActiveWallet(id: number): void;
}

export const WebbContext = React.createContext<WebbContentState>({
  chains: {},
  setActiveChain(id: number): void {},
  setActiveWallet(id: number): void {},
  wallets: {},
});
