import {Account} from '@webb-tools/abstract-api-provider';
import {Chain, Wallet} from '@webb-tools/dapp-config';
import {TypedChainId, WalletId} from '@webb-tools/dapp-types';
import {EventBus} from '@webb-tools/app-util';
import {BehaviorSubject} from 'rxjs';

export type AppEvents = {
  changeNetworkSwitcherVisibility: boolean;
  networkSwitched: [TypedChainId, WalletId];
  switchNetwork: [Chain, Wallet];
  walletConnectionState: 'idle' | 'loading' | 'sucess' | 'failed';
  setActiveAccount: Account;
};

export enum CurrentConnectionStatus {
  /**
   * The wallet is connected and the current active chain is both on the wallet and the DApp side
   * */
  Ideal,
  /**
   * The wallet connection is distributed by some reason
   * */
  Distributed,
  /**
   * The wallet is being changed to another wallet/network
   * */
  Switching
}

export enum NextConnectionStatus {
  /**
   * Connection is being processed
   * */
  InProgress,
  /**
   * Connection has failed
   * */
  Failed
}

type ConnectionStatus<Value, ConnectionStatus> = {
  /**
   * Connection value type
   * */
  connectionValue: Value,
  /**
   * Connection status
   * */
  status: ConnectionStatus,
  /**
   * Description message for the current status
   * */
  note?: string
}

/**
 * Current selected network -> could be undefined
 *  - Connected,Connecting,Failure,Switching
 * Next network -> Could be undefined
 *  - Connected - connecting - failed to connect
 *
 * */
export class NetworkManger {

  private _currentConnection = new BehaviorSubject<ConnectionStatus<[TypedChainId, WalletId], CurrentConnectionStatus> | null>(null);
  private _nextConnection = new BehaviorSubject<ConnectionStatus<[Chain, Wallet], NextConnectionStatus> | null>(null);
  private _activeAccount = new BehaviorSubject<Account | null>(null);


  get $currentConnection() {
    return this._currentConnection.asObservable()
  }

  get currentConnection() {
    return this._currentConnection.value
  }


  get $nextConnection() {
    return this._nextConnection.asObservable()
  }

  get nextConnection() {
    return this._nextConnection.value
  }


  get $activeAccount() {
    return this._activeAccount.asObservable()
  }

  get activeAccount() {
    return this._activeAccount.value
  }

  set activeAccount(account: Account | null) {
    this._activeAccount.next(account)
  }





}

export class AppEvent extends EventBus<AppEvents> {

  public readonly send: <E extends keyof AppEvents>(
    event: E,
    data: AppEvents[E]
  ) => void | Promise<void>;

  constructor() {
    super();
    this.send = this.emit;
  }
}

export type TAppEvent = InstanceType<typeof AppEvent>;
