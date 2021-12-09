import { WebbNativeCurrencyId } from '@webb-dapp/apps/configs';
import { MixerSize } from '@webb-dapp/react-environment';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

/**
 *
 * */
export type WrappingTokenId = {
  variant: 'native-token' | 'governed-token';
  id: WebbNativeCurrencyId | string;
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
export type WrappingBalance = {
  tokenId?: WrappingTokenId;
  balance: string;
};

/**
 * Webb wrap unwrap functionality
 * Stores two tokens of type {WrappingTokenId}
 * currentToken , otherEdgeToken
 *  wrap => GovernWrapper<currentToken> and use otherEdgeToken as parameter
 *  unwrap GovernWrapper<otherEdgeToken> and use currentToken as parameter
 * */

export abstract class WrapUnWrap<T, WrapPayload extends Amount = Amount, UnwrapPayload extends Amount = Amount> {
  private _currentTokenAddress: BehaviorSubject<WrappingTokenId | null> = new BehaviorSubject<null | WrappingTokenId>(
    null
  );
  private _otherEdgeToken: BehaviorSubject<WrappingTokenId | null> = new BehaviorSubject<null | WrappingTokenId>(null);

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
   *  Other EDG token
   *  */
  get otherEdgToken() {
    return this._otherEdgeToken.value;
  }

  /**
   *  Watcher for other edg token
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
   *  Get list of all the Governed tokens
   * */
  abstract getGovernedTokens(): Promise<WrappingTokenId[]>;

  /**
   *  For validation pre the Wrapping
   *  - Validate the user balance of the token to wrap
   *  - If Wrapping native check if the native token is allowed to be wrapped
   * */
  abstract canWrap(wrapPayload: WrapPayload): Promise<boolean>;

  /**
   *  Wrap call
   *  - Can wrap a token to a GovernedToken
   *  - Can wrap a token to an ERC20
   * */
  abstract wrap(wrapPayload: WrapPayload): Promise<string>;

  /**
   *  For validation
   *  -	Check there is enough liquidity
   *  - If UnWrapping to native check if this allowed
   * */
  abstract canUnWrap(unwrapPayload: UnwrapPayload): Promise<boolean>;

  /**
   *  Unwrap call
   *  - Can Unwrap a token to a GovernedToken
   * */
  abstract unwrap(unwrapPayload: UnwrapPayload): Promise<string>;

  /**
   * Observing the balances of the two edges
   * */
  abstract get balances(): Observable<[WrappingBalance, WrappingBalance]>;

  /**
   * Observing the liquidity of the two edges
   * */
  abstract get liquidity(): Observable<[WrappingBalance, WrappingBalance]>;
}

export class WrappingBalanceWatcher {
  private subscription: Subscription | null = null;

  constructor(
    private token1: WrappingTokenId | null = null,
    private token2: WrappingTokenId | null = null,
    private signal: Observable<[WrappingTokenId | null, WrappingTokenId | null]>
  ) {
    this.sub();
  }

  sub() {
    this.subscription = this.signal.subscribe(([token1, token2]) => {
      const token1Updated = token1 !== this.token1;
      const token2Updated = token2 !== this.token2;
      if (token1Updated) {
        this.token1 = token1;
      }
      if (token2Updated) {
        this.token2 = token2;
      }
      // **one exists**
      // ==>one is native
      // --->> current account balance
      //  one is governed
      // --->> current account balance
      // --->> contract balance

      // two exits
      // ==>one is native
      // --->> current account balance
      // --->> contract balance
      // ==>two are governed

      // --->> current account balance
      // --->> current account balance
    });
  }
}
