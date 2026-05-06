import { Account } from '@tangle-network/abstract-api-provider';
import { EventBus } from '@tangle-network/dapp-types/EventBus';
import { Chain, Wallet } from '@tangle-network/dapp-config';
import { TypedChainId, WalletId, WebbError } from '@tangle-network/dapp-types';

type WalletConnectionStatus = 'idle' | 'loading' | 'sucess' | 'failed';

export type AppEvents = {
  changeNetworkSwitcherVisibility: boolean;
  networkSwitched: [TypedChainId, WalletId];
  switchNetwork: [Chain, Wallet];
  walletConnectionState: {
    typedChainId: TypedChainId;
    error?: WebbError;
    status: WalletConnectionStatus;
    walletId: WalletId;
  };
  setActiveAccount: Account;
};

export class AppEvent extends EventBus<AppEvents> {
  public readonly send: <E extends keyof AppEvents>(
    event: E,
    data: AppEvents[E],
  ) => void | Promise<void>;

  constructor() {
    super();
    this.send = this.emit;
  }
}

export type TAppEvent = InstanceType<typeof AppEvent>;
