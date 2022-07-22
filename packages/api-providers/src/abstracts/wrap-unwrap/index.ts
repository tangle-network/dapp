// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { CurrencyId } from '../../enums';
import { MixerSize } from '../mixer';

/**
 *
 **/

export type WrappingEvent = {
  ready: null;
  stateUpdate: null;
  wrappableTokenUpdate: CurrencyId | null;
  governedTokenUpdate: CurrencyId | null;
};
export type WrappingEventNames = keyof WrappingEvent;
export type Amount = {
  amount: number | string;
};
export type WrappingBalance = {
  tokenId?: CurrencyId;
  balance: string;
};

/**
 * Webb wrap unwrap functionality
 * Stores two tokens of type WrappingTokenId
 * currentToken, otherEdgeToken
 *  wrap  Governwrapper<currentToken> and use otherEdgeToken as parameter
 *  unwrap Governwrapper<otherEdgeToken> and use currentToken as parameter
 **/

export abstract class WrapUnwrap<T, WrapPayload extends Amount = Amount, UnwrapPayload extends Amount = Amount> {
  protected _wrappableToken: BehaviorSubject<CurrencyId | null> = new BehaviorSubject<null | CurrencyId>(null);
  protected _governedToken: BehaviorSubject<CurrencyId | null> = new BehaviorSubject<null | CurrencyId>(null);

  constructor(protected inner: T) {}

  abstract get subscription(): Observable<Partial<WrappingEvent>>;

  setGovernedToken(nextToken: CurrencyId | null) {
    this._governedToken.next(nextToken);
  }

  /**
   *  Current token
   *  */
  get governedToken() {
    return this._governedToken.value;
  }

  /**
   *  watcher of the current token
   *  */
  get $governedToken() {
    return this._governedToken.asObservable();
  }

  setWrappableToken(nextToken: CurrencyId | null) {
    this._wrappableToken.next(nextToken);
  }

  /**
   *  Other EDG token
   *  */
  get wrappableToken() {
    return this._wrappableToken.value;
  }

  /**
   *  Watcher for other edg token
   *  */
  get $wrappableToken() {
    return this._wrappableToken.asObservable();
  }

  abstract getSizes(): Promise<MixerSize[]>;

  /**
   * WrappableTokens available for display,
   * If a governedTokenId is passed in, get wrappable tokens for that governedTokenId
   *  */
  abstract getWrappableTokens(governedTokenId?: CurrencyId | null): Promise<CurrencyId[]>;

  /**
   *  Get list of all the Governed tokens
   **/
  abstract getGovernedTokens(): Promise<CurrencyId[]>;

  /**
   *  For validation pre the Wrapping
   *  - Validate the user balance of the token to wrap
   *  - If Wrapping native check if the native token is allowed to be wrapped
   **/
  abstract canwrap(wrapPayload: WrapPayload): Promise<boolean>;

  /**
   *  Wrap call
   *  - Can wrap a token to a GovernedToken
   *  - Can wrap a token to an ERC20
   **/
  abstract wrap(wrapPayload: WrapPayload): Promise<string>;

  /**
   *  For validation
   *  -Check there is enough liquidity
   *  -If Unwrapping to native check if this allowed
   **/
  abstract canUnwrap(unwrapPayload: UnwrapPayload): Promise<boolean>;

  /**
   *  Unwrap call
   *  - Can Unwrap a token to a GovernedToken
   **/
  abstract unwrap(unwrapPayload: UnwrapPayload): Promise<string>;

  /**
   * Observing the balances of the two edges
   **/
  abstract get balances(): Observable<[WrappingBalance, WrappingBalance]>;

  /**
   * Observing the liquidity of the two edges
   **/
  abstract get liquidity(): Observable<[WrappingBalance, WrappingBalance]>;
}

export class WrappingBalanceWatcher {
  private subscription: Subscription | null = null;

  constructor(
    private token1: CurrencyId | null = null,
    private token2: CurrencyId | null = null,
    private signal: Observable<[CurrencyId | null, CurrencyId | null]>
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

      console.log(this.subscription);
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
