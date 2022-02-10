import { InternalChainId } from '@webb-dapp/apps/configs';
import { Bridge } from '@webb-dapp/react-environment/webb-context/bridge/bridge';
import { Currency } from '@webb-dapp/react-environment/webb-context/currency/currency';
import { BehaviorSubject, Observable } from 'rxjs';

import { DepositPayload, MixerDeposit } from '../mixer/mixer-deposit';

export abstract class BridgeDeposit<T, K extends DepositPayload = DepositPayload<any>> extends MixerDeposit<T, K> {
  private _activeBridge: Bridge | null = null;
  private emitter = new BehaviorSubject<null | Bridge>(null);
  readonly bridgeWatcher: Observable<null | Bridge>;

  constructor(inner: T) {
    super(inner);
    this.bridgeWatcher = this.emitter.asObservable();
  }

  get tokens() {
    return Bridge.getTokens();
  }

  setBridge(bridge: Bridge | null) {
    this._activeBridge = bridge;
    this.emitter.next(bridge);
  }

  get activeBridge() {
    return this._activeBridge;
  }

  getTokensOfChain(chainId: InternalChainId) {
    return Bridge.getTokensOfChain(chainId);
  }

  getWrappableAssets(chain: InternalChainId): Promise<Currency[]> {
    return Promise.resolve([]);
  }

  generateNote(mixerId: number | string): Promise<K> {
    throw new Error('api not ready:Not mixer api');
  }

  abstract generateBridgeNote(
    mixerId: number | string,
    destination: number,
    wrappableAssetAddress?: string
  ): Promise<K>;
}
