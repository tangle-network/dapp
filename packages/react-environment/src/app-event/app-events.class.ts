import { Chain, Wallet } from '@webb-dapp/react-environment';
import { Account } from '@webb-dapp/wallet/account/Accounts.adapter';
import { EventBus } from '@webb-tools/app-util';

export type AppEvents = {
  changeNetworkSwitcherVisibility: boolean;
  switchNetwork: [Chain, Wallet];
  setActiveAccount: Account;
};

class AppEvent extends EventBus<AppEvents> {
  public readonly send: <E extends keyof AppEvents>(event: E, data: AppEvents[E]) => void | Promise<void>;
  constructor() {
    super();
    this.send = this.emit;
  }
}

export const appEvent = new AppEvent();
