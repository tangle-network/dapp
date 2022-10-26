import { Account } from '@nepoche/abstract-api-provider';
import { Chain, Wallet } from '@nepoche/dapp-config';
import { TypedChainId, WalletId } from '@nepoche/dapp-types';
import { EventBus } from '@webb-tools/app-util';

export type AppEvents = {
  changeNetworkSwitcherVisibility: boolean;
  networkSwitched: [TypedChainId, WalletId];
  switchNetwork: [Chain, Wallet];
  setActiveAccount: Account;
};

export class AppEvent extends EventBus<AppEvents> {
  public readonly send: <E extends keyof AppEvents>(event: E, data: AppEvents[E]) => void | Promise<void>;

  constructor() {
    super();
    this.send = this.emit;
  }
}

export type TAppEvent = InstanceType<typeof AppEvent>;
