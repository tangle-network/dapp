// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { Observable } from 'rxjs';

import { Currency } from '../currency';

/**
 *
 **/

export type WrappingEvent = {
  ready: null;
  stateUpdate: null;
  wrappableTokenUpdate: Currency | null;
  governedTokenUpdate: Currency | null;
};
export type WrappingEventNames = keyof WrappingEvent;
export type Amount = {
  amount: number | string;
};
export type WrappingBalance = {
  token?: Currency;
  balance: string;
};

/**
 * Webb wrap unwrap functionality.
 * Contains the methods used for making the appropriate provider calls to
 * perform currency wrapping or unwrapping
 **/
export abstract class WrapUnwrap<T, WrapPayload extends Amount = Amount, UnwrapPayload extends Amount = Amount> {
  constructor(protected inner: T) {}

  abstract get subscription(): Observable<Partial<WrappingEvent>>;

  /**
   *  For validation pre the Wrapping
   *  - Validate the user balance of the token to wrap
   *  - If Wrapping native check if the native token is allowed to be wrapped
   **/
  abstract canWrap(wrapPayload: WrapPayload): Promise<boolean>;

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
}
