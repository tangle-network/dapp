import { BridgeCurrency, MixerSize } from '@webb-dapp/react-environment';
import { BehaviorSubject } from 'rxjs';
import { WebbCurrencyId } from '@webb-dapp/apps/configs';

export abstract class WrapUnWrap<T, WrapPayload extends Object = any, UnwrapPayload extends Object = any> {
  private _currentTokenAddress: BehaviorSubject<string | null> = new BehaviorSubject<null | string>(null);
  // todo add events using the Rxjs
  constructor(protected inner: T) {}

  setCurrentToken(nextTokenAddress: string | null) {
    this._currentTokenAddress.next(nextTokenAddress);
  }

  get currentToken() {
    return this._currentTokenAddress.value;
  }

  get $currentTokenValue() {
    return this._currentTokenAddress;
  }

  abstract getSizes(): Promise<MixerSize[]>;
  abstract getWrappedTokens(): Promise<BridgeCurrency[]>;
  abstract getNativeTokens(): Promise<WebbCurrencyId[]>;

  abstract canWrap(wrapPayload: WrapPayload): Promise<boolean>;
  abstract canUnWrap(unwrapPayload: UnwrapPayload): Promise<boolean>;

  abstract getGovernedTokens(): Promise<BridgeCurrency[]>;

  // transaction has
  abstract wrap(wrapPayload: WrapPayload): Promise<string>;
  abstract unwrap(unwrapPayload: UnwrapPayload): Promise<string>;

  // todo add interfaces for infos , supply balance etc
}
