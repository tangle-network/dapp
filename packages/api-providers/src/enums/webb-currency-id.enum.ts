// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

// Do NOT change the ordering of this enum and always add to the end. Otherwise notes may break.

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
}

export function webbCurrencyIdToString(c: CurrencyId): string {
  switch (c) {
    case CurrencyId.EDG:
      return 'EDG';
    case CurrencyId.TEDG:
      return 'TEDG';
    case CurrencyId.ETH:
      return 'ETH';
    case CurrencyId.ONE:
      return 'ONE';
    case CurrencyId.WEBB:
      return 'WEBB';
    case CurrencyId.SDN:
      return 'SDN';
    case CurrencyId.WETH:
      return 'WETH';
    case CurrencyId.MATIC:
      return 'MATIC';
    case CurrencyId.webbETH:
      return 'webbETH';
    case CurrencyId.DEV:
      return 'DEV';
    case CurrencyId.webbDEV:
      return 'webbDEV';
    case CurrencyId.EGG:
      return 'EGG';
    case CurrencyId.TEST:
      return 'TEST';
    case CurrencyId.KSM:
      return 'KSM';
    case CurrencyId.DOT:
      return 'DOT';
    case CurrencyId.moonDEV:
      return 'moonDEV';
  }
}

export function webbCurrencyIdFromString(c: string): CurrencyId {
  switch (c) {
    case 'EDG':
      return CurrencyId.EDG;
    case 'TEDG':
      return CurrencyId.TEDG;
    case 'ETH':
      return CurrencyId.ETH;
    case 'ONE':
      return CurrencyId.ONE;
    case 'WEBB':
      return CurrencyId.WEBB;
    case 'SDN':
      return CurrencyId.SDN;
    case 'WETH':
      return CurrencyId.WETH;
    case 'MATIC':
      return CurrencyId.MATIC;
    case 'webbETH':
      return CurrencyId.webbETH;
    case 'DEV':
      return CurrencyId.DEV;
    case 'webbDEV':
      return CurrencyId.webbDEV;
    case 'EGG':
      return CurrencyId.EGG;
    case 'TEST':
      return CurrencyId.TEST;
    case 'KSM':
      return CurrencyId.KSM;
    case 'DOT':
      return CurrencyId.DOT;
    case 'moonDEV':
      return CurrencyId.moonDEV;
    default:
      throw new Error(`${c} isn't a valid WebbCurrencyId`);
  }
}
