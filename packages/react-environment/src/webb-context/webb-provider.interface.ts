import { AccountsAdapter } from '@webb-dapp/wallet/account/Accounts.adapter';
import { EventBus } from '@webb-tools/app-util';

import { DepositPayload, MixerDeposit, MixerDepositEvents, MixerWithdraw, MixerWithdrawEvents } from './mixer';

export interface WebbMethods<T> {
  mixer: WebbMixer<T>;
}

export type WebbMethod<T extends EventBus<K>, K extends Record<string, unknown>> = {
  inner: T;
  enabled: boolean;
};

export interface WebbMixer<T> {
  // deposit
  deposit: WebbMethod<MixerDeposit<T, DepositPayload>, MixerDepositEvents>;
  // withdraw
  withdraw: WebbMethod<MixerWithdraw<T>, MixerWithdrawEvents>;
}

export interface WebbApiProvider<T> {
  accounts: AccountsAdapter<any>;
  methods: WebbMethods<T>;
}
