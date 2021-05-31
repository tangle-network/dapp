import React from 'react';
import { WalletConfig } from '@webb-dapp/react-environment/types/wallet-config.interface';
import { ChainConfig } from '@webb-dapp/react-environment/types/chian-config.interface';
import { Account } from '@webb-dapp/wallet/account/Accounts.adapter';
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
};

export abstract class MixerDeposit extends EventBus<MixerDepositEvents> {
  abstract generateNote(mixerId: number): Note;

  abstract deposit(note: Note): Promise<void>;

  abstract loading: 'ideal' | 'generating-note' | 'depositing';
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
};

export abstract class MixerWithdraw extends EventBus<MixerWithdrawEvents> {
  state: WithdrawState = WithdrawState.Ideal;

  abstract withdraw(note: string, recipient: string): Promise<void>;

  abstract cancelWithdraw(): Promise<void>;
}

export interface WebbMixer {
  // deposit
  deposit: WebbMethod<MixerDeposit, MixerDepositEvents>;
  // withdraw
  withdraw: WebbMethod<MixerWithdraw, MixerWithdrawEvents>;
}

export interface WebbMethods {
  mixer: WebbMixer;
}

export interface WebbApiProvider {
  account: Account;
  methods: WebbMethods;
}

export type Chain = ChainConfig & {
  wallets: Record<number, Wallet>;
};
export type Wallet = WalletConfig & {};

export interface WebbContentState {
  wallets: Record<number, Wallet>;
  chains: Record<number, Chain>;
  activeApi?: WebbApiProvider;
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
