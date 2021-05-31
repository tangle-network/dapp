import React from 'react';
import { WalletConfig } from '@webb-dapp/react-environment/types/wallet-config.interface';
import { ChainConfig } from '@webb-dapp/react-environment/types/chian-config.interface';
import { Account } from '@webb-dapp/wallet/account/Accounts.adapter';
import { EventBus } from '@webb-tools/app-util';

type AppConfig = {
  wallet: Record<number, WalletConfig>;
  chains: Record<number, ChainConfig>;
}


export type WebbMethod<T extends EventBus<K>, K extends Record<string, unknown>> = {
  inner: T;
  enabled: boolean;
}


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


export  type MixerWithdrawEvents = {
  error: string;
  validationError: {
    note: string;
    recipient: string;
  };
  stateChange: WithdrawState
}

export abstract class MixerWithdraw extends EventBus<MixerWithdrawEvents> {
  state: WithdrawState = WithdrawState.Ideal;

  abstract withdraw(note: string, recipient: string): Promise<void>

  abstract cancelWithdraw(): Promise<void>
}


export interface WebbMixer {
  // deposit
  deposit: WebbMethod<MixerDeposit, MixerDepositEvents>
  // withdraw
  withdraw: WebbMethod<MixerWithdraw, MixerWithdrawEvents>
}

export interface WebbMethods {
  mixer: WebbMixer;
}


export interface WebbApiProvider {
  account: Account;
  methods: WebbMethods
}

export interface WebbContentState {
  appConfig: AppConfig;
  activeApi?: WebbApiProvider;

  setActiveApi(nextActiveApi: WebbMethods): void;
};


export const WebbContext = React.createContext<WebbContentState>({
  appConfig: {
    wallet: {},
    chains: {}
  },
  setActiveApi(nextActiveApi: WebbMethods) {
  }

});