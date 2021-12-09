export enum WebbNativeCurrencyId {
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
}

export function webbNativeCurrencyIdToString(c: WebbNativeCurrencyId): string {
  switch (c) {
    case WebbNativeCurrencyId.EDG:
      return 'EDG';
    case WebbNativeCurrencyId.TEDG:
      return 'TEDG';
    case WebbNativeCurrencyId.ETH:
      return 'ETH';
    case WebbNativeCurrencyId.ONE:
      return 'ONE';
    case WebbNativeCurrencyId.WEBB:
      return 'WEBB';
    case WebbNativeCurrencyId.SDN:
      return 'SDN';
  }
}

export function webbNativeCurrencyIdFromString(c: string): WebbNativeCurrencyId {
  switch (c) {
    case 'EDG':
      return WebbNativeCurrencyId.EDG;
    case 'TEDG':
      return WebbNativeCurrencyId.TEDG;
    case 'ETH':
      return WebbNativeCurrencyId.ETH;
    case 'ONE':
      return WebbNativeCurrencyId.ONE;
    case 'WEBB':
      return WebbNativeCurrencyId.WEBB;
    case 'SDN':
      return WebbNativeCurrencyId.SDN;
    default:
      throw new Error(`${c} isn't a valid WebbCurrencyId`);
  }
}
