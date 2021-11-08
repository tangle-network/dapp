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
    return this._currentTokenAddress;
  }

  abstract getSizes(): Promise<MixerSize[]>;

  /**
   * Wrapped token that is available for the current token
   *  */
  abstract getWrappedTokens(): Promise<BridgeCurrency[]>;

  /**
   * Wrapped token that is available for the current token
   *  */
  abstract getNativeTokens(): Promise<WebbCurrencyId[]>;

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
  abstract getGovernedTokens(): Promise<BridgeCurrency[]>;

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
