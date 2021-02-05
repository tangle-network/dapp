import EdgewareIcon from '../assets/coins-icon/EDG.svg';
import { ApiRx } from '@polkadot/api';
import { CurrencyId } from '@webb-tools/types/interfaces';
import { Token, TokenPair, currencyId2Token } from '@webb-tools/sdk-core';

export const TOKEN_IMAGES: Map<string, string> = new Map([['EDG', EdgewareIcon]]);

export const TOKEN_FULLNAMES: Map<string, string> = new Map([['EDG', 'Edgeware']]);

export const TOKEN_COLOR: Map<string, string> = new Map([
  ['SYSTEM', '#173DC9'],
  ['EDG', '#173dc9'],
]);

export const TOKEN_NAME: Map<string, string> = new Map([['EDG', 'EDG']]);

export const TOKEN_WEIGHT: Map<string, number> = new Map([['EDG', 0]]);

export function getTokenColor(token: string): string {
  return TOKEN_COLOR.get(token) || '#000000';
}

export function getTokenImage(token: string): string {
  return TOKEN_IMAGES.get(token) || '';
}

export function getTokenFullName(token: string): string {
  return TOKEN_FULLNAMES.get(token) || '';
}

export function getTokenName(token: string | string[] | CurrencyId): string {
  if (Array.isArray(token)) {
    return `${getTokenName(token[0])}-${getTokenName(token[1])}`;
  }

  if (typeof token === 'string') {
    return TOKEN_NAME.get(token) || '';
  }

  token = (token as any) as CurrencyId;

  if (token.isToken) {
    return getTokenName(token.asToken.toString());
  }

  if (token.isDexShare) {
    return `${getTokenName(token.asDexShare[0].toString())}-${getTokenName(token.asDexShare[1].toString())}`;
  }

  return '';
}

export function getCurrenciesFromDexShare(api: ApiRx, dexShare: CurrencyId): [CurrencyId, CurrencyId] {
  if (!dexShare.isDexShare) {
    return [dexShare, dexShare];
  }

  return [
    api.createType('CurrencyId' as any, { token: dexShare.asDexShare[0].toString() }),
    api.createType('CurrencyId' as any, { token: dexShare.asDexShare[1].toString() }),
  ];
}

export function getCurrencyIdFromName(api: ApiRx, name: string | string[]): CurrencyId {
  if (Array.isArray(name)) return api.createType('CurrencyId' as any, { DEXShare: name });

  return api.createType('CurrencyId' as any, { token: name });
}

export function sortCurrency(currency1?: CurrencyId, currency2?: CurrencyId): number {
  const currency1Weight = (currency1 ? TOKEN_WEIGHT.get(currency1?.asToken?.toString()) : 0) || 0;
  const currency2Weight = (currency2 ? TOKEN_WEIGHT.get(currency2?.asToken?.toString()) : 0) || 0;

  return currency1Weight - currency2Weight;
}
