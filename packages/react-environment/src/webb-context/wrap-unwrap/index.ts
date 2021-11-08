import { MixerSize } from '@webb-dapp/react-environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { WebbCurrencyId } from '@webb-dapp/apps/configs';

/**
 *
 * */
export type WrappingTokenId = {
  variant: 'native-token' | 'governed-token';
  id: WebbCurrencyId | string;
};

export type WrappingEvent = {
  ready: null;
  stateUpdate: null;
  wrappedTokens: WrappingTokenId[];
  nativeTokensUpdate: WrappingTokenId[];
  governedTokensUpdate: WrappingTokenId[];
};
export type WrappingEventNames = keyof WrappingEvent;
export type Amount = {
  amount: number | string;
};

export abstract class WrapUnWrap<T, WrapPayload extends Amount = Amount, UnwrapPayload extends Amount = Amount> {
  private _currentTokenAddress: BehaviorSubject<WrappingTokenId | null> = new BehaviorSubject<null | WrappingTokenId>(
    null
  );
  private _otherEdgeToken: BehaviorSubject<WrappingTokenId | null> = new BehaviorSubject<null | WrappingTokenId>(null);

  // todo add events using the Rxjs
  constructor(protected inner: T) {}

  abstract get subscription(): Observable<Partial<WrappingEvent>>;

  setCurrentToken(nextTokenAddress: WrappingTokenId | null) {
    this._currentTokenAddress.next(nextTokenAddress);
  }

  /**
   *  Current token
   *  */
  get currentToken() {
    return this._currentTokenAddress.value;
  }

  /**
   *  watcher of the current token
   *  */
  get $currentTokenValue() {
    return this._currentTokenAddress.asObservable();
  }

  setOtherEdgToken(nextTokenAddress: WrappingTokenId | null) {
    this._otherEdgeToken.next(nextTokenAddress);
  }

  /**
   *  Current token
   *  */
  get otherEdgToken() {
    return this._otherEdgeToken.value;
  }

  /**
   *  watcher of the current token
   *  */
  get $otherEdgeToken() {
    return this._otherEdgeToken.asObservable();
  }

  abstract getSizes(): Promise<MixerSize[]>;

  /**
   * Wrapped token that is available for the current token
   *  */
  abstract getWrappedTokens(): Promise<WrappingTokenId[]>;

  /**
   * Wrapped token that is available for the current token
   *  */
  abstract getNativeTokens(): Promise<WrappingTokenId[]>;

  /**
   *  For validation
   * */
  abstract canWrap(wrapPayload: WrapPayload): Promise<boolean>;

  /**
   *  For validation
   * */
  abstract canUnWrap(unwrapPayload: UnwrapPayload): Promise<boolean>;

  /**
   *  Get list of all the Governed tokens
   * */
  abstract getGovernedTokens(): Promise<WrappingTokenId[]>;

  /**
   *  Wrap call
   *  - Can wrap a token to a GovernedToken
   *  - Can wrap a token to an ERC20
   * */
  abstract wrap(wrapPayload: WrapPayload): Promise<string>;

  /**
   *  UNwrap call
   *  - Can Unwrap a token to a GovernedToken
   *  - Can Unwrap a token to an ERC20
   * */
  abstract unwrap(unwrapPayload: UnwrapPayload): Promise<string>;

  // todo add interfaces for infos , supply balance etc
}
