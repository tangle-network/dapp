import React from 'react';
import { WalletConfig } from '@webb-dapp/react-environment/types/wallet-config.interface';
import { ChainConfig } from '@webb-dapp/react-environment/types/chian-config.interface';
import { Account } from '@webb-dapp/wallet/account/Accounts.adapter';

type AppConfig = {
  wallet: Record<number, WalletConfig>;
  chains: Record<number, ChainConfig>;
}


export type WebbMethod<T = unknown> = {
  data: T;
  enabled: boolean;
}


type Note = unknown;

export interface MixerDeposit {
  generateNote(mixerId: number): Note;

  deposit(): Promise<void>;

  loading: boolean;
}

export enum WithdrawState {
  Canceled,
  Ideal,

  GeneratingZk,

  SendingTransaction,

  Done,
  Failed,
}

export interface MixerWithdraw {
  state: WithdrawState

  withdraw(note: string, recipient: string): Promise<void>

  canCancel: boolean;

  cancelWithdraw(): Promise<void> | void;

  canWithdraw: boolean;

  validationErrors: {
    note: string;
    recipient: string;
  };

  error?: string;


}


export interface WebbMixer {
  // deposit
  deposit: WebbMethod<MixerDeposit>
  // withdraw
  withdraw: WebbMethod<MixerWithdraw>
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