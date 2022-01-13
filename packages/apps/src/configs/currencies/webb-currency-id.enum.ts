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
    default:
      throw new Error(`${c} isn't a valid WebbCurrencyId`);
  }
}
