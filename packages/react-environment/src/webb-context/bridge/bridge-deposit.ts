import { BridgeConfig, BridgeCurrency, ChainId } from '@webb-dapp/apps/configs';
import { Currency } from '@webb-dapp/react-environment/types/currency';
import { Bridge } from '@webb-dapp/react-environment/webb-context/bridge/bridge';
import { BehaviorSubject, Observable } from 'rxjs';

import { DepositPayload, MixerDeposit } from '../mixer/mixer-deposit';

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
    return Bridge.getTokensOfChain(this.bridgeConfig, chainId);
  }

  getTokensOfChains(chainIds: ChainId[]) {
    return Bridge.getTokensOfChains(this.bridgeConfig, chainIds);
  }

  getWrappableAssets(chain: ChainId): Promise<Currency[]> {
    return Promise.resolve([]);
  }

  generateNote(mixerId: number | string): Promise<K> {
    throw new Error('api not ready:Not mixer api');
  }

  abstract generateBridgeNote(
    mixerId: number | string,
    destination: ChainId,
    wrappableAssetAddress?: string
  ): Promise<K>;
}
