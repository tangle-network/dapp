import { ChainId } from '@webb-dapp/apps/configs';
import { Bridge } from '@webb-dapp/react-environment/webb-context/bridge/bridge';
import { BridgeConfig } from '@webb-dapp/react-environment/webb-context/bridge/bridge-config';
import { BehaviorSubject, Observable } from 'rxjs';

import { DepositPayload, MixerDeposit } from '../mixer/mixer-deposit';

type BridgeState = {};

export abstract class BridgeDeposit<T, K extends DepositPayload = DepositPayload<any>> extends MixerDeposit<T, K> {
  abstract bridgeConfig: BridgeConfig;
  private _activeBridge: Bridge | null = null;
  private emitter = new BehaviorSubject<null | Bridge>(null);
  readonly bridgeWatcher: Observable<null | Bridge>;

  constructor(inner: T) {
    super(inner);
    this.bridgeWatcher = this.emitter.asObservable();
  }

  get tokens() {
    return Bridge.getTokens(this.bridgeConfig);
  }

  setBridge(bridge: Bridge | null) {
    this._activeBridge = bridge;
    this.emitter.next(bridge);
  }

  get activeBridge() {
    return this._activeBridge;
  }

  getTokensOfChain(chainId: ChainId) {
    return Bridge.GetTokensOfChain(this.bridgeConfig, chainId);
  }

  getTokensOfChains(chainIds: ChainId[]) {
    return Bridge.getTokensOfChains(this.bridgeConfig, chainIds);
  }
  abstract generateBridgeNote(mixerId: number | string, destination: ChainId): Promise<K>;
}
