import { MixerSize } from '@webb-dapp/react-environment';
import { BehaviorSubject } from 'rxjs';

export abstract class WrapUnWrap<T, WrapPayload = any, UnwrapPayload = any> {
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
  abstract getTokensAddress(): Promise<string>;

  abstract canWrap(wrapPayload: WrapPayload): Promise<boolean>;
  abstract canWrap(unwrapPayload: UnwrapPayload): Promise<boolean>;

  // transaction has
  abstract wrap(wrapPayload: WrapPayload): Promise<string>;
  abstract unwrap(unwrapPayload: UnwrapPayload): Promise<string>;

  // todo add interfaces for infos , supply balance etc
}
