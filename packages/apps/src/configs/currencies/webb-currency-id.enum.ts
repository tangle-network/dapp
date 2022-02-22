// Do NOT change the ordering of this enum and always add to the end. Otherwise notes may break.
export enum WebbCurrencyId {
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
  webbWETH,
  DEV,
  webbDEV,
}

export function webbCurrencyIdToString(c: WebbCurrencyId): string {
  switch (c) {
    case WebbCurrencyId.EDG:
      return 'EDG';
    case WebbCurrencyId.TEDG:
      return 'TEDG';
    case WebbCurrencyId.ETH:
      return 'ETH';
    case WebbCurrencyId.ONE:
      return 'ONE';
    case WebbCurrencyId.WEBB:
      return 'WEBB';
    case WebbCurrencyId.SDN:
      return 'SDN';
    case WebbCurrencyId.WETH:
      return 'WETH';
    case WebbCurrencyId.MATIC:
      return 'MATIC';
    case WebbCurrencyId.webbWETH:
      return 'webbWETH';
    case WebbCurrencyId.DEV:
      return 'DEV';
    case WebbCurrencyId.webbDEV:
      return 'webbDEV';
  }
}

export function webbCurrencyIdFromString(c: string): WebbCurrencyId {
  switch (c) {
    case 'EDG':
      return WebbCurrencyId.EDG;
    case 'TEDG':
      return WebbCurrencyId.TEDG;
    case 'ETH':
      return WebbCurrencyId.ETH;
    case 'ONE':
      return WebbCurrencyId.ONE;
    case 'WEBB':
      return WebbCurrencyId.WEBB;
    case 'SDN':
      return WebbCurrencyId.SDN;
    case 'WETH':
      return WebbCurrencyId.WETH;
    case 'MATIC':
      return WebbCurrencyId.MATIC;
    case 'webbWETH':
      return WebbCurrencyId.webbWETH;
    case 'DEV':
      return WebbCurrencyId.DEV;
    case 'webbDEV':
      return WebbCurrencyId.webbDEV;
    default:
      throw new Error(`${c} isn't a valid WebbCurrencyId`);
  }
}
