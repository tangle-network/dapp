// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

export enum CurrencyId {
  /// Production edgeware token
  EDG,
  /// Test edgeware token
  TEDG,
  /// Ether token
  ETH,
  /// Harmony token
  ONE,
  /// WEBB
  WEBB,
  SDN,
  WETH,
  MATIC,
  webbETH,
  DEV,
  webbDEV,
  EGG,
  TEST,
  KSM,
  DOT,
  moonDEV,
  WEBBSQR,
  // Dynamic currency IDs should start after the last 'static' CurrencyId.
  DYNAMIC_CURRENCY_STARTING_ID = 1001,
}

export function webbCurrencyIdToString(c: CurrencyId): string {
  switch (c) {
    case CurrencyId.WEBB:
      return 'WEBB';
    case CurrencyId.webbETH:
      return 'webbETH';
    case CurrencyId.webbDEV:
      return 'webbDEV';
    case CurrencyId.EGG:
      return 'EGG';
    case CurrencyId.TEST:
      return 'TEST';
    default:
      throw new Error(`CurrencyId ${c} is not an ID of a webbCurrency`);
  }
}

export function webbCurrencyIdFromString(c: string): CurrencyId {
  switch (c) {
    case 'WEBB':
      return CurrencyId.WEBB;
    case 'webbETH':
      return CurrencyId.webbETH;
    case 'webbDEV':
      return CurrencyId.webbDEV;
    case 'EGG':
      return CurrencyId.EGG;
    case 'TEST':
      return CurrencyId.TEST;
    default:
      throw new Error(`${c} isn't the name of a valid Webb currency`);
  }
}
